import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { refreshToken } from "@/features/slices/authSlice";
import { setHeaders, url } from "@/features/slices/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle2, Crown, Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";

const PremiumPaymentDialog = ({ open, onOpenChange, plan, onSuccess }) => {
  const dispatch = useDispatch();
  const { id, name, email, phoneNumber } = useSelector((state) => state.auth);
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");

  useEffect(() => {
    if (!open) {
      setPhone(phoneNumber || "");
      setError("");
      setPaymentNotice("");
      setIsProcessing(false);
      return;
    }

    setPhone(phoneNumber || "");
    setError("");
    setPaymentNotice("");
  }, [open, phoneNumber]);

  const selectedPlan = useMemo(() => {
    if (!plan) {
      return null;
    }

    return {
      ...plan,
      amount: Number(plan.amount || 0),
      duration: plan.duration || "Subscription",
      name: plan.name || "Premium",
    };
  }, [plan]);

  const normalizePhoneNumber = (value = "") => {
    const digits = String(value || "").replace(/\D/g, "");
    const withoutPrefix = digits.replace(/^254/, "");
    return withoutPrefix.replace(/^0/, "");
  };

  const isValidSafaricomPhone = (value = "") => /^[71]\d{8}$/.test(normalizePhoneNumber(value));

  const handlePhoneChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  const handleClose = (nextOpen) => {
    if (isProcessing) {
      return;
    }

    onOpenChange?.(nextOpen);
  };

  const handlePay = async () => {
    if (isProcessing) {
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phone || phoneNumber || "");

    if (!isValidSafaricomPhone(normalizedPhone)) {
      setError("Please enter a valid Safaricom number that starts with 7 or 1.");
      setPaymentNotice("");
      return;
    }

    if (!selectedPlan?.amount || Number.isNaN(selectedPlan.amount)) {
      setError("Please choose a valid subscription plan.");
      setPaymentNotice("");
      return;
    }

    setIsProcessing(true);
    setError("");
    setPaymentNotice("Creating your secure payment request...");

    try {
      const response = await axios.post(
        `${url}/payment/stkpush`,
        {
          phone: `254${normalizedPhone}`,
          selectedPlan: selectedPlan.id,
        },
        setHeaders()
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to start the payment request.");
      }

      const checkoutId = response.data?.data?.CheckoutRequestID || response.data?.data?.checkoutRequestId || null;
      if (!checkoutId) {
        throw new Error("We could not receive a payment reference from PayHero.");
      }

      setPaymentNotice("Waiting for PayHero confirmation. Please complete the prompt on your phone.");

      const paymentState = await new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 20;

        const poll = async () => {
          attempts += 1;

          try {
            const statusResponse = await axios.get(`${url}/payment/status/${checkoutId}`, setHeaders());
            const payment = statusResponse.data?.payment;
            const statusValue = String(payment?.status || "").toLowerCase();

            if (statusValue === "success" || statusValue === "completed" || statusValue === "paid") {
              resolve({ success: true, payment });
              return;
            }

            if (statusValue === "failed" || statusValue === "cancelled" || statusValue === "expired") {
              resolve({ success: false, message: "The payment was not completed. Please try again." });
              return;
            }

            if (attempts >= maxAttempts) {
              resolve({ success: false, message: "We did not receive confirmation yet. Please check your phone or try again." });
              return;
            }

            window.setTimeout(poll, 4000);
          } catch (pollError) {
            if (attempts >= maxAttempts) {
              reject(pollError);
              return;
            }

            window.setTimeout(poll, 4000);
          }
        };

        poll();
      });

      if (!paymentState.success) {
        setError(paymentState.message || "The payment could not be verified yet. Please try again.");
        setPaymentNotice("");
        setIsProcessing(false);
        return;
      }

      const refreshResult = await dispatch(refreshToken());
      if (!refreshToken.fulfilled.match(refreshResult)) {
        throw new Error("The payment succeeded, but we could not refresh your account yet.");
      }

      toast.success("Subscription activated successfully. Premium predictions are now unlocked.", {
        position: "top-center",
      });
      onSuccess?.();
      handleClose(false);
    } catch (payError) {
      setError(payError?.response?.data?.message || payError?.message || "We could not complete your payment request. Please try again.");
      setPaymentNotice("");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-white/10 bg-slate-950/95 text-slate-100 sm:max-w-2xl"
        onEscapeKeyDown={(event) => {
          if (isProcessing) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (isProcessing) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-emerald-400" />
            <DialogTitle className="text-xl font-semibold text-white">Complete Your Subscription</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-400">
            Securely finish your premium subscription and unlock premium predictions instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border border-white/10 bg-slate-900/80">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold text-white">Selected Plan</CardTitle>
                <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">{selectedPlan.name}</Badge>
              </div>
              <CardDescription className="text-sm text-slate-400">{selectedPlan.duration}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Plan</span>
                <span className="font-medium text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Duration</span>
                <span className="font-medium text-white">{selectedPlan.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Amount</span>
                <span className="font-medium text-white">KES {selectedPlan.amount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white">Customer Information</CardTitle>
              <CardDescription className="text-sm text-slate-400">We’ll use your account details to start the subscription request.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="712345678"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={isProcessing}
                  className="h-11 border-white/10 bg-slate-950/70 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">Enter a Safaricom mobile number to receive the PayHero prompt.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Plan</span>
                <span className="font-medium text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Duration</span>
                <span className="font-medium text-white">{selectedPlan.duration}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Amount</span>
                <span className="font-medium text-white">${selectedPlan.amount.toLocaleString()}</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  Secure PayHero checkout
                </div>
                <p className="mt-1 text-emerald-100/90">Your premium access is unlocked as soon as the payment is verified.</p>
              </div>
            </CardContent>
          </Card>

          {error ? (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-3 text-sm text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          {paymentNotice ? (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-3 text-sm text-amber-200">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{paymentNotice}</p>
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" onClick={() => handleClose(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button className="rounded-full bg-emerald-600 text-white hover:bg-emerald-500" onClick={handlePay} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Pay with PayHero
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumPaymentDialog;
