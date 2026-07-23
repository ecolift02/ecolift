import React, { useState } from "react";

// Shared Components
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("passenger");

  return (
    <>
      {/* Shared Navbar */}
      <Navbar />

      <div className="flex min-h-screen bg-background pt-20">
        {/* Shared Sidebar */}
        <Sidebar active="profile" />

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

              <div className="flex-1 pb-2">
                <h1 className="text-4xl font-bold text-on-surface">
                  Alex Johnson
                </h1>

                <p className="text-on-surface-variant mt-2 max-w-3xl">
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
