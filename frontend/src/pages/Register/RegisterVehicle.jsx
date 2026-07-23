import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const RegisterVehicle = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    manufacturer: "",
    model: "",
    licensePlate: "",
    capacity: "",
  });

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

    // Retrieve the JWT token stored during login
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to register a vehicle.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8083/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass JWT token in headers
        },
        body: JSON.stringify({
          manufacturer: formData.manufacturer,
          model: formData.model,
          licensePlate: formData.licensePlate,
          capacity: parseInt(formData.capacity, 10),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to register vehicle.");
      }

      const data = await response.json();
      console.log("Vehicle Registered Successfully:", data);

      // If the user was upgraded to a driver, you can optionally update local storage user info
      alert("Vehicle registered successfully! You are now a Driver.");

      // Redirect to profile or dashboard
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-gray-50 relative">
      {/* Go to Home Button */}
      <div className="fixed top-6 right-6 z-50">
        <Link
          to="/"
          className="px-5 py-2.5 bg-white border border-green-700 text-green-700 rounded-full hover:bg-green-50 transition font-medium text-sm shadow-md flex items-center gap-2"
        >
          ← Go to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold mb-2 text-green-800">
          Register Vehicle
        </h2>
        <p className="text-gray-500 mb-6">
          Add your vehicle details to start offering rides and sharing your
          eco-journey.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-sm">
              Manufacturer (Make)
            </label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              placeholder="e.g., Toyota, Honda"
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., Prius, Civic"
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              License Plate
            </label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              placeholder="e.g., MH12AB1234"
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Passenger Capacity
            </label>
            <input
              type="number"
              name="capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g., 4"
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50 font-medium shadow-sm"
          >
            {loading ? "Registering Vehicle..." : "Register Vehicle"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterVehicle;
