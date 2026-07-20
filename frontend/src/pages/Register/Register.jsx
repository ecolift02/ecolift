import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "passenger",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <main className="flex min-h-screen w-full">
      {/* Left Section */}

      <section className="flex w-full lg:w-1/2 relative bg-green-900 overflow-hidden items-center justify-center p-16">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-green-400 blur-3xl animate-pulse"></div>

          <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-green-600 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-xl text-white">
          {/* Logo */}

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
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}

          <div className="lg:hidden flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              eco
            </span>

            <span className="text-2xl font-bold text-primary">EcoLift</span>
          </div>

          {/* Heading */}

          <div>
            <h2 className="text-4xl font-bold mb-2">Create your account</h2>

            <p className="text-gray-600">
              Start your journey toward zero-emission commuting today.
            </p>
          </div>

          {/* Social Buttons */}

          <div className="grid grid-cols-2 gap-6">
            <button
              type="button"
              className="flex items-center justify-center gap-3 py-3 border rounded-xl hover:bg-gray-100"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png"
                alt="Google"
                className="w-5 h-5"
              />
              Google
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-3 py-3 border rounded-xl hover:bg-gray-100"
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9edUNTUwO92bMOmOnWWO8zY2hwJ-tAIc2_LvkzXPtxA&s=10"
                alt="Apple"
                className="w-5 h-5"
              />
              Apple
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t"></div>

            <span className="mx-4 text-gray-500 text-sm">
              Or register with email
            </span>

            <div className="flex-grow border-t"></div>
          </div>

          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}

            <div>
              <label className="block mb-1">Full Name</label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="your name"
                className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            {/* Email */}

            <div>
              <label className="block mb-1">Email Address</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="abc@example.com"
                className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="block mb-1">Phone Number</label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  +91
                </span>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98765 43210"
                  className="w-full h-12 pl-12 pr-4 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
            </div>
            {/* Role Selection */}

            <div>
              <label className="block mb-2">Join as</label>

              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`border rounded-2xl p-4 flex flex-col items-center cursor-pointer transition ${
                    formData.role === "passenger"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="passenger"
                    checked={formData.role === "passenger"}
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
                    formData.role === "driver"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="driver"
                    checked={formData.role === "driver"}
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
              <label className="block mb-1">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
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

              <p className="text-sm text-gray-500 mt-1">
                At least 8 characters with a symbol.
              </p>
            </div>

            {/* Create Account Button */}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold transition"
            >
              Create Account
            </button>
          </form>

          {/* Footer */}

          <div className="pt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-green-700 font-semibold hover:underline"
              >
                Log In
              </a>
            </p>
          </div>

          {/* Terms */}

          <p className="text-center text-sm text-gray-500 px-6">
            By clicking <strong>Create Account</strong>, you agree to EcoLift's{" "}
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
