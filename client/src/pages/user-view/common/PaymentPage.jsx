/* eslint-disable react/no-unescaped-entities */
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { setHeaders, url } from "@/features/slices/api";
import { cn } from "@/lib/utils";

import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const EXCHANGE_RATE = 130;

const PLAN_OPTIONS = [
  {
    id: "silver",
    name: "Silver",
    amountUsd: 20,
    amountKes: 2600,
    duration: "30 Days",
    odds: "2–3 odds",
    description:
      "Reliable daily predictions for regular bettors.",
  },
  {
    id: "bronze",
    name: "Bronze",
    amountUsd: 30,
    amountKes: 3900,
    duration: "30 Days",
    odds: "2–5 odds",
    description:
      "More selections with higher-odds opportunities.",
    featured: true,
  },
  {
    id: "gold",
    name: "Gold",
    amountUsd: 40,
    amountKes: 5200,
    duration: "30 Days",
    odds: "2–10+ odds",
    description:
      "Our complete premium package for serious bettors.",
  },
];

const PAYMENT_METHODS = [
  {
    id: "mpesa",
    title: "M-Pesa",
    description:
      "Instant checkout using Safaricom M-Pesa.",
  },
  {
    id: "usdt",
    title: "USDT",
    description:
      "Manual payment using the TRC20 network.",
  },
];

const normalizePhoneNumber = (value = "") => {
  const digits = String(value).replace(/\D/g, "");

  if (digits.startsWith("254")) {
    return digits.substring(3);
  }

  if (digits.startsWith("0")) {
    return digits.substring(1);
  }

  return digits;
};

