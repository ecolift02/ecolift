// src/pages/Profile/UserProfile.jsx
import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../context/AuthContext"; // 1. Import Auth Context

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("passenger");
  
  // 2. Grab the real logged-in user data
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-background pt-20">
        <Sidebar active="profile" />

        <main className="flex-1 md:ml-72 p-8">
          <section className="mb-10">
            {/* Cover Image */}
            <div className="relative w-full h-48 rounded-[32px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>

            {/* Profile Header */}
            <div className="relative flex flex-col md:flex-row items-end gap-6 -mt-16 px-6">
              {/* Profile Image */}
              <div className="w-32 h-32 rounded-[24px] border-4 border-white overflow-hidden shadow-lg bg-white">
                {/* Fallback avatar if no profile picture exists */}
                <img
                  src="https://ui-avatars.com/api/?name=Eco+Lift&background=0D8ABC&color=fff&size=128"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 pb-2">
                {/* 3. DYNAMICALLY SHOW THE USER'S EMAIL OR NAME */}
                <h1 className="text-4xl font-bold text-on-surface">
                  {user?.firstName || user?.name || user?.email || "EcoLift User"}
                </h1>

                {/* Show their dynamic role */}
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide mt-1">
                  Registered Role: {user?.roles?.join(', ') || "PASSENGER"}
                </p>

                <p className="text-on-surface-variant mt-2 max-w-3xl">
                  Commuter committed to reducing my carbon footprint one shared
                  ride at a time.
                </p>
              </div>

              {/* Edit Button */}
              <div className="pb-2">
                <button className="bg-green-700 text-white px-6 py-3 rounded-full hover:bg-green-800 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">edit</span>
                  Edit Profile
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default UserProfile;