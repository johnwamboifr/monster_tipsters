import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMail, FiLock, FiKey, FiEye, FiEyeOff } from "react-icons/fi";
import { url } from "@/features/slices/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.", {
        position: "top-center",
      });
      return;
    }

    if (!/^\d{6}$/.test(resetCode)) {
      toast.error("Please enter a valid 6-digit reset code.", {
        position: "top-center",
      });
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter a new password.", {
        position: "top-center",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.", {
        position: "top-center",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.", {
        position: "top-center",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${url}/auth/change-password`, {
        email,
        resetCode,
        password: newPassword,
      });

      toast.success(response.data.message, {
        position: "top-center",
      });

      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message,
        {
          position: "top-center",
        }
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
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70 text-slate-100 transition hover:border-slate-600"
            >
              <FiArrowLeft className="text-lg" />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
                Reset Password
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-white">
                Create a new password
              </h2>
            </div>
          </div>

          <p className="mb-8 text-sm leading-6 text-slate-400">
            Enter the 6-digit reset code sent to your email, then create a new
            secure password for your account.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Email */}
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-300"
              >
                Email Address
              </Label>

              <div className="relative mt-2">
                <FiMail className="absolute left-3 top-3 text-slate-500" />

                <Input
                  id="email"
                  type="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-slate-950 text-slate-100 border-slate-700 placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Reset Code */}
            <div>
              <Label
                htmlFor="resetCode"
                className="text-sm font-medium text-slate-300"
              >
                Reset Code
              </Label>

              <div className="relative mt-2">
                <FiKey className="absolute left-3 top-3 text-slate-500" />

                <Input
                  id="resetCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={resetCode}
                  onChange={(e) =>
                    setResetCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  placeholder="123456"
                  className="pl-10 text-center tracking-[0.45em] bg-slate-950 text-slate-100 border-slate-700 placeholder:text-slate-500"
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Enter the 6-digit code sent to your email.
              </p>
            </div>

            {/* New Password */}
            <div>
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium text-slate-300"
              >
                New Password
              </Label>

              <div className="relative mt-2">
                <FiLock className="absolute left-3 top-3 text-slate-500" />

                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10 pr-12 bg-slate-950 text-slate-100 border-slate-700 placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Password must be at least 6 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-slate-300"
              >
                Confirm Password
              </Label>

              <div className="relative mt-2">
                <FiLock className="absolute left-3 top-3 text-slate-500" />

                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-10 bg-slate-950 text-slate-100 border-slate-700 placeholder:text-slate-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            <p>
              Remembered your password?{" "}
              <Link
                to="/auth/login"
                className="text-emerald-300 hover:text-emerald-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
