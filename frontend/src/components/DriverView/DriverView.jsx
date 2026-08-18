import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  Send,
  Car,
  Plus,
  ArrowLeft,
  IndianRupee,
  AlertCircle,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import api from "../../api/axiosConfig";
import { getRoute } from "../../api/mapService";
import SearchLocation from "../PassengerView/SearchLocation";
import ViewMap from "../Map/ViewMap";

const SEAT_OPTIONS = [
  { value: "1", label: "1 Seat Available" },
  { value: "2", label: "2 Seats Available" },
  { value: "3", label: "3 Seats Available" },
  { value: "4", label: "4 Seats Available" },
  { value: "5", label: "5 Seats Available" },
  { value: "6", label: "6 Seats Available" },
];

const DriverView = () => {
  const navigate = useNavigate();

  // Global Error for API failures
  const [error, setError] = useState(null);

  // Inline Errors for form validation
  const [errors, setErrors] = useState({});

  // Form State
  const [rideDetails, setRideDetails] = useState({
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    availableSeats: "1",
    pricePerSeat: "",
  });

  const [showMap, setShowMap] = useState(false);

  // Custom Dropdown State
  const [isSeatDropdownOpen, setIsSeatDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSeatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Flow State
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [vehicleError, setVehicleError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRideDetails((prev) => ({ ...prev, [name]: value }));

    // Clear error for the field when the user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSeatSelect = (value) => {
    setRideDetails((prev) => ({
      ...prev,
      availableSeats: value,
    }));
    if (errors.availableSeats) {
      setErrors((prev) => ({ ...prev, availableSeats: "" }));
    }
    setIsSeatDropdownOpen(false);
  };

  const selectedSeatLabel =
    SEAT_OPTIONS.find(
      (opt) => String(opt.value) === String(rideDetails?.availableSeats),
    )?.label || "1 Seat Available";

  const handleLocationChange = (name, value) => {
    setRideDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the location field when updated
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Calculate minimum allowed time (2 hours from now)
  const getMinDateTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 2);

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
        setActiveVehicles(
          vehicles.filter((vehicle) => vehicle.status === "ACTIVE"),
        );
        if (vehicles.length > 0) {
          setSelectedVehicle(
            vehicles.find((v) => v.status === "ACTIVE") || null,
          );
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
    setError(null);

    const newErrors = {};
    let hasError = false;

    const sourceString =
      typeof rideDetails.source === "object" && rideDetails.source !== null
        ? rideDetails.source.display_name
        : rideDetails.source;
    const destString =
      typeof rideDetails.destination === "object" &&
      rideDetails.destination !== null
        ? rideDetails.destination.display_name
        : rideDetails.destination;

    if (!sourceString || sourceString.trim() === "") {
      newErrors.source = "Origin is required";
      hasError = true;
    } else if (sourceString.trim().length < 3) {
      newErrors.source = "Must be at least 3 characters";
      hasError = true;
    }

    if (!destString || destString.trim() === "") {
      newErrors.destination = "Destination is required";
      hasError = true;
    } else if (destString.trim().length < 3) {
      newErrors.destination = "Must be at least 3 characters";
      hasError = true;
    }

    if (!rideDetails.pricePerSeat) {
      newErrors.pricePerSeat = "Price is required";
      hasError = true;
    } else if (Number(rideDetails.pricePerSeat) < 10) {
      newErrors.pricePerSeat = "Price must be at least ₹10";
      hasError = true;
    }

    if (!rideDetails.departureTime) {
      newErrors.departureTime = "Departure time is required";
      hasError = true;
    } else {
      const selectedTime = new Date(rideDetails.departureTime);
      selectedTime.setSeconds(0, 0);

      const minAllowedTime = new Date();
      minAllowedTime.setHours(minAllowedTime.getHours() + 2);
      minAllowedTime.setSeconds(0, 0);

      if (selectedTime < minAllowedTime) {
        newErrors.departureTime = "Must be at least 2 hours from now";
        hasError = true;
      }
    }

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

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (activeVehicles.length > 0) {
      setSelectedVehicle(activeVehicles[0]);
    }
    setStep(2);
  };

  const handleFinalPublish = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) return;
    setError(null);

    const sourceString =
      typeof rideDetails.source === "object" && rideDetails.source !== null
        ? rideDetails.source.display_name
        : rideDetails.source;
    const destString =
      typeof rideDetails.destination === "object" &&
      rideDetails.destination !== null
        ? rideDetails.destination.display_name
        : rideDetails.destination;

    const sourceLocation = rideDetails.source;
    const destinationLocation = rideDetails.destination;

    let routeData = { polyline: "", distanceKm: 0 };

    if (
      sourceLocation?.lat &&
      sourceLocation?.lon &&
      destinationLocation?.lat &&
      destinationLocation?.lon
    ) {
      try {
        routeData = await getRoute(sourceLocation, destinationLocation);
      } catch (error) {
        console.error("Failed to fetch route details", error);
      }
    }

    const payload = {
      vehicleId: selectedVehicle.id,
      startAddress: sourceString,
      startLatitude: sourceLocation?.lat ?? null,
      startLongitude: sourceLocation?.lon ?? null,
      endAddress: destString,
      endLatitude: destinationLocation?.lat ?? null,
      endLongitude: destinationLocation?.lon ?? null,
      distanceKm: routeData.distanceKm,
      polyline: routeData.polyline,
      departureTime: rideDetails.departureTime,
      estimateArrivalTime: rideDetails.arrivalTime,
      availableSeats: Number(rideDetails.availableSeats),
      pricePerSeat: Number(rideDetails.pricePerSeat),
    };

    api
      .post("/rides", payload)
      .then(() => {
        navigate("/driver/rides");
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to publish ride.";
        setError(msg);
      });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl p-6">
      {/* Quick nav to the driver's published rides list */}
      {step === 1 && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Publish a Ride</h2>
          <button
            type="button"
            onClick={() => navigate("/driver/rides")}
            className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 p-2 md:px-4 md:py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shrink-0"
            aria-label="My Rides"
          >
            <Car className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">My Rides</span>
          </button>
        </div>
      )}

      {/* STEP 1: Ride Details Form */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <form onSubmit={handleContinue} noValidate className="space-y-4">
            {error && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-600 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="rounded-full p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Origin */}
              <div className="flex flex-col">
                <SearchLocation
                  placeholder="Origin"
                  value={rideDetails.source}
                  hasError={Boolean(errors.source)}
                  onChange={(value) => handleLocationChange("source", value)}
                  onBlur={() => setShowMap(true)}
                />
                {errors.source && (
                  <span className="text-red-500 text-xs mt-1 ml-1">
                    {errors.source}
                  </span>
                )}
              </div>

              {/* Destination */}
              <div className="flex flex-col">
                <SearchLocation
                  placeholder="Destination"
                  value={rideDetails.destination}
                  hasError={Boolean(errors.destination)}
                  onChange={(value) =>
                    handleLocationChange("destination", value)
                  }
                  onBlur={() => setShowMap(true)}
                />
                {errors.destination && (
                  <span className="text-red-500 text-xs mt-1 ml-1">
                    {errors.destination}
                  </span>
                )}
              </div>

              {/* Price Per Seat */}
              <div className="flex flex-col">
                <div className="relative">
                  <IndianRupee
                    className={`absolute left-3 top-4 ${errors.pricePerSeat ? "text-red-500" : "text-gray-400"}`}
                    size={20}
                  />
                  <input
                    type="number"
                    min="10"
                    name="pricePerSeat"
                    value={rideDetails.pricePerSeat}
                    onChange={handleChange}
                    placeholder="Price per Seat (Min ₹10)"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                      errors.pricePerSeat
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-green-600"
                    }`}
                  />
                </div>
                {errors.pricePerSeat && (
                  <span className="text-red-500 text-xs mt-1 ml-1">
                    {errors.pricePerSeat}
                  </span>
                )}
              </div>

              {/* Departure Time */}
              <div className="flex flex-col">
                <div className="relative">
                  <Clock
                    className={`absolute left-3 top-3.5 z-10 pointer-events-none ${
                      errors.departureTime ? "text-red-500" : "text-slate-400"
                    }`}
                    size={20}
                  />
                  <input
                    type="datetime-local"
                    name="departureTime"
                    value={rideDetails.departureTime}
                    onChange={handleChange}
                    min={minDateTime}
                    className={`relative w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition text-sm text-slate-800 bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                      errors.departureTime
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors.departureTime && (
                  <span className="text-red-500 text-xs mt-1 ml-1 font-medium">
                    {errors.departureTime}
                  </span>
                )}
              </div>

              {/* Arrival Time */}
              <div className="flex flex-col">
                <div className="relative">
                  <Clock
                    className={`absolute left-3 top-3.5 z-10 pointer-events-none ${
                      errors.arrivalTime ? "text-red-500" : "text-slate-400"
                    }`}
                    size={20}
                  />
                  <input
                    type="datetime-local"
                    name="arrivalTime"
                    value={rideDetails.arrivalTime}
                    onChange={handleChange}
                    min={rideDetails.departureTime || minDateTime}
                    className={`relative w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition text-sm text-slate-800 bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                      errors.arrivalTime
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors.arrivalTime && (
                  <span className="text-red-500 text-xs mt-1 ml-1 font-medium">
                    {errors.arrivalTime}
                  </span>
                )}
              </div>

              {/* Available Seats (Custom Styled Dropdown) */}
              <div className="flex flex-col relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSeatDropdownOpen((prev) => !prev)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-left flex items-center justify-between text-sm transition outline-none ${
                    errors.availableSeats
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : isSeatDropdownOpen
                        ? "border-green-600 ring-2 ring-green-600/20 bg-green-50/20"
                        : "border-slate-300 hover:border-slate-400 bg-white"
                  }`}
                >
                  <Users
                    className={`absolute left-3 top-3.5 z-10 pointer-events-none ${
                      errors.availableSeats ? "text-red-500" : "text-gray-400"
                    }`}
                    size={20}
                  />
                  <span className="font-medium text-slate-800">
                    {selectedSeatLabel}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isSeatDropdownOpen ? "rotate-180 text-green-700" : ""
                    }`}
                  />
                </button>

                {/* Styled Dropdown Menu */}
                {isSeatDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {SEAT_OPTIONS.map((option) => {
                      const isSelected =
                        String(rideDetails?.availableSeats) ===
                        String(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSeatSelect(option.value)}
                          className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-800 font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && (
                            <Check
                              size={16}
                              className="text-emerald-700 shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.availableSeats && (
                  <span className="text-red-500 text-xs mt-1 ml-1 font-medium">
                    {errors.availableSeats}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-green-700 hover:bg-green-800 px-8 py-3 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] w-full md:w-auto"
              >
                <span>Continue</span>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Expandable Map Transition identical to PassengerView */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showMap
                ? "max-h-[500px] mt-6 opacity-100"
                : "max-h-0 mt-0 opacity-0"
            }`}
          >
            <div className="h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-100">
              {showMap && (
                <ViewMap
                  from={rideDetails.source}
                  to={rideDetails.destination}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Vehicle Selection */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {error && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-600 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="rounded-full p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <button
              onClick={() => setStep(1)}
              className="p-2 hover:bg-slate-100 text-slate-600 rounded-full transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">
                Select your vehicle
              </h3>
              <p className="text-xs text-slate-500">
                {activeVehicles.length === 0
                  ? "You need to add a vehicle before publishing a ride."
                  : "Which car are you driving for this trip?"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-700 transition">
                Add new vehicle
              </span>
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleFinalPublish}
              disabled={!selectedVehicle}
              className={`flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold text-white shadow-md transition ${
                selectedVehicle
                  ? "bg-green-700 hover:bg-green-800 active:scale-[0.98]"
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
