import { useEffect, useState } from "react";
import {
  CalendarClock,
  MapPin,
  Users,
  IndianRupee,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import {
  getDriverBookings,
  getDriverPendingBookings,
  approveBooking,
  rejectBooking,
} from "../../api/bookingService";

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

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  REJECTED: "bg-red-50 text-red-600",
  COMPLETED: "bg-blue-50 text-blue-700",
  NO_SHOW: "bg-slate-100 text-slate-500",
};

const BookingCard = ({ booking, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-slate-800">
            {booking.departureLocationName} → {booking.arrivalLocationName}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Passenger: {booking.passengerName} · Ref: {booking.bookingReference} ·
          <b>Ph.: {booking.passengerPhoneNumber || "NA"}</b>
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          STATUS_STYLES[booking.status] || "bg-slate-100 text-slate-500"
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
        {booking.seatsBooked} seat{booking.seatsBooked === 1 ? "" : "s"}{" "}
        requested
      </span>
      <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
        <IndianRupee className="h-4 w-4" />
        {booking.totalPrice}
      </span>
    </div>

    {children}
  </div>
);

const DriverBookings = () => {
  const [tab, setTab] = useState("pending"); // "pending" | "confirmed"

  const [pending, setPending] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actioningId, setActioningId] = useState(null);
  const [rowError, setRowError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [pendingData, allData] = await Promise.all([
        getDriverPendingBookings(),
        getDriverBookings(),
      ]);
      setPending(Array.isArray(pendingData) ? pendingData : []);
      setConfirmed(
        (Array.isArray(allData) ? allData : []).filter(
          (b) => b.status === "CONFIRMED",
        ),
      );
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
    fetchAll();
  }, []);

  const handleApprove = async (bookingId) => {
    setRowError("");
    setActioningId(bookingId);
    try {
      await approveBooking(bookingId);
      await fetchAll(); // seat counts + both tabs change together, simplest to refetch
    } catch (err) {
      setRowError(
        err?.response?.data?.message || "Failed to approve this booking.",
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (bookingId) => {
    setRowError("");
    setActioningId(bookingId);
    try {
      await rejectBooking(bookingId);
      await fetchAll();
    } catch (err) {
      setRowError(
        err?.response?.data?.message || "Failed to reject this booking.",
      );
    } finally {
      setActioningId(null);
    }
  };

  const activeList = tab === "pending" ? pending : confirmed;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-20">
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-10 md:px-10">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold text-white">Booking Requests</h1>
            <p className="mt-1 text-sm text-emerald-50">
              Review passengers requesting to join your rides
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 md:px-10">
          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setTab("pending")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "pending"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Pending Requests ({pending.length})
            </button>
            <button
              onClick={() => setTab("confirmed")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "confirmed"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Confirmed Passengers ({confirmed.length})
            </button>
          </div>

          {loading && (
            <p className="text-center text-slate-500 py-10">
              Loading bookings...
            </p>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && rowError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {rowError}
            </div>
          )}

          {!loading && !error && activeList.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              {tab === "pending"
                ? "No pending requests right now."
                : "No confirmed passengers yet."}
            </div>
          )}

          {!loading && !error && activeList.length > 0 && (
            <div className="space-y-4">
              {activeList.map((booking) => (
                <BookingCard key={booking.id} booking={booking}>
                  {tab === "pending" && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleReject(booking.id)}
                        disabled={actioningId === booking.id}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(booking.id)}
                        disabled={actioningId === booking.id}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        {actioningId === booking.id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    </div>
                  )}
                </BookingCard>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default DriverBookings;
