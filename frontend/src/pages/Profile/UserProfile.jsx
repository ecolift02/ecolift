import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// Shared Components
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";

const UserProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("passenger");
  const { user } = useAuth();

  // Use actual user name from auth context, fallback to default
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@example.com";
  const displayPhone = user?.phone || "Not provided";

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@example.com";
  return (
    <>
      {/* Shared Navbar */}
      <Navbar />

      <div className="flex min-h-screen bg-background pt-20">
        {/* Shared Sidebar */}
        <Sidebar active="profile" />
        <div className="fixed top-23 left-8 z-50">
          <Link
            to="/"
            className="px-5 py-2.5 bg-white border border-green-700 text-green-700 rounded-full hover:bg-green-50 transition font-medium text-sm shadow-md flex items-center gap-2"
          >
            ← Go to Home
          </Link>
        </div>
        {/* Main Content */}
        <main className="flex-1 md:ml-72 p-8">
          {/* ================= HERO SECTION ================= */}

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

              <div className="w-32 h-32 rounded-[24px] border-4 border-white overflow-hidden shadow-lg">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApEsB5DX28aLUq-XMiqk7ivvgciIvWICwIhCqaxcd6z0xPSKHGaDterKJyVRsQAnWEjFK_Xj3QoH5ZvhE2MMHu2N4CpAcySwZSGYezrbEPIGXzFuHTTGy_1PEBKByYYMnZaCFhlz3fEGp9BsNv4EqWHPmTLaf-6IsRoFvGitGSezTajNVnZuJAt2ghPQp6cl3l2L_u0ivyIEwhfOKgFn-JZaPMM8hYAOxHCd2FrmpHA_Apdp0NI5EBuvvd0EDE6RIvUwJaaBSKxwg"
                  alt="Alex Johnson"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* User Info */}

              {/* User Info */}
                <div className="flex-1 pb-2">
                  
                  {/* 1. Changed to text-white and added a drop-shadow for the Name */}
                  <h1 className="text-4xl font-bold text-white drop-shadow-md tracking-wide">
                    {displayName} 
                  </h1>
                  
                  {/* 2. Made the Email light gray/white with a drop-shadow */}
                  <p className="text-gray-100 drop-shadow-md mt-1 max-w-3xl text-lg">
                    Email : <strong className="text-white">{displayEmail}</strong>
                  </p>
                  
                  {/* 3. Kept the bio text dark because it drops down onto the white background */}
                  <p className="text-gray-700 mt-4 max-w-3xl leading-relaxed">
                    Commuter committed to reducing my carbon footprint one shared
                    ride at a time. Professional software architect and weekend
                    nature photographer.
                  </p>
                  
                </div>

              {/* Edit Button */}

              <div className="pb-2">
                <button className="bg-primary text-on-primary px-6 py-3 rounded-full hover:shadow-md transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">edit</span>
                  Edit Profile
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Shared Footer */}

      <Footer />
    </>
  );
};

export default UserProfile;
