import axios from "axios";
import moment from "moment";
import cron from "node-cron";
import { Op } from "sequelize";
import db from "../models/index.js";
import PAYHERO from "../config/payheroConfig.js";
import { resolveSubscriptionPlan } from "../utils/subscriptionPlans.js";
import { buildPaymentLookupCandidates, extractPayHeroPayload, isSuccessfulPayHeroPayload, parseExternalReference } from "../utils/payheroFlow.js";
import { imageUploadUtil } from "../utils/cloudinary.js";

const { Payments, Users, sequelize } = db;

const encodedCredentials = Buffer.from(`${PAYHERO.API_USERNAME}:${PAYHERO.API_PASSWORD}`).toString("base64");

const logPaymentEvent = (event, details = {}) => {
  console.log(`[payhero:${event}]`, JSON.stringify(details));
};

const normalizeUserType = (userType) => {
  if (!userType) {
    return "client";
  }

  return userType === "premium" ? "vip" : userType;
};

const buildPaymentStatusFromPayload = (payload = {}) => {
  const rawStatus =
    payload?.Status ??
    payload?.status ??
    payload?.paymentStatus ??
    payload?.payment_status ??
    "";

  const resultCode =
    payload?.ResultCode ??
    payload?.resultCode ??
    payload?.result_code ??
    "";

  const status = String(rawStatus).trim().toUpperCase();

  if (
    String(resultCode).trim() === "0" ||
    ["SUCCESS", "SUCCESSFUL", "PAID", "COMPLETED", "COMPLETE"].includes(status)
  ) {
    return "SUCCESS";
  }

  if (["FAILED", "FAILURE"].includes(status)) {
    return "FAILED";
  }

  if (["CANCELLED", "CANCELED"].includes(status)) {
    return "CANCELLED";
  }

  return "QUEUED";
};


const handlePayheroVerification = async (checkoutRequestId) => {
  try {
    const response = await axios.get(`https://backend.payhero.co.ke/api/v2/payments/${checkoutRequestId}`, {
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    });

    return response.data;
  } catch (error) {
    logPaymentEvent("payment_verification_failed", {
      checkoutRequestId,
      message: error?.response?.data?.message || error.message,
    });
    throw error;
  }
};

cron.schedule("0 * * * *", async () => {
  try {
    const expiredUsers = await Users.findAll({
      where: {
        accessExpiration: { [Op.lte]: new Date() },
        userType: "vip",
      },
    });

    for (const user of expiredUsers) {
      await Users.update({ userType: "client" }, { where: { id: user.id } });
      console.log(`User ${user.id} reset to 'client' due to expiry.`);
    }
  } catch (error) {
    console.error("Cron error:", error.message);
  }
});

