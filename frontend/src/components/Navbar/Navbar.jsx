import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false); // Controls the sub-dropdown
  const [userMode, setUserMode] = useState("passenger"); // Tracks active mode

  const dropdownRef = useRef(null);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsModeMenuOpen(false); // Close sub-menu as well
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    setIsModeMenuOpen(false);
    logout();
    navigate("/");
  };

  const handleModeChange = (mode) => {
    setUserMode(mode);
    setIsModeMenuOpen(false); // Auto-close sub-dropdown on selection
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm h-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-8 h-full flex justify-between items-center">
        {/* Logo and Desktop Menu */}
        <div className="flex items-center gap-12">
          <Link
            to="/"
            className="text-3xl font-bold text-green-700 tracking-wide"
          >
            EcoLift
          </Link>

          <div className="hidden md:flex gap-8">
            <a
              href="#how-it-works"
              className="text-green-700 font-semibold border-b-2 border-green-700 pb-1"
            >
              How it Works
            </a>
            <a
              href="#support"
              className="text-gray-600 hover:text-green-700 transition"
            >
              Support
            </a>
            <a
              href="#blog"
              className="text-gray-600 hover:text-green-700 transition"
            >
              Blog
            </a>
          </div>
        </div>

        {/* Right Buttons / Conditional Rendering */}
        <div className="flex items-center gap-4">
          {/* Changed from !token to !isAuthenticated */}
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="px-6 py-2 rounded-full text-green-700 hover:bg-green-50 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition shadow"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              {/* Eco Stats Pill */}
              <div className="hidden sm:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                <span
                  className="material-symbols-outlined text-green-700"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  eco
                </span>
                <span className="text-sm font-medium text-green-700">
                  1,240 kg saved
                </span>
              </div>

              {/* Profile Avatar Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full border-2 border-green-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
              >
                <img
                  className="w-full h-full object-cover"
                  alt="User Profile Avatar"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTXEqeXb5oMyQbf1hR_m59FLXF81K1UzNc300uKHMGjM_4kHPRyedHC2m4sirqtGwkISVtDsxdYa6FnhQJ_3RY5OskpVuPlEKu6NRYsEGQjQUCILUNSbCIpi8XbIW2PqJ-_yc6nwknNGb0bDskAn4_z6sCdeCsOaRjL0zYCKJ-lgjobRKMy7Rx_xVuOq60y31HjSDwRGQR9YgsJamE6F31g2kO8CY1Zidr6cdK7inh_bkIDXD8W78fcW2GT2edMpT6Q4yGHfD4ubw"
                />
              </button>

              {/* Dropdown Menu */}
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

                  {/* Mode Switcher (Sub-dropdown trigger) */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents clicks from immediately closing everything
                        setIsModeMenuOpen(!isModeMenuOpen);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-green-50 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">
                          swap_horiz
                        </span>
                        <span>
                          Mode:{" "}
                          <span className="font-semibold capitalize text-green-700">
                            {userMode}
                          </span>
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[18px]">
                        {isModeMenuOpen ? "expand_less" : "expand_more"}
                      </span>
                    </button>

                    {/* Sub-dropdown Menu */}
                    {isModeMenuOpen && (
                      <div className="bg-gray-50 flex flex-col py-1 border-y border-gray-100">
                        <button
                          onClick={() => handleModeChange("passenger")}
                          className={`px-10 py-2 text-sm text-left transition flex items-center gap-2 ${
                            userMode === "passenger"
                              ? "text-green-700 font-semibold"
                              : "text-gray-500 hover:text-green-700"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            hail
                          </span>
                          Passenger
                        </button>

                        <button
                          onClick={() => handleModeChange("driver")}
                          className={`px-10 py-2 text-sm text-left transition flex items-center gap-2 ${
                            userMode === "driver"
                              ? "text-green-700 font-semibold"
                              : "text-gray-500 hover:text-green-700"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            directions_car
                          </span>
                          Driver
                        </button>
                      </div>
                    )}
                  </div>

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
