import { useEffect, useState } from "react";
import { MapPin, CalendarClock, Users, IndianRupee, AlertCircle } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { getBookings } from "../../api/adminService";

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "REJECTED",
  "COMPLETED",
  "NO_SHOW",
];

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  REJECTED: "bg-red-50 text-red-600",
  COMPLETED: "bg-blue-50 text-blue-700",
  NO_SHOW: "bg-slate-100 text-slate-500",
};

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

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchBookings = async (status) => {
    setLoading(true);
    setError("");
    try {
      const data = await getBookings(
        status && status !== "ALL" ? status : undefined,
      );
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load bookings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings("ALL");
  }, []);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchBookings(status);
  };

  return (
    <AdminLayout
      title="Booking Monitoring"
      subtitle="View all bookings made across the platform"
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              statusFilter === status
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status === "ALL" ? "All" : status}
          </button>
        ))}
      </div>

      {loading && (
        <p className="py-10 text-center text-slate-500">
          Loading bookings...
        </p>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No bookings found for this filter.
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                      {booking.departureLocationName} →{" "}
                      {booking.arrivalLocationName}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Passenger: {booking.passengerName} · Driver:{" "}
                    {booking.driverName} · Ref: {booking.bookingReference}
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

              {booking.cancellationReason && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  Cancellation reason: {booking.cancellationReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;
