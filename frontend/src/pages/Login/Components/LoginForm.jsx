import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import OTPModal from "../../../components/OTP/OTPModal";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email/Password, 2: OTP Verification
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Step 1: Verify email and password, send OTP
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/login-step1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setOtpExpiresAt(data.expiresAt);
        setShowOTPModal(true);
        setStep(2);
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete login
  const handleVerifyOTP = async (otpCode) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/login-step2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: otpCode }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "OTP verification failed");
      }

      const data = await response.json();

      if (data.token) {
        login(data, data.token);
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Failed to verify OTP. Please try again.");
      setLoading(false);
      throw err;
    }
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
  };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
      {/* Go to Home Button - Fixed to Top Right Corner */}
      <div className="fixed top-6 right-6 z-50">
        <Link
          to="/"
          className="px-5 py-2.5 bg-white border border-green-700 text-green-700 rounded-full hover:bg-green-50 transition font-medium text-sm shadow-md flex items-center gap-2"
        >
          ← Go to Home
        </Link>
      </div>
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>

        <p className="text-gray-500 mb-8">
          Enter your credentials to access your dashboard
        </p>

        {/* Error Message Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
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

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-green-700 font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-green-700 font-semibold hover:underline"
            >
              Create Account
            </a>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        email={email}
        onClose={handleCloseOTPModal}
        onVerifySuccess={handleVerifyOTP}
        isLoading={loading}
        otpExpiresAt={otpExpiresAt}
      />
    </div>
  );
};

export default LoginForm;