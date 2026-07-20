import { useState } from "react";
import { Search, MapPin, CalendarDays, Users } from "lucide-react";

const Hero = () => {
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
  });

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = () => {
    console.log(searchData);

    // Later:
    // navigate(`/search?from=${searchData.from}&to=${searchData.to}`)
  };

  return (
    <section
      className="relative h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url(./src/assets/vid.gif)",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white text-center mb-12">
          Travel Sustainably.
          <br />
          Together.
        </h1>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* From */}
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-gray-500"
                size={20}
              />

              <input
                type="text"
                name="from"
                value={searchData.from}
                onChange={handleChange}
                placeholder="From"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            {/* To */}
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-gray-500"
                size={20}
              />

              <input
                type="text"
                name="to"
                value={searchData.to}
                onChange={handleChange}
                placeholder="To"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>

            {/* Date */}
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

            {/* Passengers */}
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

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center justify-center gap-2 px-6 py-3 transition duration-300"
            >
              <Search size={20} />
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
