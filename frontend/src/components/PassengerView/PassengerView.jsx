import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CalendarDays, Users, Search } from "lucide-react";

const PassengerView = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
  });

  const handleChange = (e) => {
    setSearchData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const { from, to, date, passengers } = searchData;

    if (!from || !to || !date) {
      return;
    }

    navigate(
      `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&seats=${encodeURIComponent(passengers)}`,
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-500" size={20} />

            <input
              type="text"
              name="from"
              value={searchData.from}
              onChange={handleChange}
              placeholder="From"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-500" size={20} />

            <input
              type="text"
              name="to"
              value={searchData.to}
              onChange={handleChange}
              placeholder="To"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

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
    </div>
  );
};

export default PassengerView;
