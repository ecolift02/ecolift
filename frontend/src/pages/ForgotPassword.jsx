import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../api/authApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900">Forgot your password?</h2>
        <p className="mt-2 text-sm text-gray-600">Enter your account email and we'll send you a reset code.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Remembered it? <Link to="/login" className="text-green-700 underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
