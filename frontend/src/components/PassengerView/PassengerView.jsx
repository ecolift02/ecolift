import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Search } from "lucide-react";
import SearchLocation from "./SearchLocation";
import ViewMap from "../Map/ViewMap";

const PassengerView = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: null, // Initialized as null instead of "" so objects map cleanly
    to: null,
    date: "",
    passengers: "1",
  });
  const [showMap, setShowMap] = useState(false);
  const handleChange = (e) => {
    setSearchData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLocationChange = (name, value) => {
    // This 'value' will now be the full object from SearchLocation!
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const { from, to, date, passengers } = searchData;

    // Safely extract the string names whether they typed a string or selected an object
    const fromString =
      typeof from === "object" && from !== null ? from.display_name : from;
    const toString =
      typeof to === "object" && to !== null ? to.display_name : to;

    if (!fromString || !toString || !date) {
      return;
    }

    // Navigate using the string names
    navigate(
      `/search?from=${encodeURIComponent(fromString)}&to=${encodeURIComponent(toString)}&date=${encodeURIComponent(date)}&seats=${encodeURIComponent(passengers)}`,
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SearchLocation
            placeholder="From"
            value={searchData.from}
            onChange={(value) => handleLocationChange("from", value)}
            onBlur={() => setShowMap(true)} // Show map when user leaves the "From" input
          />

          <SearchLocation
            placeholder="To"
            value={searchData.to}
            onChange={(value) => handleLocationChange("to", value)}
          />

          <div className="relative">
            <CalendarDays
              className="absolute left-3 top-3 text-gray-500"
              size={20}
            />
            <input
              type="date"
              name="date"
              value={searchData.date}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-3 text-gray-500" size={20} />
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

          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center justify-center gap-2 px-6 py-3 transition duration-300"
          >
            <Search size={20} />
            Search
          </button>
        </div>
      </form>

      {/* 
        SMOOTH SLIDE DOWN WRAPPER 
        Transitions max-height from 0 to 500px, creating a smooth vertical slide.
      */}
      <div
        className={`transition-all duration-900 ease-in-out overflow-hidden ${
          showMap ? "max-h-[500px] mt-6 opacity-100" : "max-h-0 mt-0 opacity-0"
        }`}
      >
        <div className="h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-100">
          {/* We still conditionally render ViewMap inside so it doesn't run API calls when hidden */}
          {showMap && <ViewMap from={searchData.from} to={searchData.to} />}
        </div>
      </div>
    </div>
  );
};

export default PassengerView;
