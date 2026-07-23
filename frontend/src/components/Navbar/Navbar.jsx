import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Pulling your global auth state

const Navbar = () => {
  // Using context instead of manual localStorage checks
  const { isAuthenticated, logout, user } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout(); // Let AuthContext handle the cleanup and redirect
  };

  // Helper to generate a clean avatar based on email/name
  const getDisplayName = (userData) => {
    if (userData?.firstName) return userData.firstName;
    if (userData?.name) return userData.name;
    if (userData?.email) {
      const username = userData.email.split("@")[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return "User";
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm h-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-8 h-full flex justify-between items-center">
        {/* Logo and Desktop Menu */}
        <div className="flex items-center gap-12">
          <Link to="/" className="text-3xl font-bold text-green-700 tracking-wide">
            EcoLift
          </Link>

          <div className="hidden md:flex gap-8">
            <Link to="/" className="text-green-700 font-semibold border-b-2 border-green-700 pb-1">
              How it Works
            </Link>
            <Link to="/" className="text-gray-600 hover:text-green-700 transition">
              Support
            </Link>
            <Link to="/" className="text-gray-600 hover:text-green-700 transition">
              Blog
            </Link>
          </div>
        </div>

        {/* Right Buttons / Conditional Rendering */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="px-6 py-2 rounded-full text-green-700 hover:bg-green-50 transition">
                Login
              </Link>
              <Link to="/register" className="px-6 py-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition shadow">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              {/* Eco Stats Pill */}
              <div className="hidden sm:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-green-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                  eco
                </span>
                <span className="text-sm font-medium text-green-700">
                  1,240 kg saved
                </span>
              </div>

              {/* Dynamic Profile Avatar Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full border-2 border-green-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
              >
                <img
                  className="w-full h-full object-cover"
                  alt="User Avatar"
                  src={`https://ui-avatars.com/api/?name=${getDisplayName(user)}&background=15803d&color=fff`}
                />
              </button>

              {/* Dropdown Menu (Cleaned up, no extra mode switches or roles) */}
              {isDropdownOpen && (
                <div className="absolute top-14 right-0 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 flex flex-col overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-800">
                      My Account
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      person
                    </span>
                    Profile
                  </Link>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;