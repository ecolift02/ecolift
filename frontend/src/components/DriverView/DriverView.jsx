import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  Users,
  Send,
  Car,
  Plus,
  ArrowLeft,
  IndianRupee,
} from "lucide-react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

const DriverView = () => {
  const navigate = useNavigate();

  const [userVehicles, setUserVehicles] = useState([]);

  const { currentMode } = useAuth();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get("/v1/vehicles/my");
        const vehicles = res?.data || [];
        setUserVehicles(vehicles);
        // If user is already on step 2 and no vehicle selected, pick first
        if (vehicles.length > 0 && step === 2 && !selectedVehicle) {
          setSelectedVehicle(vehicles[0]);
        }
      } catch (err) {
        // silently ignore for now; UI already shows message when list empty
        console.error("Failed to load vehicles:", err?.response || err);
      }
    };

    if (currentMode === "DRIVER") {
      fetchVehicles();
    }
  }, [currentMode]);

  // Form State
  const [rideDetails, setRideDetails] = useState({
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    availableSeats: 1,
    pricePerSeat: "",
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setRideDetails((prev) => ({ ...prev, [name]: value }));

    // Real-time field validation
    let fieldError = "";

    if (value.trim() === "") {
      fieldError = "This field is required";
    } else {
      if (
        (name === "source" || name === "destination") &&
        value.trim().length < 3
      ) {
        fieldError = "Must be at least 3 characters";
      } else if (name === "pricePerSeat" && Number(value) < 10) {
        fieldError = "Price must be at least ₹10";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const getMinDateTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const minDateTime = getMinDateTime();

  const handleContinue = (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    // 1. Validate Source
    if (!rideDetails.source.trim()) {
      newErrors.source = "Origin is required";
      hasError = true;
    } else if (rideDetails.source.trim().length < 3) {
      newErrors.source = "Must be at least 3 characters";
      hasError = true;
    }

    // 2. Validate Destination
    if (!rideDetails.destination.trim()) {
      newErrors.destination = "Destination is required";
      hasError = true;
    } else if (rideDetails.destination.trim().length < 3) {
      newErrors.destination = "Must be at least 3 characters";
      hasError = true;
    }

    // 3. Validate Price
    if (!rideDetails.pricePerSeat) {
      newErrors.pricePerSeat = "Price is required";
      hasError = true;
    } else if (Number(rideDetails.pricePerSeat) < 10) {
      newErrors.pricePerSeat = "Price must be at least ₹10";
      hasError = true;
    }

    // 4. Validate Departure Time
    if (!rideDetails.departureTime) {
      newErrors.departureTime = "Departure time is required";
      hasError = true;
    } else {
      const selectedTime = new Date(rideDetails.departureTime);
      selectedTime.setSeconds(0, 0);

      const minAllowedTime = new Date();
      minAllowedTime.setHours(minAllowedTime.getHours() + 1);
      minAllowedTime.setSeconds(0, 0);

      if (selectedTime < minAllowedTime) {
        newErrors.departureTime = "Must be at least 1 hours from now";
        hasError = true;
      }
    }

    // 5. Validate Arrival Time
    if (!rideDetails.arrivalTime) {
      newErrors.arrivalTime = "Arrival time is required";
      hasError = true;
    } else if (rideDetails.departureTime) {
      const arrivalTime = new Date(rideDetails.arrivalTime);
      arrivalTime.setSeconds(0, 0);

      const selectedTime = new Date(rideDetails.departureTime);
      selectedTime.setSeconds(0, 0);

      if (arrivalTime <= selectedTime) {
        newErrors.arrivalTime = "Must be after departure time";
        hasError = true;
      }
    }

    // If any error exists, stop and show them
    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // If successful, clear errors and move to step 2
    setErrors({});
    if (userVehicles.length > 0) {
      setSelectedVehicle(userVehicles[0]);
    }
    setStep(2);
  };

  const handleFinalPublish = (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    console.log("Finalizing Publish with:", {
      ...rideDetails,
      vehicle: selectedVehicle,
    });
    // Integration logic for POST /api/v1/rides goes here
  };

  return (
    <div className="w-full">
      {/* STEP 1: Original Ride Details Form */}
      {step === 1 && (
        <form
          onSubmit={handleContinue}
          noValidate // <-- THIS STOPS HTML BROWSER WARNINGS
          className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Source */}
            <div className="flex flex-col gap-1">
              <div
                className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-3 transition focus-within:bg-white focus-within:ring-2 ${
                  errors.source
                    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-100"
                    : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-emerald-100"
                }`}
              >
                <MapPin
                  className={`h-5 w-5 shrink-0 ${errors.source ? "text-red-500" : "text-emerald-600"}`}
                />
                <input
                  type="text"
                  name="source"
                  value={rideDetails.source}
                  onChange={handleChange}
                  placeholder="Origin / Pick-up Location"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.source && (
                <p className="text-red-500 text-xs ml-1">{errors.source}</p>
              )}
            </div>

            {/* Destination */}
            <div className="flex flex-col gap-1">
              <div
                className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-3 transition focus-within:bg-white focus-within:ring-2 ${
                  errors.destination
                    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-100"
                    : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-emerald-100"
                }`}
              >
                <MapPin
                  className={`h-5 w-5 shrink-0 ${errors.destination ? "text-red-500" : "text-emerald-600"}`}
                />
                <input
                  type="text"
                  name="destination"
                  value={rideDetails.destination}
                  onChange={handleChange}
                  placeholder="Destination / Drop-off Location"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.destination && (
                <p className="text-red-500 text-xs ml-1">
                  {errors.destination}
                </p>
              )}
            </div>

            {/* Departure Time */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">
                Departure Time
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 transition focus-within:bg-white focus-within:ring-2 ${
                  errors.departureTime
                    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-100"
                    : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-emerald-100"
                }`}
              >
                <Clock
                  className={`h-5 w-5 shrink-0 ${errors.departureTime ? "text-red-500" : "text-emerald-600"}`}
                />
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={rideDetails.departureTime}
                  onChange={handleChange}
                  min={minDateTime}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                />
              </div>
              {errors.departureTime && (
                <p className="text-red-500 text-xs ml-1">
                  {errors.departureTime}
                </p>
              )}
            </div>

            {/* Arrival Time */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">
                Estimated Arrival Time
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 transition focus-within:bg-white focus-within:ring-2 ${
                  errors.arrivalTime
                    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-100"
                    : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-emerald-100"
                }`}
              >
                <Clock
                  className={`h-5 w-5 shrink-0 ${errors.arrivalTime ? "text-red-500" : "text-emerald-600"}`}
                />
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={rideDetails.arrivalTime}
                  onChange={handleChange}
                  min={rideDetails.departureTime || minDateTime}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                />
              </div>
              {errors.arrivalTime && (
                <p className="text-red-500 text-xs ml-1">
                  {errors.arrivalTime}
                </p>
              )}
            </div>

            {/* Available Seats */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 mt-5">
                <Users className="h-5 w-5 text-emerald-600 shrink-0" />
                <select
                  name="availableSeats"
                  value={rideDetails.availableSeats}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Seat Available" : "Seats Available"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Per Seat */}
            <div className="flex flex-col gap-1">
              <div
                className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-3 transition focus-within:bg-white focus-within:ring-2 mt-5 ${
                  errors.pricePerSeat
                    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-100"
                    : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-emerald-100"
                }`}
              >
                <IndianRupee
                  className={`h-5 w-5 shrink-0 ${errors.pricePerSeat ? "text-red-500" : "text-emerald-600"}`}
                />
                <input
                  type="number"
                  name="pricePerSeat"
                  value={rideDetails.pricePerSeat}
                  onChange={handleChange}
                  placeholder="Price per Seat greater than ₹10"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.pricePerSeat && (
                <p className="text-red-500 text-xs ml-1">
                  {errors.pricePerSeat}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              <span>Continue</span>
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Vehicle Selection */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <button
              onClick={() => setStep(1)}
              className="p-2 hover:bg-emerald-500 rounded-full transition text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h3 className="font-semibold text-white text-lg">
                Select your vehicle
              </h3>
              <p className="text-xs text-green-400">
                {userVehicles.length === 0
                  ? "You need to add a vehicle before publishing a ride."
                  : "Which car are you driving for this trip?"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                  selectedVehicle?.id === vehicle.id
                    ? "border-emerald-500 bg-emerald-50 "
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center ">
                    <Car className="text-emerald-700 h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-200">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {vehicle.plate}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                navigate("/register-vehicle", {
                  state: { savedRide: rideDetails },
                })
              }
              className="p-4 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all group min-h-[88px]"
            >
              <Plus className="text-slate-400 group-hover:text-emerald-600 transition" />
              <span className="text-sm font-medium text-slate-200 group-hover:text-emerald-700 transition">
                Add new vehicle
              </span>
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleFinalPublish}
              disabled={!selectedVehicle}
              className={`flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-md transition ${
                selectedVehicle
                  ? "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Confirm & Publish</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverView;
