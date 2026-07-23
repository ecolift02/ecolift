import React from 'react';

const PassengerView = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
          <span className="material-symbols-outlined">search</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Find a Lift</h3>
          <p className="text-gray-500 text-sm">Enter your route to find available drivers.</p>
        </div>
      </div>
      
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Leaving from</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-3.5 text-gray-400">trip_origin</span>
            <input type="text" placeholder="e.g., Pune" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Going to</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-3.5 text-gray-400">location_on</span>
            <input type="text" placeholder="e.g., Mumbai" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Departure Time</label>
          <input type="datetime-local" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-700" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Desired Arrival</label>
          <input type="datetime-local" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-700" />
        </div>

        <div className="md:col-span-2 pt-4">
          <button type="button" className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition-all shadow-md shadow-green-700/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">search</span>
            Search Rides
          </button>
        </div>
      </form>
    </div>
  );
};

export default PassengerView;