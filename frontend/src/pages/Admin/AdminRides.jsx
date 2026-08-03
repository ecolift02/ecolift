import { useEffect, useState } from "react";
import {
  MapPin,
  CalendarClock,
  Users,
  IndianRupee,
  Car,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { getRides } from "../../api/adminService";

const STATUS_FILTERS = ["ALL", "ACTIVE", "COMPLETED", "CANCELLED"];

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-600",
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

const AdminRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchRides = async (status) => {
    setLoading(true);
    setError("");
    try {
      const data = await getRides(status && status !== "ALL" ? status : undefined);
      setRides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load rides. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides("ALL");
  }, []);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchRides(status);
  };

  return (
    <AdminLayout
      title="Ride Monitoring"
      subtitle="View all rides published on the platform"
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
        <p className="py-10 text-center text-slate-500">Loading rides...</p>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && rides.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No rides found for this filter.
        </div>
      )}

      {!loading && !error && rides.length > 0 && (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride.rideId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                      {ride.departureLocationName} → {ride.arrivalLocationName}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Driver: {ride.driverName} · Vehicle: {ride.vehicleModel} (
                    {ride.vehicleLicensePlate})
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_STYLES[ride.rideStatus] ||
                    "bg-slate-100 text-slate-500"
                  }`}
                >
                  {ride.rideStatus}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4" />
                  Departs {formatDateTime(ride.departureTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {ride.availableSeats} seats available
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <IndianRupee className="h-4 w-4" />
                  {ride.pricePerSeat}/seat
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRides;
