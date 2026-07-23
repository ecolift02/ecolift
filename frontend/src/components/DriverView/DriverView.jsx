import React from 'react';

const DriverView = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 border-t-4 border-t-blue-600">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <span className="material-symbols-outlined">add_road</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Offer a Ride</h3>
          <p className="text-gray-500 text-sm">Share your empty seats and reduce emissions.</p>
        </div>
      </div>
      
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Source City</label>
          <input type="text" placeholder="Start location" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Destination City</label>
          <input type="text" placeholder="End location" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Departure Time</label>
          <input type="datetime-local" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-700" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Arrival Time</label>
          <input type="datetime-local" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-700" />
        </div>

        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <label className="text-sm font-semibold text-gray-700 block">Available Seats</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-3.5 text-gray-400">group</span>
            <input type="number" min="1" max="7" defaultValue="3" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">publish</span>
            Publish Route
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverView;