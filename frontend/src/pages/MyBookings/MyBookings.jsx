import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  MapPin,
  Users,
  IndianRupee,
  AlertCircle,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { getMyBookings, cancelBooking } from "../../api/bookingService";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Same status set the backend's Booking.BookingStatus enum uses.
const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  REJECTED: "bg-red-50 text-red-600",
  COMPLETED: "bg-blue-50 text-blue-700",
  NO_SHOW: "bg-slate-100 text-slate-500",
};

// A passenger can only cancel a booking that hasn't already reached a final state.
const isCancellable = (status) =>
  status === "PENDING" || status === "CONFIRMED";

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] = useState(null); // confirm-prompt state
  const [rowError, setRowError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load your bookings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    setRowError("");
    setActionLoading(true);
    try {
      const updated = await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updated : b)),
      );
      setCancellingId(null);
    } catch (err) {
      setRowError(
        err?.response?.data?.message || "Failed to cancel this booking.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-20">
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-10 md:px-10">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold text-white">My Bookings</h1>
            <p className="mt-1 text-sm text-emerald-50">
              Track the rides you've requested to join
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 md:px-10">
          {loading && (
            <p className="text-center text-slate-500 py-10">
              Loading your bookings...
            </p>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-slate-600 mb-4">
                You haven't booked any rides yet.
              </p>
              <button
                onClick={() => navigate("/")}
                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Find a Ride
              </button>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isConfirmingCancel = cancellingId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">
                            {booking.departureLocationName.substring(
                              0,
                              booking.departureLocationName.indexOf(","),
                            )}{" "}
                            →{" "}
                            {booking.arrivalLocationName.substring(
                              0,
                              booking.arrivalLocationName.indexOf(","),
                            )}
                          </span>
                          <span className="text-slate-500"></span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Driver: {booking.driverName} · Ref:{" "}
                          {booking.bookingReference} . Ph.:{" "}
                          <b>{booking.driverPhoneNumber || "NA"}</b>
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_STYLES[booking.status] ||
                          "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4" />
                        Departs {formatDateTime(booking.departureTime)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {booking.seatsBooked} seat
                        {booking.seatsBooked === 1 ? "" : "s"} booked
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                        <IndianRupee className="h-4 w-4" />
                        {booking.totalPrice}
                      </span>
                    </div>

                    {isCancellable(booking.status) && !isConfirmingCancel && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => {
                            setCancellingId(booking.id);
                            setRowError("");
                          }}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Cancel Booking
                        </button>
                      </div>
                    )}

                    {isConfirmingCancel && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-600">
                          Cancel this booking? This can't be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCancellingId(null)}
                            disabled={actionLoading}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                          >
                            Keep booking
                          </button>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={actionLoading}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading ? "Cancelling..." : "Yes, cancel it"}
                          </button>
                        </div>
                        {rowError && (
                          <p className="w-full text-sm font-medium text-red-600">
                            {rowError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default MyBookings;
