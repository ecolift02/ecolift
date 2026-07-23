// src/pages/Profile/UserProfile.jsx
import React, { useState } from "react";

// Shared Components
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";

// Dynamic Views
import PassengerView from "../../components/PassengerView/PassengerView";
import DriverView from "../../components/DriverView/DriverView";

// Global State
import { useAuth } from "../../context/AuthContext";

const UserProfile = () => {
  const { user } = useAuth();
  const defaultMode = user?.roles?.includes("DRIVER") ? "DRIVER" : "PASSENGER";
  const [dashboardMode, setDashboardMode] = useState(defaultMode);

  const getDisplayName = (user) => {
    // ... keep helper function the same ...
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name;
    if (user?.email) {
      const username = user.email.split("@")[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return "EcoLift User";
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 pt-20">
        
        {/* Pass the mode to the sidebar! */}
        <Sidebar active="profile" mode={dashboardMode} />

        <main className="flex-1 md:ml-64 p-8">
          <section className="mb-8 bg-white rounded-3xl shadow-sm pb-8">
            <div className="relative w-full h-48 rounded-t-3xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-end md:items-center gap-6 -mt-16 px-8">
              <div className="w-32 h-32 rounded-2xl border-4 border-white overflow-hidden shadow-lg bg-white z-10 flex-shrink-0">
                <img src={`https://ui-avatars.com/api/?name=${getDisplayName(user)}&background=15803d&color=fff&size=128`} alt="Profile Avatar" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 pt-16 md:pt-16 pb-2">
                <h1 className="text-3xl font-bold text-gray-900">{getDisplayName(user)}</h1>
                {/* REMOVED THE REGISTERED ROLE TEXT HERE */}
                <p className="text-gray-500 mt-1">{user?.email}</p>
              </div>

              <div className="pb-2 flex flex-col items-end gap-4 w-full md:w-auto mt-4 md:mt-16">
                <button className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-medium shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
                </button>

                <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200">
                  <button 
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${dashboardMode === 'PASSENGER' ? 'bg-green-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                    onClick={() => setDashboardMode('PASSENGER')}
                  >
                    Passenger Mode
                  </button>
                  <button 
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${dashboardMode === 'DRIVER' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                    onClick={() => setDashboardMode('DRIVER')}
                  >
                    Driver Mode
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="animate-fade-in">
            {dashboardMode === 'PASSENGER' ? <PassengerView /> : <DriverView />}
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;