import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import OTPModal from "../../../components/OTP/OTPModal";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Track field-specific and global errors
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    global: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email/Password, 2: OTP Verification
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Regex Patterns
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/; // 8+ chars, 1 uppercase, 1 symbol

  // Real-time "then and there" validation for Email
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);

    if (val.trim() === "") {
      setErrors((prev) => ({ ...prev, email: "Email is required", global: "" }));
    } else if (!EMAIL_REGEX.test(val)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email address format", global: "" }));
    } else {
      setErrors((prev) => ({ ...prev, email: "", global: "" }));
    }
  };

  // Real-time "then and there" validation for Password
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    if (val === "") {
      setErrors((prev) => ({ ...prev, password: "Password is required", global: "" }));
    } else if (!PASSWORD_REGEX.test(val)) {
      setErrors((prev) => ({ 
        ...prev, 
        password: "Must be at least 8 characters, 1 uppercase, and include a symbol", 
        global: "" 
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: "", global: "" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); 
    
    // Final safety check before submitting
    let hasError = false;
    const newErrors = { email: "", password: "", global: "" };

    if (!email) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Invalid email address format";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Password is required";
      hasError = true;
    } else if (!PASSWORD_REGEX.test(password)) {
      newErrors.password = "Must be at least 8 characters, 1 uppercase, and include a symbol";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({ email: "", password: "", global: "" });
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

      // Assuming 'data' contains the user info and 'data.token' is the JWT.
      login(data, data.token);

      // Redirect to the home page (or dashboard)
      navigate("/");
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        global: err.message || "Failed to login. Please try again.",
      }));
    } finally {
      setLoading(false);
      throw err;
    }
  };

  // Helper to disable button if there are active errors or empty fields
  const isFormInvalid = errors.email !== "" || errors.password !== "" || email === "" || password === "";

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
      {/* Go to Home Button */}
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

        {/* Global Error Message Display */}
        {errors.global && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errors.global}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="name@company.com"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition ${
                errors.email 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-200 focus:ring-green-600"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 outline-none transition ${
                  errors.password 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-200 focus:ring-green-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                <span className="material-symbols-outlined mt-1">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>
            )}
          </div>


          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || isFormInvalid}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50 mt-2 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-green-700 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;