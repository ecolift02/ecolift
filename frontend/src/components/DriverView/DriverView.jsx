import React, { useEffect, useState } from "react";
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
  AlertCircle,
  X,
} from "lucide-react";
import api from "../../api/axiosConfig";

const DriverView = () => {
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  // Form State
  const [rideDetails, setRideDetails] = useState({
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    availableSeats: 1,
    pricePerSeat: "",
  });

  // Flow State
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [vehicleError, setVehicleError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRideDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate minimum allowed time (2 hours from now)
  const getMinDateTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 2);

    // Format to YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const minDateTime = getMinDateTime();

  useEffect(() => {
    const fetchVehicles = async () => {
      setVehicleLoading(true);
      setVehicleError("");

      try {
        const response = await api.get("/v1/vehicles/my");
        const vehicles = Array.isArray(response.data) ? response.data : [];
        setActiveVehicles(vehicles.filter((vehicle) => vehicle.status === "ACTIVE"));
        if (vehicles.length > 0) {
          setSelectedVehicle(vehicles.find((v) => v.status === "ACTIVE") || null);
        }
      } catch (error) {
        setVehicleError("Unable to load your vehicles. Please try again.");
      } finally {
        setVehicleLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleContinue = (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    // Validation: Check if time is at least 2 hours away
    const selectedTime = new Date(rideDetails.departureTime);
    const minAllowedTime = new Date();
    minAllowedTime.setHours(minAllowedTime.getHours() + 2);

    if (selectedTime < minAllowedTime) {
      setError("Departure time must be at least 2 hours from now.");
      return; // Stop the form from advancing
    }

    // Validation: Check if arrival is after departure
    if (new Date(rideDetails.arrivalTime) <= selectedTime) {
      setError("Arrival time must be after the departure time.");
      return;
    }

    if (activeVehicles.length > 0) {
      setSelectedVehicle(activeVehicles[0]);
    }
    setStep(2);
  };

  const handleFinalPublish = (e) => {
    e.preventDefault();

    // Safety check just in case
    if (!selectedVehicle) return;

    setError(null);

    // Prepare payload matching backend RidePublishRequest
    const payload = {
      vehicleId: selectedVehicle.id,
      departureLocationId: rideDetails.sourceLocationId || null,
      arrivalLocationId: rideDetails.destinationLocationId || null,
      departureCity: rideDetails.source,
      arrivalCity: rideDetails.destination,
      departureTime: rideDetails.departureTime,
      estimateArrivalTime: rideDetails.arrivalTime,
      availableSeats: Number(rideDetails.availableSeats),
      pricePerSeat: Number(rideDetails.pricePerSeat),
    };

    // Basic client-side validation
    if (!rideDetails.source || !rideDetails.destination) {
      setError("Please enter both source and destination.");
      return;
    }

    if (!payload.departureTime) {
      setError("Please provide a valid departure time.");
      return;
    }

    if (new Date(payload.departureTime) <= new Date()) {
      setError("Departure time cannot be in the past.");
      return;
    }

    if (payload.estimateArrivalTime && new Date(payload.estimateArrivalTime) <= new Date(payload.departureTime)) {
      setError("Arrival time must be after departure time.");
      return;
    }

    if (payload.pricePerSeat <= 0) {
      setError("Price per seat must be greater than 0.");
      return;
    }

    if (payload.availableSeats <= 0) {
      setError("Available seats must be at least 1.");
      return;
    }

    // Call backend API
    api
      .post("/rides", payload)
      .then((res) => {
        // success - navigate to driver dashboard or published rides
        navigate("/driver/rides");
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to publish ride.";
        setError(msg);
      });
  };

  return (
    <div className="w-full">
      {/* Quick nav to the driver's published rides list */}
      {step === 1 && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Publish a Ride</h2>
          <button
            type="button"
            onClick={() => navigate("/driver/rides")}
            className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <Car className="h-4 w-4" />
            My Rides
          </button>
        </div>
      )}

      {/* STEP 1: Original Ride Details Form */}

      {step === 1 && (
        <form
          onSubmit={handleContinue}
          className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          {/* Custom Alert Box UI */}
          {error && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-600">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                type="button" // Prevents form submission when closing the alert
                onClick={() => setError(null)}
                className="rounded-full p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Source */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
              <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
              <input
                type="text"
                name="source"
                value={rideDetails.source}
                onChange={handleChange}
                placeholder="Origin / Pick-up Location"
                required
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Destination */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
              <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
              <input
                type="text"
                name="destination"
                value={rideDetails.destination}
                onChange={handleChange}
                placeholder="Destination / Drop-off Location"
                required
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Departure Time */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-300">
                Departure Time
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
                <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={rideDetails.departureTime}
                  onChange={handleChange}
                  min={minDateTime}
                  required
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Arrival Time */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-300">
                Estimated Arrival Time
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
                <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={rideDetails.arrivalTime}
                  onChange={handleChange}
                  min={rideDetails.departureTime || minDateTime}
                  required
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Available Seats */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
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

            {/* Price Per Seat */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
              <IndianRupee className="h-5 w-5 text-emerald-600 shrink-0" />
              <input
                type="number"
                name="pricePerSeat"
                min="10"
                value={rideDetails.pricePerSeat}
                onChange={handleChange}
                placeholder="Price per Seat greater than ₹10"
                required
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
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
                {activeVehicles.length === 0
                  ? "You need to add a vehicle before publishing a ride."
                  : "Which car are you driving for this trip?"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Renders registered vehicles if any exist */}
            {activeVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                  selectedVehicle?.id === vehicle.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Car className="text-emerald-700 h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">
                      {vehicle.vehicleName}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {vehicle.vehicleNumber}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Vehicle Button */}
            <button
              type="button"
              onClick={() =>
                navigate("/register-vehicle", {
                  state: { savedRide: rideDetails },
                })
              }
              className="p-4 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all group min-h-22"
            >
              <Plus className="text-slate-400 group-hover:text-emerald-600 transition" />
              <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-700 transition">
                Add new vehicle
              </span>
            </button>
          </div>

          <div className="flex justify-end pt-4">
            {/* Disable publish button if no vehicle is selected */}
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
