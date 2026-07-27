import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Users,
  Fuel,
  Hash,
  AlertCircle,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Check,
  BadgeCheck,
  ShieldAlert,
  Tag,
} from "lucide-react";
import api from "../../api/axiosConfig";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100";

const labelClasses = "mb-1 block text-xs font-medium text-slate-500";

const MyVehicles = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState("");

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchVehicles = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/v1/vehicles/my");
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load your vehicles. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const startEditing = async (vehicle) => {
    setDeletingId(null);
    setRowError("");
    setEditingId(vehicle.id);
    setEditForm(null);

    // The summary list doesn't carry every editable field (color, year,
    // registration number), so fetch the full record before editing.
    try {
      const response = await api.get(`/v1/vehicles/${vehicle.id}`);
      const full = response.data;
      setEditForm({
        vehicleName: full.vehicleName || "",
        vehicleNumber: full.vehicleNumber || "",
        vehicleType: full.vehicleType || "Car",
        brand: full.brand || "",
        model: full.model || "",
        color: full.color || "",
        seatCapacity: full.seatCapacity || 4,
        fuelType: full.fuelType || "Petrol",
        manufacturingYear: full.manufacturingYear || new Date().getFullYear(),
        registrationNumber: full.registrationNumber || "",
        status: full.status || "ACTIVE",
      });
    } catch (err) {
      setRowError("Failed to load vehicle details for editing.");
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
    setRowError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (vehicleId) => {
    setRowError("");

    if (!editForm.vehicleName || !editForm.vehicleNumber || !editForm.brand || !editForm.model) {
      setRowError("Please fill in all required fields.");
      return;
    }
    if (Number(editForm.seatCapacity) <= 0) {
      setRowError("Seat capacity must be at least 1.");
      return;
    }

    const payload = {
      ...editForm,
      seatCapacity: Number(editForm.seatCapacity),
      manufacturingYear: Number(editForm.manufacturingYear),
    };

    setSaving(true);
    try {
      await api.put(`/v1/vehicles/${vehicleId}`, payload);
      setEditingId(null);
      setEditForm(null);
      await fetchVehicles();
    } catch (err) {
      setRowError(
        err?.response?.data?.message || "Failed to update the vehicle.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    setDeleteError("");
    try {
      await api.delete(`/v1/vehicles/${vehicleId}`);
      setDeletingId(null);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message || "Failed to remove the vehicle.",
      );
    }
  };

  const verifiedCount = vehicles.filter((v) => v.isVerified).length;
  const activeCount = vehicles.filter((v) => v.status === "ACTIVE").length;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-10 md:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">My Vehicles</h1>
                <p className="mt-1 text-sm text-emerald-50">
                  View and manage the vehicles you've registered
                </p>
              </div>
              <button
                onClick={() => navigate("/register-vehicle")}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-md transition hover:bg-emerald-50 active:scale-[0.98]"
              >
                <PlusCircle className="h-4 w-4" />
                Register New Vehicle
              </button>
            </div>

            {!loading && vehicles.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">
                    Total Vehicles
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {vehicles.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">
                    Verified
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {verifiedCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">
                    Active
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {activeCount}
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
                Loading your vehicles...
              </div>
            ) : vehicles.length === 0 && !error ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
                <Car className="h-12 w-12 text-slate-300" />
                <p className="text-lg font-medium text-slate-700">
                  You haven't registered any vehicles yet
                </p>
                <p className="text-sm text-slate-500">
                  Add a vehicle to start publishing rides.
                </p>
                <button
                  onClick={() => navigate("/register-vehicle")}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
                >
                  <PlusCircle className="h-4 w-4" />
                  Register a Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {vehicles.map((vehicle) => {
                  const isEditing = editingId === vehicle.id;
                  const isConfirmingDelete = deletingId === vehicle.id;

                  return (
                    <div
                      key={vehicle.id}
                      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg ${
                        isEditing ? "md:col-span-2" : ""
                      }`}
                    >
                      <div className="p-5 md:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-emerald-50 p-2.5">
                              <Car className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-base font-semibold text-slate-800">
                                {vehicle.vehicleName}
                              </p>
                              <p className="text-xs text-slate-400">
                                {vehicle.brand} {vehicle.model}
                              </p>
                            </div>
                          </div>

                          {!isEditing && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEditing(vehicle)}
                                title="Edit vehicle"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingId(vehicle.id);
                                  setDeleteError("");
                                }}
                                title="Remove vehicle"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <span
                                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                  vehicle.isVerified
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {vehicle.isVerified ? (
                                  <BadgeCheck className="h-3.5 w-3.5" />
                                ) : (
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                )}
                                {vehicle.isVerified ? "Verified" : "Pending Verification"}
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  vehicle.status === "ACTIVE"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {vehicle.status}
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Hash className="h-4 w-4" />
                                {vehicle.vehicleNumber}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Tag className="h-4 w-4" />
                                {vehicle.vehicleType}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                {vehicle.seatCapacity} seats
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Fuel className="h-4 w-4" />
                                {vehicle.fuelType}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Delete confirmation */}
                        {isConfirmingDelete && (
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-600">
                              Remove this vehicle? This can't be undone.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeletingId(null)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                              >
                                Keep it
                              </button>
                              <button
                                onClick={() => handleDelete(vehicle.id)}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700"
                              >
                                Yes, remove it
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

                            {!editForm ? (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                Loading vehicle details...
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                  <div>
                                    <label className={labelClasses}>Vehicle Name</label>
                                    <input
                                      type="text"
                                      name="vehicleName"
                                      value={editForm.vehicleName}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClasses}>Vehicle Number</label>
                                    <input
                                      type="text"
                                      name="vehicleNumber"
                                      value={editForm.vehicleNumber}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClasses}>Vehicle Type</label>
                                    <select
                                      name="vehicleType"
                                      value={editForm.vehicleType}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    >
                                      <option value="Car">Car</option>
                                      <option value="SUV">SUV</option>
                                      <option value="Hatchback">Hatchback</option>
                                      <option value="Sedan">Sedan</option>
                                      <option value="Bike">Bike</option>
                                      <option value="Van">Van</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className={labelClasses}>Brand</label>
                                    <input
                                      type="text"
                                      name="brand"
                                      value={editForm.brand}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClasses}>Model</label>
                                    <input
                                      type="text"
                                      name="model"
                                      value={editForm.model}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClasses}>Color</label>
                                    <input
                                      type="text"
                                      name="color"
                                      value={editForm.color}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    />
                                  </div>

                                  <div>
                                    <label className={labelClasses}>Seat Capacity</label>
                                    <input
                                      type="number"
                                      name="seatCapacity"
                                      min="1"
                                      max="10"
                                      value={editForm.seatCapacity}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClasses}>Fuel Type</label>
                                    <select
                                      name="fuelType"
                                      value={editForm.fuelType}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    >
                                      <option value="Petrol">Petrol</option>
                                      <option value="Diesel">Diesel</option>
                                      <option value="Electric">Electric</option>
                                      <option value="Hybrid">Hybrid</option>
                                      <option value="CNG">CNG</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClasses}>Manufacturing Year</label>
                                    <input
                                      type="number"
                                      name="manufacturingYear"
                                      min="1900"
                                      max={new Date().getFullYear()}
                                      value={editForm.manufacturingYear}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    />
                                  </div>

                                  <div>
                                    <label className={labelClasses}>Registration Number</label>
                                    <input
                                      type="text"
                                      name="registrationNumber"
                                      value={editForm.registrationNumber}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClasses}>Status</label>
                                    <select
                                      name="status"
                                      value={editForm.status}
                                      onChange={handleEditChange}
                                      className={inputClasses}
                                    >
                                      <option value="ACTIVE">ACTIVE</option>
                                      <option value="INACTIVE">INACTIVE</option>
                                    </select>
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
                                    onClick={() => handleSaveEdit(vehicle.id)}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    <Check className="h-4 w-4" />
                                    {saving ? "Saving..." : "Save Changes"}
                                  </button>
                                </div>
                              </>
                            )}
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

export default MyVehicles;
