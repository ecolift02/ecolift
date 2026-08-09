import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { createBooking } from "../../api/bookingService";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ride = location.state?.ride;

  const maxSeats = Math.max(1, Number(ride?.availableSeats) || 1);
  const [seats, setSeats] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Custom Dropdown State & Ref
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!ride) {
    return (
      <>
        <Navbar />
        <main className="pt-20 bg-linear-to-b from-emerald-50 via-white to-gray-50 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-sm border border-emerald-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              No ride selected
            </h1>
            <p className="text-gray-600 mb-4">
              Please choose a ride from the search results first.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
            >
              Back to Home
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const totalPrice = (Number(ride.pricePerSeat) || 0) * seats;

  const handleConfirm = async () => {
    setError("");
    setSubmitting(true);
    try {
      await createBooking(ride.rideId, seats);
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong while booking this ride. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <main className="pt-20 bg-linear-to-b from-emerald-50 via-white to-gray-50 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-emerald-100">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Request sent!
            </h1>
            <p className="text-gray-600 mb-6">
              Your booking request has been sent to the driver. You'll see it
              move to "Confirmed" once they approve it.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate("/bookings/my")}
                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                View My Bookings
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-linear-to-b from-emerald-50 via-white to-gray-50 min-h-screen px-4 py-10">
        <section className="px-4 py-10 md:py-14">
          <div className="mx-auto max-w-6xl rounded-[28px] bg-white p-8 shadow-[0_12px_40px_rgba(21,128,61,0.08)] border border-emerald-100">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
              Confirm your ride
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Booking Summary
            </h1>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm text-gray-500">Driver</p>
                <p className="text-lg font-semibold text-gray-900">
                  {ride.driverName}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="text-lg font-semibold text-gray-900">
                  {ride.vehicleModel}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm text-gray-500">From</p>
                <p className="text-lg font-semibold text-gray-900">
                  {ride.departureLocationName}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm text-gray-500">To</p>
                <p className="text-lg font-semibold text-gray-900">
                  {ride.arrivalLocationName}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 ">
                <p className="text-sm text-gray-500">Departure</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(ride.departureTime).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 ">
                <p className="text-sm text-gray-500">Distance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {ride.distanceKm} km
                </p>
              </div>
            </div>

            {/* Custom Styled Seat Selector */}
            <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-500 mb-2">Seats needed</p>
              <div className="flex items-center gap-3">
                <div className="relative inline-block w-36" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <span>
                      {seats} {seats === 1 ? "seat" : "seats"}
                    </span>
                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <ul className="absolute left-0 z-10 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-emerald-100 bg-white py-1 shadow-lg shadow-emerald-900/5 focus:outline-none">
                      {Array.from({ length: maxSeats }, (_, i) => i + 1).map(
                        (n) => (
                          <li
                            key={n}
                            onClick={() => {
                              setSeats(n);
                              setIsDropdownOpen(false);
                            }}
                            className={`cursor-pointer px-4 py-2 text-sm transition-colors duration-150 ${
                              seats === n
                                ? "bg-green-50 text-green-700 font-semibold"
                                : "text-gray-700 hover:bg-emerald-50 hover:text-green-700"
                            }`}
                          >
                            {n} {n === 1 ? "seat" : "seats"}
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                </div>

                <span className="text-sm text-gray-500">
                  {ride.availableSeats} seat
                  {ride.availableSeats === 1 ? "" : "s"} available on this ride
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-4">
              <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
                <div>
                  <p className="text-sm text-gray-600">Total price</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{totalPrice}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{ride.pricePerSeat} × {seats} seat{seats === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {submitting ? "Sending request..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Booking;
