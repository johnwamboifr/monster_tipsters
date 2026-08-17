/** @format */

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loginUser } from "@/features/slices/authSlice";
import { HiInformationCircle, HiEye, HiEyeOff, HiMail, HiLockClosed } from "react-icons/hi";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import loginHeroImage from "@/assets/pexels-work2survive-32545253.jpg";

const AuthLogin = () => {
  const dispatch = useDispatch();
  const { loginError, loginStatus } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (values) => {
    dispatch(loginUser(values));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
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
              alt="Professional football tipster"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Professional Tips</h3>
              <p className="text-sm text-slate-200">Join elite tipsters making smarter predictions</p>
              <div className="mt-4 flex gap-2">
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Verified</span>
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Trusted</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="rounded-[32px] border border-slate-800/80 bg-slate-900/95 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-8 space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-300">
                <HiLockClosed className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-semibold text-white">Welcome Back</h2>
              <p className="text-sm text-slate-400">Sign in to access your predictions</p>
            </div>

          {loginStatus === "rejected" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4"
            >
              <Alert variant="danger" className="flex items-center gap-2 text-sm">
                <HiInformationCircle className="w-5 h-5" />
                <span>{loginError}</span>
              </Alert>
            </motion.div>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleBlur }) => (
              <Form className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <HiMail className="absolute left-3 top-3 text-slate-500" />
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                      className="pl-10 bg-slate-950/80 text-slate-100 border-slate-700"
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="mt-1 text-xs text-rose-400" />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <HiLockClosed className="absolute left-3 top-3 text-slate-500" />
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.password}
                      className="pl-10 pr-10 bg-slate-950/80 text-slate-100 border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-1 text-xs text-rose-400" />
                </div>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    Remember me
                  </label>
                  <Link to="/auth/forgot-password" className="text-emerald-300 hover:text-emerald-200">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loginStatus === "pending"}
                  className="w-full mt-2"
                >
                  {loginStatus === "pending" ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don’t have an account?{' '}
            <Link to="/auth/register" className="text-emerald-300 hover:text-emerald-200">
              Create one
            </Link>
          </div>          </div>        </motion.div>
      </div>
    </div>
  );
};

export default AuthLogin;
