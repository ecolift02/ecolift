import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { loginUser } from "../../../api/authApi";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    global: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = location.state?.infoMessage;
  const { login } = useAuth();

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);

    if (val.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required",
        global: "",
      }));
    } else if (!EMAIL_REGEX.test(val)) {
      setErrors((prev) => ({
        ...prev,
        email: "Invalid email address format",
        global: "",
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: "", global: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    if (val === "") {
      setErrors((prev) => ({
        ...prev,
        password: "Password is required",
        global: "",
      }));
    } else if (!PASSWORD_REGEX.test(val)) {
      setErrors((prev) => ({
        ...prev,
        password:
          "Must be at least 8 characters, 1 uppercase, and include a symbol",
        global: "",
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: "", global: "" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

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
      newErrors.password =
        "Must be at least 8 characters, 1 uppercase, and include a symbol";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({ email: "", password: "", global: "" });
    setLoading(true);

    try {
      const { data } = await loginUser({ email, password });
      login(data, data.token);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 403) {
        navigate("/verify-otp", { state: { email } });
        return;
      }
      setErrors((prev) => ({
        ...prev,
        global:
          err.response?.data?.message || "Failed to login. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid =
    errors.email !== "" ||
    errors.password !== "" ||
    email === "" ||
    password === "";

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative min-h-screen lg:min-h-0">
      {/* Go to Home Button */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <Link
          to="/"
          title="Go to Home"
          className="p-2.5 md:px-5 md:py-2.5 bg-white border border-green-700 text-green-700 rounded-full hover:bg-green-50 transition font-medium text-sm shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          {/* Icon always shows, sizes adjust slightly for mobile vs desktop */}
          <span className="material-symbols-outlined text-[22px] md:text-[18px]">
            home
          </span>
          {/* Text is hidden on small screens, block on medium (md) and up */}
          <span className="hidden md:block">Go to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md mt-12 md:mt-0">
        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>

        <p className="text-gray-500 mb-8">
          Enter your credentials to access your dashboard
        </p>

        {infoMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {infoMessage}
          </div>
        )}

        {errors.global && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errors.global}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium">Password</label>
              <Link
                to="/forgot-password"
                className="text-sm text-green-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isFormInvalid}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50 mt-2 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

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