export const initiatePayheroSTKPush = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await Users.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { phone, phoneNumber, selectedPlan } = req.body;
    const paymentPhone = phone || phoneNumber;

    if (!paymentPhone || !selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Phone and subscription plan are required.",
      });
    }

    const resolvedPlan = resolveSubscriptionPlan({ planRef: selectedPlan });
    if (!resolvedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan.",
      });
    }

    // Use KES amount for M-Pesa (shared plans include amountKes)
    const paymentAmount = Number(resolvedPlan.amountKes || (resolvedPlan.amountUsd || resolvedPlan.amount) * 130);
    const formattedPhone = paymentPhone.startsWith("0") ? `254${paymentPhone.slice(1)}` : paymentPhone;
    const externalReference = `INV-${user.id}-${resolvedPlan.id}`;

    logPaymentEvent("payment_request_created", {
      userId: user.id,
      selectedPlan: resolvedPlan.id,
      amount: paymentAmount,
      phone: formattedPhone,
    });

    const callbackUrl = process.env.PAYMENT_CALLBACK_URL || "https://monster-tipsters-xyra.onrender.com/api/payment/callback";
    if (!callbackUrl) {
      return res.status(500).json({
        success: false,
        message: "PAYMENT_CALLBACK_URL is not configured.",
      });
    }

    const response = await axios.post(
      "https://backend.payhero.co.ke/api/v2/payments",
      {
        amount: paymentAmount,
        phone_number: formattedPhone,
        channel_type: PAYHERO.CHANNEL_TYPE,
        channel_id: PAYHERO.CHANNEL_ID,
        till_number: PAYHERO.TILL_NUMBER,
        business_name: PAYHERO.BUSINESS_NAME,
        provider: "m-pesa",
        external_reference: externalReference,
        callback_url: callbackUrl,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedCredentials}`,
        },
      }
    );

    
const checkoutRequestId =
  response.data?.CheckoutRequestID ??
  response.data?.checkoutRequestId ??
  response.data?.checkout_request_id ??
  response.data?.CheckoutRequestId ??
  null;
    const existingPayment = checkoutRequestId
      ? await Payments.findOne({ where: { checkoutRequestId } })
      : null;

    if (!existingPayment) {
      await Payments.create({
        amount: paymentAmount,
        phoneNumber: formattedPhone,
        status: "QUEUED",
        reference: externalReference,
        checkoutRequestId,
        paymentMethod: "MPESA",
        userId: user.id,
      });
    }

    logPaymentEvent("stk_push_initiated", {
      userId: user.id,
      checkoutRequestId,
      reference: externalReference,
    });

    return res.status(200).json({
      success: true,
      message: "STK Push sent. Check your phone.",
      data: response.data,
    });
  } catch (error) {
    console.error("❌ PayHero STK Push Error");
  console.error("Message:", error.message);
  console.error("Status:", error.response?.status);
  console.error("Response:", JSON.stringify(error.response?.data, null, 2));

  logPaymentEvent("payment_request_failed", {
    message: error.message,
    status: error.response?.status,
    response: error.response?.data,
  });

  return res.status(500).json({
    success: false,
    message:
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to initiate payment. Try again.",
    details: error?.response?.data || error.message,
  });
  }
};

export const handleCallback = async (req, res) => {
  try {
    console.log("PayHero callback received");
    console.log(JSON.stringify(req.body, null, 2));

    logPaymentEvent("callback_received", {
      body: req.body,
    });

    const payload = extractPayHeroPayload(req.body);
    console.log("callback metadata", payload);
    
    if (!payload || typeof payload !== "object") {
      logPaymentEvent("callback_invalid_payload", { body: req.body });
      console.log("invalid callback metadata")
      return res.status(400).json({
        success: false,
        message: "Invalid callback payload structure.",
      });
    }

    const {
      Amount: amount,
      Phone: phoneNumber,
      Status: status,
      MpesaReceiptNumber: mpesaReceiptNumber,
      CheckoutRequestID: checkoutRequestId,
      ExternalReference: reference,
      MerchantReference: merchantReference,
      ResultCode: resultCode,
    } = payload;

    
    const normalizedStatus = buildPaymentStatusFromPayload(payload);
    const success = isSuccessfulPayHeroPayload(payload);

    const externalReferenceValue = reference || payload?.externalReference || payload?.ExternalReference || null;
    const parsedReference = parseExternalReference(externalReferenceValue);
    const userId = parsedReference?.userId || null;
    const planRef = parsedReference?.planRef || payload?.planRef || null;

    if (!checkoutRequestId && !externalReferenceValue) {
      logPaymentEvent("callback_missing_identifiers", { payload });
      return res.status(400).json({
        success: false,
        message: "Callback payload is missing a payment identifier.",
      });
    }

    let user = null;
    if (userId) {
      user = await Users.findByPk(userId);
    }

    if (!user) {
      logPaymentEvent("callback_user_not_found", { userId, checkoutRequestId, reference: externalReferenceValue });
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // PayHero callbacks send Amount in KES for M-Pesa. Convert to USD for lookup.
    const numericAmount = Number(amount);
    
    const resolvedPlan = resolveSubscriptionPlan({ planRef});
    if (!resolvedPlan) {
      logPaymentEvent("callback_invalid_plan", { amount, planRef, reference: externalReferenceValue });
      return res.status(400).json({ success: false, message: "Invalid payment amount or plan." });
    }

    // Verify KES amount matches expected plan KES amount
    if (Number(amount) !== Number(resolvedPlan.amountKes)) {
      logPaymentEvent("callback_amount_mismatch", { amount, expectedAmountKes: resolvedPlan.amountKes, reference: externalReferenceValue });
      return res.status(400).json({ success: false, message: "Amount does not match the selected plan." });
    }

    const paymentLookupCandidates = buildPaymentLookupCandidates({
      checkoutRequestId,
      reference: externalReferenceValue,
      externalReference: externalReferenceValue,
      merchantReference,
    });

    let payment = null;

for (const candidate of paymentLookupCandidates) {
  payment = await Payments.findOne({ where: candidate });

  if (payment) {
    logPaymentEvent("payment_found", {
      checkoutRequestId,
      reference: externalReferenceValue,
      candidate,
    });
    break;
  }
}
    //const accessExpiration = moment().add(Number(resolvedPlan.durationDays || resolvedPlan.duration || 0), "days").toDate();
const now = moment();
const currentExpiration = user.accessExpiration
  ? moment(user.accessExpiration)
  : null;

const baseDate =
  currentExpiration && currentExpiration.isAfter(now)
    ? currentExpiration
    : now;

const accessExpiration = baseDate
  .clone()
  .add(
    Number(
      resolvedPlan.durationDays ||
      resolvedPlan.duration ||
      0
    ),
    "days"
  )
  .toDate();
    if (success) {
      await sequelize.transaction(async (transaction) => {
        if (!payment) {
          payment = await Payments.create(
            {
              amount,
              phoneNumber,
              status: normalizedStatus,
              reference: externalReferenceValue,
              checkoutRequestId,
              mpesaReceiptNumber,
              callbackPayload: JSON.stringify(req.body),
              paidAt: new Date(),
              planId: resolvedPlan.id,
              userId: user.id,
            },
            { transaction }
          );
        } else {
          await payment.update(
            {
              status: normalizedStatus,
              mpesaReceiptNumber,
              callbackPayload: JSON.stringify(req.body),
              paidAt: payment.paidAt || new Date(),
            },
            { transaction }
          );
          logPaymentEvent("payment_updated", {
            paymentId: payment.id,
            checkoutRequestId,
            status: normalizedStatus,
          });
        }

        const normalizedUserType = normalizeUserType(resolvedPlan.userType);

        await user.update(
          {
            userType: normalizedUserType,
            accessExpiration,
          },
          { transaction }
        );
        logPaymentEvent("user_updated", {
          userId: user.id,
          userType: normalizedUserType,
          accessExpiration,
        });
      });

      logPaymentEvent("subscription_activated", {
        userId: user.id,
        checkoutRequestId,
        plan: resolvedPlan.id,
      });
    } else {
      if (!payment) {
        payment = await Payments.create({
          amount,
          phoneNumber,
          status: normalizedStatus,
          reference: externalReferenceValue,
          checkoutRequestId,
          mpesaReceiptNumber,
          callbackPayload: JSON.stringify(req.body),
          userId: user.id,
        });
      } else {
        await payment.update({
          status: normalizedStatus,
          mpesaReceiptNumber,
          callbackPayload: JSON.stringify(req.body),
        });
        logPaymentEvent("payment_updated", {
          paymentId: payment.id,
          checkoutRequestId,
          status: normalizedStatus,
        });
      }

      logPaymentEvent("payment_failed", {
        userId: user.id,
        checkoutRequestId,
        reason: normalizedStatus,
        resultCode,
      });
    }

    logPaymentEvent("callback_completed", {
      userId: user.id,
      checkoutRequestId,
      status: normalizedStatus,
      success,
    });

    return res.status(200).json({
      success: true,
      message: success ? "Payment processed. Access granted." : "Payment status updated.",
      data: payment,
    });
  } catch (error) {
    logPaymentEvent("callback_error", { message: error.message });
    return res.status(500).json({ success: false, message: "Failed to handle callback." });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payzments = await Payments.findAll({
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "email", "name", "phoneNumber", "userType", "accessExpiration"],
        },
        {
          model: Users,
          as: "reviewer",
          attributes: ["id", "email", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully.",
      data: payzments,
    });
  } catch (error) {
    console.error("Payment history error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve payment history." });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user?.id;
    const payzments = await Payments.findAll({
      where: { userId },
      include: [
        {
          model: Users,
          as: "reviewer",
          attributes: ["id", "email", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Your payments were retrieved successfully.",
      data: payzments,
    });
  } catch (error) {
    console.error("My payments error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve your payments." });
  }
};

export const getPaymentConfig = async (_req, res) => {
  try {
    const trc20Address = process.env.TRC20_USDT_ADDRESS;

    if (!trc20Address) {
      return res.status(500).json({
        success: false,
        message: "TRC20 wallet address is not configured.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        currency: "USDT",
        network: "TRC20",
        address: trc20Address,
      },
    });
  } catch (error) {
    console.error("Payment config error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve payment configuration." });
  }
};

export const createManualPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { selectedPlan, amount, reference } = req.body;
    const resolvedPlan = resolveSubscriptionPlan({ planRef: selectedPlan, amount });

    if (!resolvedPlan) {
      return res.status(400).json({ success: false, message: "Invalid subscription plan." });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Payment screenshot is required." });
    }

    const uploaded = await imageUploadUtil({ buffer: req.file.buffer });
    const paymentAmount = Number(resolvedPlan.amount);

    
const payment = await Payments.create({
  amount: paymentAmount,
  phoneNumber: user.phoneNumber,
  status: "PENDING",
  reference: reference || null,
  planId: resolvedPlan.id,
  paymentMethod: "USDT",
  network: "TRC20",
  screenshotUrl: uploaded.secure_url,
  userId,
});
    return res.status(201).json({
      success: true,
      message: "Payment submitted. A review will be completed shortly.",
      data: payment,
    });
  } catch (error) {
    console.error("Create manual payment error:", error.message);
    return res.status(500).json({ success: false, message: error.message || "Failed to submit payment." });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payments.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    // If the stored payment amount was an MPESA (KES) amount, convert to USD for resolution
    let resolutionAmount = payment.amount;
    if (payment.paymentMethod && String(payment.paymentMethod).toUpperCase() === "MPESA") {
      resolutionAmount = Number(payment.amount) / 130;
    }

    const resolvedPlan = resolveSubscriptionPlan({ planRef: payment.planId, amount: resolutionAmount });
    if (!resolvedPlan) {
      return res.status(400).json({ success: false, message: "Unable to resolve payment plan." });
    }

    const user = await Users.findByPk(payment.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Associated user not found." });
    }

    const accessExpiration = moment().add(Number(resolvedPlan.durationDays || resolvedPlan.duration || 0), "days").toDate();
    const normalizedUserType = normalizeUserType(resolvedPlan.userType);

    await sequelize.transaction(async (transaction) => {
      await payment.update(
        {
          status: "APPROVED",
          rejectionReason: null,
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          paidAt: payment.paidAt || new Date(),
        },
        { transaction }
      );

      await user.update(
        {
          userType: normalizedUserType,
          accessExpiration,
        },
        { transaction }
      );
    });

    return res.status(200).json({ success: true, message: "Payment approved and user upgraded.", data: payment });
  } catch (error) {
    console.error("Approve payment error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to approve payment." });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { rejectionReason } = req.body;
    const allowedRejectionReasons = [
  "WRONG_AMOUNT",
  "WRONG_NETWORK",
  "INVALID_TRANSACTION",
  "SCREENSHOT_UNCLEAR",
  "SCREENSHOT_INVALID",
  "PAYMENT_NOT_FOUND",
  "DUPLICATE_PAYMENT",
  "PAYMENT_ALREADY_USED",
  "OTHER",
];

if (!allowedRejectionReasons.includes(rejectionReason)) {
  return res.status(400).json({
    success: false,
    message: "Invalid rejection reason.",
    allowedReasons: allowedRejectionReasons,
  });
}
    
    const payment = await Payments.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    

    await payment.update({
  status: "REJECTED",
  rejectionReason,
  reviewedBy: req.user.id,
  reviewedAt: new Date(),
});

    return res.status(200).json({ success: true, message: "Payment rejected.", data: payment });
  } catch (error) {
    console.error("Reject payment error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}


export const getPaymentStatus = async (req, res) => {
  try {
    const { checkoutId } = req.params;

    const payment = await Payments.findOne({
      where: {
        checkoutRequestId: checkoutId,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const isPendingState = [
      "QUEUED",
      "PENDING",
      "Pending",
      "Processing",
      "processing",
    ].includes(String(payment.status || ""));

    if (isPendingState && payment.checkoutRequestId) {
      try {
        console.log("[PayHero] Starting payment verification", {
          paymentId: payment.id,
          checkoutRequestId: payment.checkoutRequestId,
          databaseStatus: payment.status,
          reference: payment.reference,
        });

        const verification = await handlePayheroVerification(
          payment.checkoutRequestId
        );

        console.log("[PayHero] Raw verification response", {
          paymentId: payment.id,
          verification,
        });

        const payload = extractPayHeroPayload(verification);

        console.log("[PayHero] Extracted verification payload", {
          paymentId: payment.id,
          payload,
        });

        const normalizedStatus = buildPaymentStatusFromPayload(
          payload || {}
        );

        const success = isSuccessfulPayHeroPayload(
          payload || {}
        );

        console.log("[PayHero] Verification result", {
          paymentId: payment.id,
          checkoutRequestId: payment.checkoutRequestId,
          normalizedStatus,
          success,
        });

        if (success) {
          const parsedReference = parseExternalReference(
            payment.reference
          );

          console.log("[PayHero] Parsed payment reference", {
            paymentId: payment.id,
            reference: payment.reference,
            parsedReference,
          });

          const verificationAmountKes = Number(
            payload?.Amount ??
              payload?.amount ??
              payload?.amountKes ??
              payload?.amount_kes
          );

          const resolvedPlan = resolveSubscriptionPlan({
            planRef: parsedReference?.planRef,
          });

          console.log("[PayHero] Resolved subscription plan", {
            paymentId: payment.id,
            planRef: parsedReference?.planRef,
            resolvedPlan: resolvedPlan
              ? {
                  id: resolvedPlan.id,
                  amountUsd: resolvedPlan.amountUsd,
                  amountKes: resolvedPlan.amountKes,
                  durationDays: resolvedPlan.durationDays,
                }
              : null,
          });

          if (!resolvedPlan) {
            logPaymentEvent(
              "verification_invalid_plan",
              {
                paymentId: payment.id,
                checkoutRequestId:
                  payment.checkoutRequestId,
                reference: payment.reference,
                planRef: parsedReference?.planRef,
              }
            );
          } else {
            const expectedAmountKes = Number(
              resolvedPlan.amountKes
            );

            logPaymentEvent(
              "verification_amount_validation",
              {
                paymentId: payment.id,
                checkoutRequestId:
                  payment.checkoutRequestId,
                plan: resolvedPlan.id,
                receivedAmountKes:
                  verificationAmountKes,
                expectedAmountKes,
                amountUsd:
                  resolvedPlan.amountUsd,
              }
            );

            if (
              !Number.isFinite(
                verificationAmountKes
              ) ||
              verificationAmountKes !==
                expectedAmountKes
            ) {
              logPaymentEvent(
                "verification_amount_mismatch",
                {
                  paymentId: payment.id,
                  checkoutRequestId:
                    payment.checkoutRequestId,
                  receivedAmountKes:
                    verificationAmountKes,
                  expectedAmountKes,
                  plan: resolvedPlan.id,
                  reference: payment.reference,
                }
              );
            } else {
              const previousStatus =
                payment.status;

              await payment.update({
                status: "SUCCESS",
                callbackPayload:
                  JSON.stringify(verification),
                paidAt:
                  payment.paidAt || new Date(),
              });

              logPaymentEvent(
                "verification_payment_updated",
                {
                  paymentId: payment.id,
                  checkoutRequestId:
                    payment.checkoutRequestId,
                  previousStatus,
                  newStatus: "SUCCESS",
                  receivedAmountKes:
                    verificationAmountKes,
                  expectedAmountKes,
                  plan: resolvedPlan.id,
                }
              );

              /*
               * Activate the user's premium/VIP access.
               *
               * The exact user update should remain consistent
               * with the activation logic already used by the
               * callback handler.
               */
              const user = await Users.findByPk(
                payment.userId
              );

              if (user) {
                const now = new Date();

                const currentExpiration =
                  user.accessExpiration
                    ? new Date(
                        user.accessExpiration
                      )
                    : null;

                const baseDate =
                  currentExpiration &&
                  currentExpiration > now
                    ? currentExpiration
                    : now;

                const newExpiration =
                  new Date(baseDate);

                newExpiration.setDate(
                  newExpiration.getDate() +
                    Number(
                      resolvedPlan.durationDays ||
                        30
                    )
                );

                await user.update({
                  userType: "vip",
                  accessExpiration:
                    newExpiration,
                });

                logPaymentEvent(
                  "verification_subscription_activated",
                  {
                    paymentId: payment.id,
                    userId: user.id,
                    plan: resolvedPlan.id,
                    durationDays:
                      resolvedPlan.durationDays,
                    accessExpiration:
                      newExpiration,
                  }
                );
              } else {
                logPaymentEvent(
                  "verification_user_not_found",
                  {
                    paymentId: payment.id,
                    userId: payment.userId,
                  }
                );
              }
            }
          }
        } else if (
          normalizedStatus &&
          normalizedStatus.toLowerCase() !==
            "pending"
        ) {
          const previousStatus = payment.status;

          await payment.update({
            status: normalizedStatus,
            callbackPayload:
              JSON.stringify(verification),
          });

          logPaymentEvent(
            "verification_non_success_status_updated",
            {
              paymentId: payment.id,
              checkoutRequestId:
                payment.checkoutRequestId,
              previousStatus,
              newStatus: normalizedStatus,
            }
          );
        }

        logPaymentEvent(
          "payment_verification_completed",
          {
            paymentId: payment.id,
            checkoutRequestId:
              payment.checkoutRequestId,
            status: normalizedStatus,
            success,
          }
        );
      } catch (verificationError) {
        logPaymentEvent(
          "payment_verification_failed",
          {
            paymentId: payment.id,
            checkoutRequestId:
              payment.checkoutRequestId,
            message: verificationError.message,
            stack: verificationError.stack,
          }
        );

        console.error(
          "[PayHero] Payment verification failed:",
          verificationError
        );
      }
    }

    /*
     * Reload the payment so the response contains
     * the latest database status after verification.
     */
    await payment.reload();

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(
      "Status check error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default {
  initiatePayheroSTKPush,
  handleCallback,
  getPaymentHistory,
  getMyPayments,
  getPaymentConfig,
  createManualPayment,
  approvePayment,
  rejectPayment,
  getPaymentStatus,
};
