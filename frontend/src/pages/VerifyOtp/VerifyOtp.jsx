import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { verifyOtp, resendOtp } from "../../api/authService";

const RESEND_COOLDOWN_SECONDS = 30;

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Register.jsx redirects here with the email in router state. Fall back
  // to a query param (?email=...) so a page refresh / direct link still works.
  const emailFromState = location.state?.email;
  const emailFromQuery = new URLSearchParams(location.search).get("email");
  const email = emailFromState || emailFromQuery || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!email) {
    // Someone landed here directly without registering first.
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-3">No email to verify</h2>
          <p className="text-gray-600 mb-6">
            Please register first, then you'll be redirected here automatically.
          </p>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
          >
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only allow a single digit
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("");
    while (next.length < 6) next.push("");
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await verifyOtp(email, otp);
      // Backend returns a full AuthResponse (token + user info) on success,
      // so we log the user straight in - no second manual login needed.
      const { token, name, roles } = data;
      login({ email, name, roles }, token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError("");
    setInfo("");
    try {
      await resendOtp(email, "REGISTER");
      setInfo("A new OTP has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2">Verify your email</h2>
        <p className="text-gray-500 mb-8">
          We sent a 6-digit code to <span className="font-medium">{email}</span>.
          Enter it below to activate your account.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-2xl font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="pt-6 text-center text-sm text-gray-600">
          Didn't get the code?{" "}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-green-700 font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
