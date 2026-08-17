/** @format */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { HiMail, HiUser, HiPhone, HiEye, HiEyeOff } from "react-icons/hi";
import { registerUser } from "@/features/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import loginHeroImage from "@/assets/pexels-work2survive-32545253.jpg";

const AuthRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registerStatus, registerError } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = (values) => {
    dispatch(registerUser(values));
  };

  useEffect(() => {
    if (registerStatus === "success") navigate("/auth/login");
  }, [registerStatus, navigate]);

  const validationSchema = Yup.object({
    name: Yup.string().min(2, "Too short").required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]+$/, "Must be digits only")
      .min(10, "At least 10 digits")
      .required("Phone number is required"),
    password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 gap-8">
        {/* Left Side - Image Section (Hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-1 items-center justify-center"
        >
          <div className="relative w-full max-w-sm h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={loginHeroImage}
              alt="Football expert analysis"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Expert Predictions</h3>
              <p className="text-sm text-slate-200">Get verified tips and increase your winning rate</p>
              <div className="mt-4 flex gap-2">
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Expert</span>
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Verified</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-[32px] border border-slate-800/80 bg-slate-900/95 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-white">Create Account</h2>
              <p className="text-slate-400 text-sm mt-1">Join Monster Tipsters and start winning predictions.</p>
            </div>

          {registerStatus === "rejected" && (
            <Alert variant="danger" className="mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-400/20 p-3 rounded-xl">
              {registerError}
            </Alert>
          )}

          <Formik
            initialValues={{ name: "", email: "", phoneNumber: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-slate-300">Full Name</Label>
                  <div className="relative mt-2">
                    <HiUser className="absolute left-3 top-3 text-slate-500" />
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      className="pl-10 bg-slate-950/80 text-slate-100 border-slate-700"
                    />
                  </div>
                  <ErrorMessage name="name" component="p" className="mt-1 text-xs text-rose-400" />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-300">Email</Label>
                  <div className="relative mt-2">
                    <HiMail className="absolute left-3 top-3 text-slate-500" />
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-slate-950/80 text-slate-100 border-slate-700"
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="mt-1 text-xs text-rose-400" />
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-slate-300">Phone Number</Label>
                  <div className="relative mt-2">
                    <HiPhone className="absolute left-3 top-3 text-slate-500" />
                    <Field
                      as={Input}
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="07xxxxxxxx"
                      className="pl-10 bg-slate-950/80 text-slate-100 border-slate-700"
                    />
                  </div>
                  <ErrorMessage name="phoneNumber" component="p" className="mt-1 text-xs text-rose-400" />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-slate-300">Password</Label>
                  <div className="relative mt-2">
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10 bg-slate-950/80 text-slate-100 border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-1 text-xs text-rose-400" />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || registerStatus === "pending"}
                  className="w-full mt-3"
                >
                  {registerStatus === "pending" ? "Creating..." : "Create Account"}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="text-center mt-8 text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-emerald-300 hover:text-emerald-200">
              Sign in
            </Link>
          </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthRegister;
