import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();

  // 1. You must extract the login function from useAuth!
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "PASSENGER",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8083/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Registration failed. Please try again.");
      }

      const data = await response.json();

      if (data.token) {
        // 2. Destructure the values out of 'data' so they are defined
        const { token, email, name, roles } = data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data));

        // 3. Now this login function is defined and has the correct variables
        login(token, { email, name, roles });
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
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

      {/* Left Section */}
      <section className="hidden lg:flex w-1/2 relative bg-green-900 overflow-hidden items-center justify-center p-16">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-green-400 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-green-600 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-xl text-white">
          <div className="mb-12 flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl">
              <span className="material-symbols-outlined text-green-900 text-3xl">
                eco
              </span>
            </div>
            <span className="text-3xl font-bold">EcoLift</span>
          </div>

          <h1 className="text-6xl font-bold leading-tight mb-6">
            Join the movement for a greener planet.
          </h1>

          <p className="text-lg opacity-80 mb-10">
            Experience the future of sustainable mobility. Track your carbon
            savings, share rides with trusted neighbors, and grow your local
            ecosystem.
          </p>

          <div className="rounded-3xl overflow-hidden shadow-2xl rotate-1 bg-white p-2">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBacN1O42QueQg-9jjhNlf4h8S5IiOn0u0tIEAZrFHcl6gFFZXjEP9iVarqxxtkOddJurF4JVZZC2z8q-aIUHXELfYceNusL5-iBLB48rQpm9RUm1CUYPYKrhrSdSWfu3LiAvQatBE8_plmYEp4UHc1ZSt-NkS6oqPoZA_0IHet7p0dHq-iFMvu4Maym41Vc6P5P4TklCpy299u-ILEi_PElG0Y-EAr3R1VRacBhtVGH9cdomzaHGIqzuAorIrFfKL00-a5S4m-jNY"
              alt="EcoLift"
              className="w-full h-80 object-cover rounded-2xl"
            />
          </div>

          <div className="mt-12 flex gap-8">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-green-300">12k+</span>
              <span className="text-sm opacity-70">Active Lifters</span>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl font-bold text-green-300">500t</span>
              <span className="text-sm opacity-70">CO₂ Saved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section */}
      <section className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 pt-12 lg:pt-0">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-green-700 text-2xl">
              eco
            </span>
            <span className="text-2xl font-bold text-green-700">EcoLift</span>
          </div>

          <div>
            <h2 className="text-4xl font-bold mb-2">Create your account</h2>
            <p className="text-gray-600">
              Start your journey toward zero-emission commuting today.
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="your name"
                required
                className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="abc@example.com"
                required
                className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1 font-medium">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  className="w-full h-12 pl-12 pr-4 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block mb-2 font-medium">Join as</label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`border rounded-2xl p-4 flex flex-col items-center cursor-pointer transition ${
                    formData.role === "passenger" ||
                    formData.role === "PASSENGER"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="PASSENGER"
                    checked={
                      formData.role === "passenger" ||
                      formData.role === "PASSENGER"
                    }
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-green-700 mb-2">
                    person
                  </span>
                  <span className="font-medium">Passenger</span>
                </label>

                <label
                  className={`border rounded-2xl p-4 flex flex-col items-center cursor-pointer transition ${
                    formData.role === "driver" || formData.role === "DRIVER"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="DRIVER"
                    checked={
                      formData.role === "driver" || formData.role === "DRIVER"
                    }
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-green-700 mb-2">
                    directions_car
                  </span>
                  <span className="font-medium">Driver</span>
                </label>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-700 font-semibold hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="text-center text-sm text-gray-500 px-6">
            By clicking <strong>Create Account</strong>, you agree to EcoLift's{" "}
            <br />
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;
