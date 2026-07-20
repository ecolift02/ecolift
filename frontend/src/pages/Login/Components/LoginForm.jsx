import React, { useState } from "react";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Heading */}
        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>

        <p className="text-gray-500 mb-8">
          Enter your credentials to access your dashboard
        </p>

        {/* Form */}
        <form className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>

            <input
              type="email"
              placeholder="name@company.com"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 mt-1"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{" "}
          {/* <span className="text-green-700 cursor-pointer">Create account</span> */}
          <div className="pt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a
                href="/register"
                className="text-green-700 font-semibold hover:underline"
              >
                Create Account
              </a>
            </p>
          </div>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
