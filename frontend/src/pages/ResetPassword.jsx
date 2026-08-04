import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resetPassword, resendOtp } from "../api/authApi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || new URLSearchParams(location.search).get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await resendOtp(email, "RESET_PASSWORD");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900">Password reset!</h2>
          <p className="mt-2 text-sm text-gray-600">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter the code sent to <strong>{email}</strong> along with your new password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="otp" className="mb-1 block text-sm font-medium text-gray-700">6-digit code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700">New password</label>
            <input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          className="mt-4 text-sm text-green-700 underline"
        >
          Resend code
        </button>

        <p className="mt-4 text-sm text-gray-600">
          <Link to="/login" className="text-green-700 underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
