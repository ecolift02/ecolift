import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Search, ChevronDown, Check } from "lucide-react";
import SearchLocation from "./SearchLocation";
import ViewMap from "../Map/ViewMap";

const PASSENGER_OPTIONS = [
  { value: "1", label: "1 Passenger" },
  { value: "2", label: "2 Passengers" },
  { value: "3", label: "3 Passengers" },
  { value: "4", label: "4+ Passengers" },
];

const PassengerView = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: null,
    to: null,
    date: "",
    passengers: "1",
  });

  const [showMap, setShowMap] = useState(false);
  const [polyline, setPolyline] = useState(null);
  const [errors, setErrors] = useState({});

  const [isPassengerDropdownOpen, setIsPassengerDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPassengerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLocationChange = (name, value) => {
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePassengerSelect = (value) => {
    setSearchData((prev) => ({
      ...prev,
      passengers: value,
    }));
    setIsPassengerDropdownOpen(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const { from, to, date, passengers } = searchData;
    const newErrors = {};

    const fromString =
      typeof from === "object" && from !== null ? from.display_name : from;
    const toString =
      typeof to === "object" && to !== null ? to.display_name : to;

    if (!fromString || fromString.trim() === "") {
      newErrors.from = "Origin is required";
    }

    if (!toString || toString.trim() === "") {
      newErrors.to = "Destination is required";
    }

    if (!date) {
      newErrors.date = "Date is required";
    } else if (date < today) {
      newErrors.date = "Cannot select a past date";
    }

    if (!polyline) {
      newErrors.polyline = "Select a valid route on the map.";
    }

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
      `/search?from=${encodeURIComponent(fromString)}&to=${encodeURIComponent(
        toString,
      )}&date=${encodeURIComponent(date)}&seats=${encodeURIComponent(
        passengers,
      )}`,
    );
  };

  const selectedPassengerLabel =
    PASSENGER_OPTIONS.find((opt) => opt.value === searchData.passengers)
      ?.label || "1 Passenger";

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 select-none">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Origin */}
          <div className="flex flex-col">
            <SearchLocation
              placeholder="From"
              value={searchData.from}
              onChange={(value) => handleLocationChange("from", value)}
              onBlur={() => setShowMap(true)}
              hasError={Boolean(errors.from)}
            />
            {errors.from && (
              <span className="text-red-500 text-xs mt-1 ml-1 font-medium">
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
              hasError={Boolean(errors?.to)}
            />
            {errors.to && (
              <span className="text-red-500 text-xs mt-1 ml-1 font-medium">
                {errors.to}
              </span>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex flex-col">
            <div className="relative">
              <CalendarDays
                className={`absolute left-3 top-3.5 z-10 pointer-events-none ${
                  errors.date ? "text-red-500" : "text-slate-400"
                }`}
                size={20}
              />
              <input
                type="date"
                name="date"
                min={today}
                value={searchData.date}
                onChange={handleChange}
                className={`relative w-full pl-10 pr-4 py-3 border rounded-xl  transition text-sm text-slate-800  bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                  errors.date
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-green-600"
                }`}
              />
            </div>
            {errors.date && (
              <span className="text-red-500 text-xs mt-1 ml-1 font-medium">
                {errors.date}
              </span>
            )}
          </div>

          {/* Custom Styled Passengers Dropdown */}
          <div className="flex flex-col relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsPassengerDropdownOpen((prev) => !prev)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-green-600 text-left flex items-center justify-between text-sm transition outline-none ${
                isPassengerDropdownOpen
                  ? "border-green-600 ring-2 ring-green-600/20 bg-green-50/20"
                  : "border-slate-300 hover:border-slate-400 bg-white"
              }`}
            >
              <Users
                className="absolute left-3 top-3.5 text-slate-400"
                size={20}
              />
              <span className="font-medium text-slate-800">
                {selectedPassengerLabel}
              </span>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform duration-200 ${
                  isPassengerDropdownOpen ? "rotate-180 text-green-700" : ""
                }`}
              />
            </button>

            {/* Custom Options Menu */}
            {isPassengerDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {PASSENGER_OPTIONS.map((option) => {
                  const isSelected = searchData.passengers === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handlePassengerSelect(option.value)}
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
          </div>

          {/* Submit Button */}
          <div className="flex flex-col justify-start">
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 px-6 py-3 transition duration-200 shadow-sm max-h-[48px]"
            >
              <Search size={20} />
              Search
            </button>
            {errors.polyline && (
              <span className="text-red-500 text-xs mt-2 ml-1 font-medium">
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
