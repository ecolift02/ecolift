import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Search } from "lucide-react";
import SearchLocation from "./SearchLocation";
import ViewMap from "../Map/ViewMap";
import { CalendarDays, Users, Search } from "lucide-react";
import SearchLocation from "./SearchLocation";
import ViewMap from "../Map/ViewMap";

const PassengerView = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: null,
    to: null,
    date: "",
    passengers: "1",
  });

  const [showMap, setShowMap] = useState(false);

  const [polyline, setPolyline] = useState(null); // State to hold the polyline data

  // Track field-level validation errors
  const [errors, setErrors] = useState({});

  // Get today's date in YYYY-MM-DD format for the date picker minimum
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the field when the user starts typing/selecting
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLocationChange = (name, value) => {
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the location field when updated
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const { from, to, date, passengers } = searchData;
    const newErrors = {};

    const fromString =
      typeof from === "object" && from !== null ? from.display_name : from;
    const toString =
      typeof to === "object" && to !== null ? to.display_name : to;

    // 1. Validate From
    if (!fromString || fromString.trim() === "") {
      newErrors.from = "Origin is required";
    }

    // 2. Validate To
    if (!toString || toString.trim() === "") {
      newErrors.to = "Destination is required";
    }

    // 3. Validate Date
    if (!date) {
      newErrors.date = "Date is required";
    } else if (date < today) {
      newErrors.date = "Cannot select a past date";
    }

    // Ensure route polyline exists for backend search
    if (!polyline) {
      newErrors.polyline = "Route polyline is required";
    }

    // If there are errors, set them and stop the search
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const searchRequest = {
      polyline,
      departureTime: `${date}T00:00:00`,
      seats: Number(passengers),
    };

    sessionStorage.setItem("rideSearchRequest", JSON.stringify(searchRequest));

    navigate(
      `/search?from=${encodeURIComponent(fromString)}&to=${encodeURIComponent(toString)}&date=${encodeURIComponent(date)}&seats=${encodeURIComponent(passengers)}`,
      `/search?from=${encodeURIComponent(fromString)}&to=${encodeURIComponent(toString)}&date=${encodeURIComponent(date)}&seats=${encodeURIComponent(passengers)}`,
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Origin */}
          <div className="flex flex-col">
            <SearchLocation
              placeholder="From"
              value={searchData.from}
              onChange={(value) => handleLocationChange("from", value)}
              onBlur={() => setShowMap(true)}
            />
            {errors.from && (
              <span className="text-red-500 text-xs mt-1 ml-1">
                {errors.from}
              </span>
            )}
          </div>

          {/* Destination */}
          <div className="flex flex-col">
            <SearchLocation
              placeholder="To"
              value={searchData.to}
              onChange={(value) => handleLocationChange("to", value)}
            />
            {errors.to && (
              <span className="text-red-500 text-xs mt-1 ml-1">
                {errors.to}
              </span>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex flex-col">
            <div className="relative">
              <CalendarDays
                className={`absolute left-3 top-3 ${
                  errors.date ? "text-red-500" : "text-gray-500"
                }`}
                size={20}
              />
              <input
                type="date"
                name="date"
                min={today}
                value={searchData.date}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition ${
                  errors.date ? "border-red-500 focus:ring-red-500" : ""
                }`}
              />
            </div>
            {errors.date && (
              <span className="text-red-500 text-xs mt-1 ml-1">
                {errors.date}
              </span>
            )}
          </div>

          {/* Passengers */}
          <div className="flex flex-col">
            <div className="relative">
              <Users
                className="absolute left-3 top-3 text-gray-500"
                size={20}
              />
              <select
                name="passengers"
                value={searchData.passengers}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              >
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="3">3 Passengers</option>
                <option value="4">4+ Passengers</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col justify-start">
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center justify-center gap-2 px-6 py-3 transition duration-300 max-h-[50px]"
            >
              <Search size={20} />
              Search
            </button>
            {errors.polyline && (
              <span className="text-red-500 text-xs mt-2 ml-1">
                {errors.polyline}
              </span>
            )}
          </div>
        </div>
      </form>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showMap ? "max-h-[500px] mt-6 opacity-100" : "max-h-0 mt-0 opacity-0"
        }`}
      >
        <div className="h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-100">
          {showMap && (
            <ViewMap
              from={searchData.from}
              to={searchData.to}
              setPolyline={setPolyline}
              inPassengerView={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerView;
