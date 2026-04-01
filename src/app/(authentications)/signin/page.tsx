"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

import Link from "next/link";
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="bg-black text-orange-500">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  interface FormData {
    email: string;
    password: string;
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    // setError("");

    // // Show "under construction" message
    // setError("Dashboard is currently under construction. Please check back soon!");
    // setLoading(false);
    
    // Commented out actual login logic for now
  
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch  {
      setError("An unexpected error occurred");
      setLoading(false);
    }
    
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative" style={{backgroundImage: 'url(/images/logos/background-1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="absolute inset-0 bg-black/80"></div>
      
      {/* Loading Overlay */}
      {/* {loading && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-white font-orbitron mb-2">Accessing Dashboard</h3>
            <p className="text-gray-300 font-rajdhani animate-pulse">Please wait while we prepare your business dashboard...</p>
          </div>
        </div>
      )} */}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-orange-600/30"
      >
        {/* Header with Logo */}
        <div className="bg-black/50 p-8 text-center border-b border-orange-600/20">
          <Link href="/" className="inline-block">
            <div className="mx-auto h-20 w-20 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl font-orbitron">CE</span>
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-white font-orbitron uppercase tracking-wider">Admin Portal</h1>
          <p className="mt-2 text-gray-300 font-rajdhani">Sign in to manage your business</p>
        </div>

        {/* Main Form */}
        <div className="p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-orange-900/50 text-orange-300 rounded-lg text-sm border border-orange-500/30 font-rajdhani"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2 font-rajdhani">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white font-rajdhani ${errors.email ? "border-orange-500" : "border-gray-600"} border focus:ring-2 focus:ring-gray-600 focus:border-gray-600 placeholder-gray-400`}
                  placeholder="admin@thecaredition.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-orange-400 font-rajdhani">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2 font-rajdhani">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white font-rajdhani ${errors.password ? "border-orange-500" : "border-gray-600"} border focus:ring-2 focus:ring-gray-600 focus:border-gray-600 placeholder-gray-400`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-orange-400 font-rajdhani">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-600 border-gray-600 rounded bg-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 font-rajdhani">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-orange-400 hover:text-orange-300 font-rajdhani">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold font-orbitron uppercase tracking-wider text-white overflow-hidden transition-all duration-300 ${
                loading 
                  ? 'bg-orange-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600'
              }`}
            >
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
              
              <span className="relative flex items-center">
                {loading ? (
                  <>
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      <span className="animate-pulse">Accessing Dashboard...</span>
                    </div>
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </span>
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-400 font-rajdhani">
            <p>Secure admin access for The Car Edition business management</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}