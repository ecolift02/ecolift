import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
// 1. Import the useAuth hook from your context file (Adjust the path if needed)
import { useAuth } from "../../../context/AuthContext"; 

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  // 2. Destructure the login function from your AuthContext
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8083/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      // 3. Use your context's login function. 
      // It handles localStorage automatically, so you don't need to do it here.
      // Assuming 'data' contains the user info and 'data.token' is the JWT.
      login(data, data.token);

      // Redirect to the home page (or dashboard)
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
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
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
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
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
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
    </div>
  );
};

export default LoginForm;