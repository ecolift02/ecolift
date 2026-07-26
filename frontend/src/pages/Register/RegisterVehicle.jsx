import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Car,
  Hash,
  Palette,
  Users,
  Fuel,
  CalendarDays,
  FileText,
  ToggleLeft,
  AlertCircle,
  CheckCircle2,
  Tag,
} from "lucide-react";
import api from "../../api/axiosConfig";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100";

const labelClasses = "mb-1.5 block text-xs font-medium text-slate-500";

const Field = ({ icon: Icon, label, children }) => (
  <div>
    <label className={labelClasses}>{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
      )}
      {React.cloneElement(children, {
        className: `${inputClasses} ${Icon ? "pl-10" : ""}`,
      })}
    </div>
  </div>
);

const RegisterVehicle = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    vehicleName: "",
    vehicleNumber: "",
    vehicleType: "Car",
    brand: "",
    model: "",
    color: "",
    seatCapacity: 4,
    fuelType: "Petrol",
    manufacturingYear: new Date().getFullYear(),
    registrationNumber: "",
    status: "ACTIVE",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
      await api.post("/v1/vehicles", {
        vehicleName: formData.vehicleName,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        brand: formData.brand,
        model: formData.model,
        color: formData.color,
        seatCapacity: parseInt(formData.seatCapacity, 10),
        fuelType: formData.fuelType,
        manufacturingYear: parseInt(formData.manufacturingYear, 10),
        registrationNumber: formData.registrationNumber,
        status: formData.status,
      });

      setSuccess(true);

      // If the driver arrived here mid-way through publishing a ride, send them
      // back to that flow; otherwise go to their profile.
      const savedRide = location.state?.savedRide;
      setTimeout(() => {
        navigate(savedRide ? "/" : "/profile", {
          state: savedRide ? { savedRide } : undefined,
        });
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong while registering your vehicle. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-10 md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/15 p-3">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Register Your Vehicle
                  </h1>
                  <p className="mt-1 text-sm text-emerald-50">
                    Add your vehicle details to start offering rides and
                    sharing your eco-journey.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/driver/vehicles")}
                className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                View My Vehicles
              </button>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="px-4 py-8 md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">
                    Vehicle registered successfully! Redirecting...
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section: Basic Info */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Basic Info
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field icon={Car} label="Vehicle Name">
                      <input
                        type="text"
                        name="vehicleName"
                        value={formData.vehicleName}
                        onChange={handleChange}
                        placeholder="e.g., Toyota Prius"
                        required
                      />
                    </Field>

                    <Field icon={Hash} label="Vehicle Number">
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        placeholder="e.g., MH12AB1234"
                        required
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <label className={labelClasses}>Vehicle Type</label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className={inputClasses}
                      >
                        <option value="Car">Car</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Bike">Bike</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Vehicle Details */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Vehicle Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field icon={Tag} label="Brand">
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="e.g., Toyota"
                        required
                      />
                    </Field>

                    <Field icon={Car} label="Model">
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="e.g., Prius"
                        required
                      />
                    </Field>

                    <Field icon={Palette} label="Color">
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="e.g., Blue"
                        required
                      />
                    </Field>

                    <Field icon={CalendarDays} label="Manufacturing Year">
                      <input
                        type="number"
                        name="manufacturingYear"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.manufacturingYear}
                        onChange={handleChange}
                        required
                      />
                    </Field>
                  </div>
                </div>

                {/* Section: Capacity & Fuel */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Capacity &amp; Fuel
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field icon={Users} label="Seat Capacity">
                      <input
                        type="number"
                        name="seatCapacity"
                        min="1"
                        max="10"
                        value={formData.seatCapacity}
                        onChange={handleChange}
                        required
                      />
                    </Field>

                    <div>
                      <label className={labelClasses}>Fuel Type</label>
                      <div className="relative">
                        <Fuel className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                        <select
                          name="fuelType"
                          value={formData.fuelType}
                          onChange={handleChange}
                          className={`${inputClasses} pl-10`}
                        >
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Electric">Electric</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="CNG">CNG</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Registration */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Registration
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field icon={FileText} label="Registration Number">
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        placeholder="e.g., MH12AB1234"
                        required
                      />
                    </Field>

                    <div>
                      <label className={labelClasses}>Status</label>
                      <div className="relative">
                        <ToggleLeft className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className={`${inputClasses} pl-10`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Registering Vehicle..." : "Register Vehicle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default RegisterVehicle;
