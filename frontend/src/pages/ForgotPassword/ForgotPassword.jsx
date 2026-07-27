import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OTPModal from "../../components/OTP/OTPModal";

const ForgotPasswordHero = () => {
  return (
    <section className="hidden lg:flex w-1/2 relative bg-green-900 overflow-hidden items-center justify-center p-16">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-green-400 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-green-600 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-xl text-white">
        <div className="mb-12 flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl">
            <span className="material-symbols-outlined text-green-900 text-3xl">
            </span>
          </div>
          <span className="text-3xl font-bold">EcoLift</span>
        </div>

        <h1 className="text-6xl font-bold leading-tight mb-6">
          Reset your password securely.
        </h1>

        <p className="text-lg opacity-80 mb-10">
          Follow our simple process to regain access to your EcoLift account.
          We'll send a verification code to your email.
        </p>

        <div className="rounded-3xl overflow-hidden shadow-2xl rotate-1 bg-white p-2">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBacN1O42QueQg-9jjhNlf4h8S5IiOn0u0tIEAZrFHcl6gFFZXjEP9iVarqxxtkOddJurF4JVZZC2z8q-aIUHXELfYceNusL5-iBLB48rQpm9RUm1CUYPYKrhrSdSWfu3LiAvQatBE8_plmYEp4UHc1ZSt-NkS6oqPoZA_0IHet7p0dHq-iFMvu4Maym41Vc6P5P4TklCpy299u-ILEi_PElG0Y-EAr3R1VRacBhtVGH9cdomzaHGIqzuAorIrFfKL00-a5S4m-jNY"
            alt="EcoLift"
            className="w-full h-80 object-cover rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);

  // Step 1: Request password reset OTP
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setOtpExpiresAt(data.expiresAt);
        setShowOTPModal(true);
        setStep(2);
      } else {
        setError(data.message || "Failed to send reset code. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (otpCode) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/verify-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: otpCode }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setOtp(otpCode);
        setShowOTPModal(false);
        setStep(3);
      } else {
        throw new Error(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to verify OTP. Please try again.");
      setLoading(false);
      throw err;
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword,
            confirmPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to reset password");
      }

      const data = await response.json();

      if (data.token) {
        // Success - redirect to login
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
  };

  return (
    <main className="flex min-h-screen w-full relative">
      {/* Go to Home Button - Fixed to Top Right Corner */}
      <div className="absolute top-6 right-6 z-50">
        <Link
          to="/"
          className="px-4 py-2.5 bg-white border border-green-700 text-green-700 rounded-full hover:bg-green-50 transition font-medium text-sm shadow-md flex items-center gap-2"
        >
          ← Go to Home
        </Link>
      </div>

      {/* Left Visual Section */}
      <ForgotPasswordHero />

      {/* Right Form Section */}
      <section className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 pt-12 lg:pt-0">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-green-700 text-2xl">
              eco
            </span>
            <span className="text-2xl font-bold text-green-700">EcoLift</span>
          </div>

          {step === 1 && (
            <>
              <div>
                <h2 className="text-4xl font-bold mb-2">Reset Password</h2>
                <p className="text-gray-600">
                  Enter your email address and we'll send you a verification code.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>

                {/* Send Code Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>

              {/* Footer */}
              <div className="pt-6 text-center">
                <p className="text-gray-600">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-green-700 font-semibold hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 className="text-4xl font-bold mb-2">Create New Password</h2>
                <p className="text-gray-600">
                  Enter your new password below.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block mb-1 font-medium">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-12 px-4 pr-12 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    At least 8 characters with a symbol.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block mb-1 font-medium">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>

                {/* Reset Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className="pt-6 text-center">
                <p className="text-gray-600">
                  Back to{" "}
                  <Link
                    to="/login"
                    className="text-green-700 font-semibold hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        email={email}
        onClose={handleCloseOTPModal}
        onVerifySuccess={handleVerifyOTP}
        isLoading={loading}
        otpExpiresAt={otpExpiresAt}
      />
    </main>
  );
};

export default ForgotPassword;
