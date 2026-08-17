import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { url } from "@/features/slices/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Enter a valid email address", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${url}/auth/forgot-password`, { email });
      toast.success(data.message || "A reset code has been sent to your email.", {
  position: "top-center",
});
      //toast.success(data.message, { position: "top-center" });
      setTimeout(() => {
  navigate("/auth/reset-password", {
    state: { email },
  });
}, 1200);
      //navigate("/auth/reset-password", { state: { email } });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Try again.",
        { position: "top-center" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-[32px] border border-slate-800/80 bg-slate-900/95 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70 text-slate-100 transition hover:border-slate-600"
              aria-label="Go back"
            >
              <FiArrowLeft className="text-lg" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Forgot Password</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Reset with a secure code</h2>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-400 mb-8">
            Enter the email associated with your account. We'll send you a secure 6-digit verification code that you'll use to reset your password.
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email Address
              </Label>
              <div className="relative mt-2">
                <FiMail className="absolute left-3 top-3 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-slate-950/80 text-slate-100 border-slate-700"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Sending..." : "Send 6-Digit Code"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            <p>
              Remembered your password?{' '}
              <Link to="/auth/login" className="text-emerald-300 hover:text-emerald-200">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
