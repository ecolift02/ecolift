import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtp, resendOtp } from "../api/authApi";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || new URLSearchParams(location.search).get("email") || "";

  const [digits, setDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await verifyOtp(email, otp);
      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_data", JSON.stringify({ email: data.email, name: data.name, roles: data.roles }));
      localStorage.setItem("user", JSON.stringify({ email: data.email, name: data.name, roles: data.roles }));
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResending(true);
    try {
      await resendOtp(email, "REGISTER");
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code. Try again shortly.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex justify-center gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-10 rounded-lg border border-gray-300 text-center text-lg outline-none focus:border-green-600"
              />
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-green-700 px-4 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify & continue"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="mt-4 text-sm text-green-700 underline disabled:text-gray-400"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Resending..." : "Resend code"}
        </button>
      </div>
    </div>
  );
}