const isValidSafaricomPhone = (value = "") => {
  const normalized = normalizePhoneNumber(value);
  return /^7\d{8}$/.test(normalized);
};

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString("en-KE");

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { userType, accessExpiration } = useSelector(
    (state) => state.auth
  );

  /*
   * PricingPage should navigate with:
   *
   * navigate("/payment", {
   *   state: {
   *     planId: plan.id,
   *   },
   * });
   */

  const incomingPlanId =
    location.state?.planId ||
    location.state?.plan ||
    "silver";

  const [selectedPlan, setSelectedPlan] =
    useState(incomingPlanId);

  const [paymentMethod, setPaymentMethod] =
    useState("mpesa");

  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [screenshotFile, setScreenshotFile] =
    useState(null);

  const [config, setConfig] = useState(null);
  const [payments, setPayments] = useState([]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [paymentMessage, setPaymentMessage] =
    useState("");

  const [paymentError, setPaymentError] =
    useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("idle");

  const selectedPlanConfig = useMemo(() => {
    return (
      PLAN_OPTIONS.find(
        (plan) => plan.id === selectedPlan
      ) || PLAN_OPTIONS[0]
    );
  }, [selectedPlan]);

  const activeSubscription = useMemo(() => {
    if (
      !accessExpiration ||
      !["premium", "vip"].includes(userType)
    ) {
      return null;
    }

    const expiration = new Date(accessExpiration);

    const daysLeft = Math.ceil(
      (expiration.getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );

    return daysLeft > 0 ? daysLeft : null;
  }, [accessExpiration, userType]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const [configResponse, paymentsResponse] =
          await Promise.all([
            axios.get(
              `${url}/payment/config`,
              setHeaders()
            ),
            axios.get(
              `${url}/payment/my`,
              setHeaders()
            ),
          ]);

        if (configResponse.data?.success) {
          setConfig(configResponse.data.data);
        }

        if (paymentsResponse.data?.success) {
          setPayments(
            paymentsResponse.data.data || []
          );
        }
      } catch (error) {
        console.error(
          "Unable to load payment information:",
          error
        );
      }
    };

    fetchPaymentData();
  }, []);

  const clearMessages = () => {
    setPaymentError("");
    setPaymentMessage("");
  };

  const handleScreenshotChange = (event) => {
    const file =
      event.target.files?.[0] || null;

    if (!file) {
      setScreenshotFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPaymentError(
        "Screenshot must be smaller than 5MB."
      );

      event.target.value = "";
      setScreenshotFile(null);
      return;
    }

    setPaymentError("");
    setScreenshotFile(file);
  };

  const refreshPayments = async () => {
    try {
      const response = await axios.get(
        `${url}/payment/my`,
        setHeaders()
      );

      if (response.data?.success) {
        setPayments(
          response.data.data || []
        );
      }
    } catch (error) {
      console.error(
        "Unable to refresh payments:",
        error
      );
    }
  };

  const handleMpesaPayment = async () => {
    const normalizedPhone =
      normalizePhoneNumber(phone);

    if (
      !isValidSafaricomPhone(
        normalizedPhone
      )
    ) {
      setPaymentError(
        "Please enter a valid Safaricom number, for example 712345678."
      );
      return;
    }

    setIsSubmitting(true);
    clearMessages();
    setPaymentStatus("processing");

    try {
      const response = await axios.post(
        `${url}/payment/stkpush`,
        {
          phone: `254${normalizedPhone}`,
          selectedPlan:
            selectedPlanConfig.id,
          amountKes:
            selectedPlanConfig.amountKes,
        },
        setHeaders()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to initiate M-Pesa payment."
        );
      }

      setPaymentStatus("pending");

      setPaymentMessage(
        response.data.message ||
          "M-Pesa payment request sent. Check your phone and enter your M-Pesa PIN."
      );

      toast.success(
        "M-Pesa payment request sent."
      );
    } catch (error) {
      setPaymentStatus("failed");

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to initiate M-Pesa payment.";

      setPaymentError(message);

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsdtPayment = async () => {
    if (!screenshotFile) {
      setPaymentError(
        "Please upload a screenshot of your USDT payment."
      );
      return;
    }

    setIsSubmitting(true);
    clearMessages();
    setPaymentStatus("processing");

    const formData = new FormData();

    formData.append(
      "selectedPlan",
      selectedPlanConfig.id
    );

    formData.append(
      "amount",
      String(selectedPlanConfig.amountUsd)
    );

    formData.append(
      "reference",
      reference.trim()
    );

    formData.append(
      "screenshot",
      screenshotFile
    );

    try {
      const response = await axios.post(
        `${url}/payment/manual`,
        formData,
        {
          headers: {
            ...setHeaders().headers,
            Accept: "application/json",
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to submit payment."
        );
      }

      setPaymentStatus("pending");

      setPaymentMessage(
        response.data.message ||
          "Payment submitted successfully. Your payment is now pending admin review."
      );

      setScreenshotFile(null);
      setReference("");

      await refreshPayments();

      toast.success(
        "Payment submitted for review."
      );
    } catch (error) {
      setPaymentStatus("failed");

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to submit payment.";

      setPaymentError(message);

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPayment = () => {
    if (paymentMethod === "mpesa") {
      handleMpesaPayment();
      return;
    }

    handleUsdtPayment();
  };

  const copyWalletAddress = async () => {
    if (!config?.address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        config.address
      );

      toast.success(
        "USDT wallet address copied."
      );
    } catch {
      toast.error(
        "Unable to copy wallet address."
      );
    }
  };

  const getStatusBadge = (status) => {
    const normalized = String(
      status || ""
    ).toLowerCase();

    const styles = {
      pending:
        "border-amber-400/20 bg-amber-500/10 text-amber-300",
      approved:
        "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      success:
        "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      rejected:
        "border-rose-400/20 bg-rose-500/10 text-rose-300",
      failed:
        "border-rose-400/20 bg-rose-500/10 text-rose-300",
    };

    return (
      <Badge
        className={cn(
          "border",
          styles[normalized] ||
            "border-white/10 bg-white/5 text-slate-300"
        )}
      >
        {status || "Unknown"}
      </Badge>
    );
  };
    return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_28%)]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() =>
                navigate("/premium-tips")
              }
              className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Premium
            </Button>

            {activeSubscription ? (
              <Badge className="border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
                Active subscription ·{" "}
                {activeSubscription} days left
              </Badge>
            ) : null}
          </div>

          {/* Page heading */}
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Premium Checkout
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Complete your subscription
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Review your selected plan and choose
              your preferred payment method.
            </p>
          </div>

          {/* Selected plan */}
          <Card className="mb-6 overflow-hidden border-emerald-400/20 bg-slate-900/90">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
                    <Zap className="h-6 w-6 text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Selected Plan
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-white">
                        {selectedPlanConfig.name} Plan
                      </h2>

                      {selectedPlanConfig.featured ? (
                        <Badge className="border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                          Most Popular
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      {selectedPlanConfig.description}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-left sm:min-w-[180px] sm:text-right">
                  <p className="text-xs text-slate-500">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    $
                    {selectedPlanConfig.amountUsd}
                  </p>

                  <p className="text-sm font-medium text-emerald-300">
                    KES{" "}
                    {formatAmount(
                      selectedPlanConfig.amountKes
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

            {/* LEFT */}
            <div className="space-y-6">

              {/* Payment methods */}
              <Card className="border-white/10 bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="text-white">
                    Payment Method
                  </CardTitle>

                  <CardDescription className="text-slate-400">
                    Choose how you want to pay for your{" "}
                    {selectedPlanConfig.name} plan.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PAYMENT_METHODS.map(
                      (method) => {
                        const isSelected =
                          paymentMethod ===
                          method.id;

                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => {
                              setPaymentMethod(
                                method.id
                              );
                              clearMessages();
                              setPaymentStatus(
                                "idle"
                              );
                            }}
                            className={cn(
                              "rounded-2xl border p-4 text-left transition-all",
                              isSelected
                                ? "border-emerald-400/40 bg-emerald-500/10"
                                : "border-white/10 bg-slate-950/60 hover:border-white/20"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-white">
                                  {method.title}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                  {
                                    method.description
                                  }
                                </p>
                              </div>

                              <div
                                className={cn(
                                  "mt-0.5 h-4 w-4 rounded-full border",
                                  isSelected
                                    ? "border-emerald-400 bg-emerald-400"
                                    : "border-slate-600"
                                )}
                              />
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order summary */}
              <Card className="border-white/10 bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="text-white">
                    Order Summary
                  </CardTitle>

                  <CardDescription className="text-slate-400">
                    Your subscription details and
                    payment amount.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-5">

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Plan
                      </span>

                      <span className="font-semibold text-white">
                        {selectedPlanConfig.name} Plan
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Duration
                      </span>

                      <span className="font-medium text-white">
                        {selectedPlanConfig.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Odds package
                      </span>

                      <span className="font-medium text-white">
                        {selectedPlanConfig.odds}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Exchange rate
                      </span>

                      <span className="font-medium text-white">
                        $1 = KES{" "}
                        {EXCHANGE_RATE}
                      </span>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="flex items-end justify-between">
                      <span className="font-medium text-slate-300">
                        Total
                      </span>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          $
                          {
                            selectedPlanConfig.amountUsd
                          }
                        </p>

                        <p className="text-sm font-semibold text-emerald-300">
                          KES{" "}
                          {formatAmount(
                            selectedPlanConfig.amountKes
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Included access */}
              <Card className="border-white/10 bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="text-white">
                    What you get
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />

                      <div>
                        <p className="text-sm font-medium text-white">
                          {selectedPlanConfig.odds}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Your selected odds package.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />

                      <div>
                        <p className="text-sm font-medium text-white">
                          30 Days Access
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Premium access after payment
                          approval.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">

              {/* Checkout */}
              <Card className="border-emerald-400/20 bg-slate-900/90">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>

                  <CardTitle className="pt-2 text-white">
                    {paymentMethod === "mpesa"
                      ? "M-Pesa Checkout"
                      : "USDT TRC20 Checkout"}
                  </CardTitle>

                  <CardDescription className="text-slate-400">
                    {paymentMethod === "mpesa"
                      ? "Enter your Safaricom number and we'll send an STK Push."
                      : "Send USDT using TRC20 and submit your payment proof."}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {paymentMethod === "mpesa" ? (
                    <div className="space-y-5">

                      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">
                            Amount to pay
                          </span>

                          <span className="text-lg font-bold text-white">
                            KES{" "}
                            {formatAmount(
                              selectedPlanConfig.amountKes
                            )}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                          Safaricom Phone Number
                        </label>

                        <Input
                          type="tel"
                          value={phone}
                          onChange={(event) =>
                            setPhone(
                              event.target.value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(
                                  0,
                                  10
                                )
                            )
                          }
                          placeholder="712345678"
                          disabled={
                            isSubmitting
                          }
                          className="h-12 border-white/10 bg-slate-950/70 text-white placeholder:text-slate-600"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                          Enter your Safaricom number
                          without +254.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                        <p className="text-sm font-medium text-emerald-200">
                          M-Pesa STK Push
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-100/70">
                          A payment prompt will be sent
                          directly to your phone.
                        </p>
                      </div>
                                            {paymentError ? (
                        <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                          {paymentError}
                        </div>
                      ) : null}

                      {paymentMessage ? (
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                          {paymentMessage}
                        </div>
                      ) : null}

                      <Button
                        onClick={
                          handleSubmitPayment
                        }
                        disabled={isSubmitting}
                        className="h-12 w-full rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Pay KES{" "}
                            {formatAmount(
                              selectedPlanConfig.amountKes
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5">

                      {/* USDT amount */}
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-emerald-100/60">
                              Send exactly
                            </p>

                            <p className="mt-1 text-2xl font-bold text-emerald-200">
                              USDT{" "}
                              {
                                selectedPlanConfig.amountUsd
                              }
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-emerald-100/60">
                              Equivalent
                            </p>

                            <p className="mt-1 font-semibold text-emerald-200">
                              KES{" "}
                              {formatAmount(
                                selectedPlanConfig.amountKes
                              )}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-emerald-100/60">
                          Exchange rate: $1 = KES{" "}
                          {EXCHANGE_RATE}
                        </p>
                      </div>

                      {/* Network */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                          <p className="text-xs text-slate-500">
                            Currency
                          </p>

                          <p className="mt-1 font-semibold text-white">
                            USDT
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                          <p className="text-xs text-slate-500">
                            Network
                          </p>

                          <p className="mt-1 font-semibold text-white">
                            TRC20
                          </p>
                        </div>
                      </div>

                      {/* Wallet */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                          USDT Wallet Address
                        </label>

                        <div className="flex gap-2">
                          <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                            <p className="break-all text-xs leading-5 text-emerald-200">
                              {config?.address ||
                                "Wallet address not configured"}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={
                              copyWalletAddress
                            }
                            disabled={
                              !config?.address
                            }
                            className="h-auto shrink-0 border-white/10 bg-white/5 text-white hover:bg-white/10"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
                        <p className="text-xs leading-5 text-amber-200">
                          Make sure you send USDT using the{" "}
                          <strong>TRC20 network</strong>.
                          Sending through another network may
                          result in permanent loss of funds.
                        </p>
                      </div>

                      {/* Screenshot */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                          Payment Screenshot
                        </label>

                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={
                            handleScreenshotChange
                          }
                          disabled={
                            isSubmitting
                          }
                          className="h-auto cursor-pointer border-white/10 bg-slate-950/70 py-3 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500/10 file:px-3 file:py-1 file:text-emerald-300"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                          PNG, JPEG or WEBP. Maximum
                          file size: 5MB.
                        </p>

                        {screenshotFile ? (
                          <p className="mt-2 text-xs text-emerald-300">
                            Selected:{" "}
                            {screenshotFile.name}
                          </p>
                        ) : null}
                      </div>

                      {/* Reference */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                          Transaction Reference
                          <span className="ml-1 text-slate-500">
                            (optional)
                          </span>
                        </label>

                        <Input
                          type="text"
                          value={reference}
                          onChange={(event) =>
                            setReference(
                              event.target.value
                            )
                          }
                          placeholder="Transaction hash / ID"
                          disabled={
                            isSubmitting
                          }
                          className="h-12 border-white/10 bg-slate-950/70 text-white placeholder:text-slate-600"
                        />
                      </div>

                      {paymentError ? (
                        <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                          {paymentError}
                        </div>
                      ) : null}

                      {paymentMessage ? (
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                          {paymentMessage}
                        </div>
                      ) : null}

                      <Button
                        onClick={
                          handleSubmitPayment
                        }
                        disabled={isSubmitting}
                        className="h-12 w-full rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Submit USDT Payment
                          </>
                        )}
                      </Button>

                      <p className="text-center text-xs leading-5 text-slate-500">
                        Your payment will be reviewed by an
                        administrator. Once approved, your
                        30-day premium subscription will be
                        activated automatically.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment history */}
              <Card className="border-white/10 bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="text-white">
                    Recent Payments
                  </CardTitle>

                  <CardDescription className="text-slate-400">
                    Track your previous payment submissions.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {payments.length > 0 ? (
                    <div className="space-y-3">
                      {payments
                        .slice(0, 4)
                        .map((payment) => (
                          <div
                            key={payment.id}
                            className="rounded-xl border border-white/10 bg-slate-950/60 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-white">
                                  {payment.planId
                                    ? `${
                                        payment.planId
                                          .charAt(0)
                                          .toUpperCase() +
                                        payment.planId.slice(1)
                                      } Plan`
                                    : "Premium Subscription"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {payment.paymentMethod ||
                                    "Payment"}
                                </p>
                              </div>

                              {getStatusBadge(
                                payment.status
                              )}
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                              <span className="text-slate-400">
                                Amount
                              </span>

                              <span className="font-medium text-white">
                                {payment.paymentMethod ===
                                "mpesa"
                                  ? `KES ${formatAmount(
                                      payment.amountKes ||
                                        payment.amount
                                    )}`
                                  : `USDT ${formatAmount(
                                      payment.amount
                                    )}`}
                              </span>
                            </div>

                            {payment.reference ? (
                              <p className="mt-2 truncate text-xs text-slate-500">
                                Ref:{" "}
                                {payment.reference}
                              </p>
                            ) : null}

                            {payment.screenshotUrl ? (
                              <a
                                href={
                                  payment.screenshotUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-block text-xs font-medium text-emerald-300 hover:text-emerald-200"
                              >
                                View payment screenshot →
                              </a>
                            ) : null}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-center">
                      <p className="text-sm text-slate-400">
                        No payment activity yet.
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Your payment history will appear here
                        after you make a payment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trust information */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />

              <p className="mt-3 text-sm font-semibold text-white">
                Secure checkout
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Pay using M-Pesa or USDT TRC20.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <Sparkles className="h-5 w-5 text-emerald-400" />

              <p className="mt-3 text-sm font-semibold text-white">
                30 days access
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Approved payments activate your premium
                subscription for 30 days.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />

              <p className="mt-3 text-sm font-semibold text-white">
                Payment verification
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Manual USDT payments are reviewed before
                activation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
