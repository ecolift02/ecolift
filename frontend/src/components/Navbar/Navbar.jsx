import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { getProfile } from "../../api/userApi";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, currentMode, updateCurrentMode, user } =
    useAuth();
  const {
    totalUnread,
    incomingCall,
    clearIncomingCall,
    acceptIncomingCall,
    socket,
  } = useChat();
  const location = useLocation();
  const currentUserId = String(
    user?._id ?? user?.id ?? user?.userId ?? user?.user?._id ?? "",
  );

  // States
  const [profile, setProfile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false); // Controls the sub-dropdown
  const [userMode, setUserMode] = useState(
    currentMode?.toLowerCase() || "passenger",
  ); // Tracks active mode

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

  const handleModeChange = async (mode) => {
    const normalizedMode = mode.toUpperCase();
    setUserMode(mode);
    try {
      await updateCurrentMode(normalizedMode);
    } catch (error) {
      setUserMode(currentMode?.toLowerCase() || "passenger");
    }
    setIsModeMenuOpen(false); // Auto-close sub-dropdown on selection
  };

  useEffect(() => {
    setUserMode((currentMode || "PASSENGER").toLowerCase());
  }, [currentMode]);

  //Profile
  const profileFetch = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      profileFetch();
    }
  }, [isAuthenticated]);

  const getInitial = () => {
    const name = profile?.name || user?.name || "U";
    return name.charAt(0).toUpperCase();
  };
  return (
    <>
      {incomingCall && (
        <div className="fixed top-24 right-4 z-50 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex flex-col gap-3">
            <div className="text-sm font-semibold text-slate-900">
              Incoming call from {incomingCall.caller?.name || "Someone"}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  acceptIncomingCall(incomingCall.bookingId);
                  navigate(`/inbox/${incomingCall.bookingId}`);
                }}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    if (socket && socket.connected) {
                      const body = JSON.stringify({
                        bookingId: incomingCall.bookingId,
                        userId: currentUserId,
                      });
                      if (typeof socket.publish === "function") {
                        socket.publish({
                          destination: `/app/chat.call.end/${incomingCall.bookingId}`,
                          body,
                        });
                      } else if (typeof socket.send === "function") {
                        socket.send(
                          `/app/chat.call.end/${incomingCall.bookingId}`,
                          {},
                          body,
                        );
                      } else {
                        console.warn("socket not ready to send call end");
                      }
                    }
                  } catch (err) {
                    console.warn(
                      "failed sending call end on incoming decline",
                      err,
                    );
                  }
                  clearIncomingCall();
                }}
                className="rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm h-20 transition-all duration-300">
        {/* RESPONSIVE UPDATE: Changed px-8 to px-4 md:px-8 to give more room on phones */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex justify-between items-center">
          {/* Logo and Desktop Menu */}
          {/* RESPONSIVE UPDATE: Shrink gap between logo and links on smaller screens */}
          <div className="flex items-center gap-4 md:gap-12">
            <Link
              to="/"
              /* RESPONSIVE UPDATE: Smaller logo text on mobile */
              className="text-2xl md:text-3xl font-bold text-green-700 tracking-wide"
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
            </div>
          </div>

          {/* Right Buttons / Conditional Rendering */}
          {/* RESPONSIVE UPDATE: gap-2 on mobile, gap-4 on desktop */}
          <div className="flex items-center gap-2 md:gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  /* RESPONSIVE UPDATE: Less padding and smaller text on mobile */
                  className="px-4 py-1.5 md:px-6 md:py-2 text-sm md:text-base font-medium rounded-full text-green-700 hover:bg-green-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  /* RESPONSIVE UPDATE: Less padding and smaller text on mobile */
                  className="px-4 py-1.5 md:px-6 md:py-2 text-sm md:text-base font-medium rounded-full bg-green-700 text-white hover:bg-green-800 transition shadow"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div
                className="flex items-center gap-4 relative"
                ref={dropdownRef}
              >
                {/* Eco Stats Pill */}

                <Link
                  to="/inbox"
                  className="relative rounded-full border border-green-200 p-2 text-green-700 hover:bg-green-50"
                >
                  <span className="material-symbols-outlined">mail</span>
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold text-white">
                      {totalUnread}
                    </span>
                  )}
                </Link>

                <div className="hidden md:flex items-center gap-2">
                  {user?.roles?.includes("ADMIN") && (
                    <Link
                      to="/admin/dashboard"
                      className="rounded-full border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                    >
                      Admin Panel
                    </Link>
                  )}
                  {currentMode === "DRIVER" ? (
                    <>
                      <Link
                        to="/driver/rides"
                        className="rounded-full border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                      >
                        My Rides
                      </Link>
                      <Link
                        to="/driver/bookings"
                        className="rounded-full border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                      >
                        Booking Requests
                      </Link>
                      <Link
                        to="/driver/vehicles"
                        className="rounded-full border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                      >
                        My Vehicles
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/bookings/my"
                        className="rounded-full border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                      >
                        My Bookings
                      </Link>
                      {!user?.roles?.includes("DRIVER") && (
                        <Link
                          to="/register-vehicle"
                          className="rounded-full bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
                        >
                          Become a Driver
                        </Link>
                      )}
                    </>
                  )}
                </div>

                {/* Profile Avatar Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full border-2 border-green-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
                >
                  {profile?.profilePictureUrl || user?.profilePictureUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      alt="User Profile Avatar"
                      src={
                        profile?.profilePictureUrl || user?.profilePictureUrl
                      }
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-green-50 font-bold text-green-800">
                      {getInitial()}
                    </span>
                  )}
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
                      Profile : <b>{profile?.name || user?.name || "User"}</b>
                    </Link>

                    {user?.roles?.includes("ADMIN") && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          admin_panel_settings
                        </span>
                        Admin Panel
                      </Link>
                    )}

                    {currentMode === "DRIVER" && (
                      <Link
                        to="/driver/rides"
                        onClick={() => setIsDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          directions_car
                        </span>
                        My Rides
                      </Link>
                    )}

                    {currentMode === "DRIVER" ? (
                      <Link
                        to="/driver/bookings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          fact_check
                        </span>
                        Booking Requests
                      </Link>
                    ) : (
                      <Link
                        to="/bookings/my"
                        onClick={() => setIsDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          confirmation_number
                        </span>
                        My Bookings
                      </Link>
                    )}

                    {currentMode === "DRIVER" && (
                      <Link
                        to="/driver/vehicles"
                        onClick={() => setIsDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          garage
                        </span>
                        My Vehicles
                      </Link>
                    )}

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
    </>
  );
};

export default Navbar;
