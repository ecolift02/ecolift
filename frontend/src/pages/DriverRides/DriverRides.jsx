import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  Users,
  IndianRupee,
  Car,
  AlertCircle,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Check,
  CalendarClock,
  Route,
} from "lucide-react";
import api from "../../api/axiosConfig";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

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

// Converts an ISO datetime string into the "yyyy-MM-ddTHH:mm" format
// required by <input type="datetime-local">.
const toInputDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isUpcoming = (departureTime) =>
  departureTime && new Date(departureTime) > new Date();

const DriverRides = () => {
  const navigate = useNavigate();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    departureTime: "",
    estimateArrivalTime: "",
    availableSeats: 1,
    pricePerSeat: "",
  });
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState("");

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchRides = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/rides/my");
      const data = Array.isArray(response.data) ? response.data : [];
      setRides(data.filter((ride) => !ride.isDeleted));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load your published rides. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const startEditing = (ride) => {
    setDeletingId(null);
    setRowError("");
    setEditingId(ride.rideId);
    setEditForm({
      departureTime: toInputDateTime(ride.departureTime),
      estimateArrivalTime: toInputDateTime(ride.arrivalTime),
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setRowError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (rideId) => {
    setRowError("");

    if (!editForm.departureTime) {
      setRowError("Please provide a valid departure time.");
      return;
    }
    if (new Date(editForm.departureTime) <= new Date()) {
      setRowError("Departure time cannot be in the past.");
      return;
    }
    if (
      editForm.estimateArrivalTime &&
      new Date(editForm.estimateArrivalTime) <= new Date(editForm.departureTime)
    ) {
      setRowError("Arrival time must be after departure time.");
      return;
    }
    if (Number(editForm.pricePerSeat) <= 0) {
      setRowError("Price per seat must be greater than 0.");
      return;
    }
    if (Number(editForm.availableSeats) <= 0) {
      setRowError("Available seats must be at least 1.");
      return;
    }

    const payload = {
      departureTime: editForm.departureTime,
      estimateArrivalTime: editForm.estimateArrivalTime || null,
      availableSeats: Number(editForm.availableSeats),
      pricePerSeat: Number(editForm.pricePerSeat),
    };

    setSaving(true);
    try {
      await api.put(`/rides/${rideId}`, payload);
      setEditingId(null);
      await fetchRides();
    } catch (err) {
      setRowError(
        err?.response?.data?.message || "Failed to update the ride.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rideId) => {
    setDeleteError("");
    try {
      await api.delete(`/rides/${rideId}`);
      setDeletingId(null);
      setRides((prev) => prev.filter((r) => r.rideId !== rideId));
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message || "Failed to cancel the ride.",
      );
    }
  };

  const upcomingCount = rides.filter((r) => isUpcoming(r.departureTime)).length;
  const totalSeats = rides.reduce(
    (sum, r) => sum + (Number(r.availableSeats) || 0),
    0,
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-10 md:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  My Published Rides
                </h1>
                <p className="mt-1 text-sm text-emerald-50">
                  Manage the rides you've offered as a driver
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/driver/vehicles")}
                  className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
                >
                  <Car className="h-4 w-4" />
                  My Vehicles
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-md transition hover:bg-emerald-50 active:scale-[0.98]"
                >
                  <PlusCircle className="h-4 w-4" />
                  Publish New Ride
                </button>
              </div>
            </div>

            {/* Quick stats */}
            {!loading && rides.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">
                    Total Rides
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {rides.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">
                    Upcoming Rides
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {upcomingCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">
                    Seats Offered
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {totalSeats}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-8 md:px-10">
          <div className="mx-auto max-w-5xl">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-600">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-14 text-center text-slate-500 shadow-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                Loading your rides...
              </div>
            ) : rides.length === 0 && !error ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
                <Car className="h-12 w-12 text-slate-300" />
                <p className="text-lg font-medium text-slate-700">
                  You haven't published any rides yet
                </p>
                <p className="text-sm text-slate-500">
                  Offer a ride and start sharing your journey with others.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
                >
                  <PlusCircle className="h-4 w-4" />
                  Publish a Ride
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {rides.map((ride) => {
                  const isEditing = editingId === ride.rideId;
                  const isConfirmingDelete = deletingId === ride.rideId;
                  const upcoming = isUpcoming(ride.departureTime);

                  return (
                    <div
                      key={ride.rideId}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                    >
                      <div className="p-5 md:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 text-slate-800">
                              <div className="rounded-full bg-emerald-50 p-2">
                                <Route className="h-4 w-4 text-emerald-600" />
                              </div>
                              <span className="text-base font-semibold">
                                {ride.departureLocationName}
                              </span>
                              <span className="text-slate-300">→</span>
                              <span className="text-base font-semibold">
                                {ride.arrivalLocationName}
                              </span>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                upcoming
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {upcoming ? "Upcoming" : "Departed"}
                            </span>
                          </div>

                          {!isEditing && (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-lg font-bold text-emerald-700">
                                <IndianRupee className="h-4 w-4" />
                                {ride.pricePerSeat}
                                <span className="text-xs font-normal text-slate-400">
                                  /seat
                                </span>
                              </span>
                              <button
                                onClick={() => startEditing(ride)}
                                title="Edit ride"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingId(ride.rideId);
                                  setDeleteError("");
                                }}
                                title="Cancel ride"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <CalendarClock className="h-4 w-4" />
                              Departs {formatDateTime(ride.departureTime)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              Arrives {formatDateTime(ride.arrivalTime)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              {ride.availableSeats} seats available
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Car className="h-4 w-4" />
                              {ride.vehicleModel} · {ride.vehicleLicensePlate}
                            </span>
                          </div>
                        )}

                        {/* Delete confirmation */}
                        {isConfirmingDelete && (
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-600">
                              Cancel this ride? This can't be undone.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeletingId(null)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                              >
                                Keep ride
                              </button>
                              <button
                                onClick={() => handleDelete(ride.rideId)}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700"
                              >
                                Yes, cancel it
                              </button>
                            </div>
                            {deleteError && (
                              <p className="w-full text-sm font-medium text-red-600">
                                {deleteError}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Inline edit form */}
                        {isEditing && (
                          <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                            {rowError && (
                              <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {rowError}
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-slate-500">
                                  Departure Time
                                </label>
                                <input
                                  type="datetime-local"
                                  name="departureTime"
                                  value={editForm.departureTime}
                                  onChange={handleEditChange}
                                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-slate-500">
                                  Estimated Arrival Time
                                </label>
                                <input
                                  type="datetime-local"
                                  name="estimateArrivalTime"
                                  value={editForm.estimateArrivalTime}
                                  onChange={handleEditChange}
                                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-slate-500">
                                  Available Seats
                                </label>
                                <select
                                  name="availableSeats"
                                  value={editForm.availableSeats}
                                  onChange={handleEditChange}
                                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                >
                                  {[1, 2, 3, 4, 5, 6].map((num) => (
                                    <option key={num} value={num}>
                                      {num} {num === 1 ? "Seat" : "Seats"}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-slate-500">
                                  Price Per Seat
                                </label>
                                <input
                                  type="number"
                                  name="pricePerSeat"
                                  min="10"
                                  value={editForm.pricePerSeat}
                                  onChange={handleEditChange}
                                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                onClick={cancelEditing}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(ride.rideId)}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" />
                                {saving ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default DriverRides;
