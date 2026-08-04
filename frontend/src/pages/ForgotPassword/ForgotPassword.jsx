import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword, resendOtp } from "../../api/authService";

// Step 1: enter email -> request OTP.
// Step 2: enter OTP + new password -> reset.
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo("If an account exists for that email, a reset OTP has been sent.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setInfo("");
    try {
      await resendOtp(email, "RESET_PASSWORD");
      setInfo("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP sent to your email.");
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      setError("Password must be at least 8 characters, include 1 uppercase letter and 1 symbol.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      navigate("/login", {
        state: { infoMessage: "Password reset successful. Please log in with your new password." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md">
        <div className="fixed top-6 right-6 z-50">
          <Link
            to="/login"
            className="px-5 py-2.5 bg-white border border-green-700 text-green-700 rounded-full hover:bg-green-50 transition font-medium text-sm shadow-md"
          >
            ← Back to Login
          </Link>
        </div>

        <h2 className="text-3xl font-bold mb-2">
          {step === 1 ? "Forgot your password?" : "Reset your password"}
        </h2>
        <p className="text-gray-500 mb-8">
          {step === 1
            ? "Enter the email associated with your account and we'll send you a reset code."
            : `Enter the 6-digit code sent to ${email} and choose a new password.`}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{info}</div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">OTP Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition tracking-widest text-lg"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full text-green-700 font-medium hover:underline text-sm"
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
