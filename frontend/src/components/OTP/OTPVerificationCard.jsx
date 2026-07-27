import React, { useState, useEffect } from "react";

const OTPVerificationCard = ({
  email,
  onVerifySuccess,
  onCancel,
  isLoading = false,
  otpExpiresAt,
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!otpExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(otpExpiresAt);
      const seconds = Math.floor((expiresAt - now) / 1000);

      if (seconds <= 0) {
        setTimer(0);
        clearInterval(interval);
      } else {
        setTimer(seconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  // Resend cooldown timer (30 seconds)
  useEffect(() => {
    if (!canResend && timer > 0) {
      const resendTimer = setTimeout(() => {
        setCanResend(true);
      }, 30000);

      return () => clearTimeout(resendTimer);
    }
  }, [canResend, timer]);

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      await onVerifySuccess(otp);
    } catch (err) {
      setError(err.message || "Failed to verify OTP. Please try again.");
      setOtp("");
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setError("");
    setOtp("");

    try {
      // This would call the resend API
      const response = await fetch("http://localhost:8083/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setError("");
      } else {
        setError("Failed to resend OTP. Please try again.");
        setCanResend(true);
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
      setCanResend(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        {/* OTP Input */}
        <div>
          <label className="block mb-2 font-medium">Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={handleOTPChange}
            placeholder="000000"
            inputMode="numeric"
            maxLength="6"
            disabled={verifying || isLoading}
            className="w-full h-12 px-4 text-center text-2xl font-bold tracking-widest border rounded-xl focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
          />
        </div>

        {/* Timer Display */}
        <div className="text-center">
          {timer > 0 ? (
            <p className="text-sm text-gray-600">
              OTP expires in: <strong>{formatTime(timer)}</strong>
            </p>
          ) : (
            <p className="text-sm text-red-600">OTP has expired</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={verifying || isLoading || otp.length !== 6 || timer <= 0}
          className="w-full h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {/* Resend Button */}
      <div className="text-center">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={verifying || isLoading}
            className="text-green-700 font-semibold hover:underline text-sm"
          >
            Didn't receive code? Resend OTP
          </button>
        ) : (
          <p className="text-sm text-gray-600">
            Resend OTP available in <strong>30 seconds</strong>
          </p>
        )}
      </div>

      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={verifying || isLoading}
        className="w-full h-12 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
};

export default OTPVerificationCard;
