import { useEffect, useState } from "react";
import {
  Car,
  Hash,
  Tag,
  Users,
  Fuel,
  AlertCircle,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  getPendingVehicles,
  approveVehicle,
  rejectVehicle,
} from "../../api/adminService";

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actioningId, setActioningId] = useState(null);
  const [rowError, setRowError] = useState("");

  // Rejection reason modal state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPendingVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load pending vehicles. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (vehicleId) => {
    setRowError("");
    setActioningId(vehicleId);
    try {
      await approveVehicle(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    } catch (err) {
      setRowError(
        err?.response?.data?.message || "Failed to approve this vehicle.",
      );
    } finally {
      setActioningId(null);
    }
  };

  const openRejectDialog = (vehicleId) => {
    setRowError("");
    setRejectingId(vehicleId);
    setRejectReason("");
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason("");
  };

  const handleConfirmReject = async (vehicleId) => {
    if (!rejectReason.trim()) {
      setRowError("A rejection reason is required.");
      return;
    }
    setRowError("");
    setActioningId(vehicleId);
    try {
      await rejectVehicle(vehicleId, rejectReason.trim());
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      setRowError(
        err?.response?.data?.message || "Failed to reject this vehicle.",
      );
    } finally {
      setActioningId(null);
    }
  };

  return (
    <AdminLayout
      title="Vehicle Verification"
      subtitle="Review and approve or reject vehicles awaiting verification"
    >
      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-14 text-center text-slate-500 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          Loading pending vehicles...
        </div>
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

      {!loading && !error && vehicles.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
          <ShieldAlert className="h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-700">
            No vehicles awaiting verification
          </p>
          <p className="text-sm text-slate-500">
            New driver vehicle registrations will show up here.
          </p>
        </div>
      )}

      {!loading && !error && vehicles.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {vehicles.map((vehicle) => {
            const isRejecting = rejectingId === vehicle.id;
            return (
              <div
                key={vehicle.id}
                className={`overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 ${
                  isRejecting ? "md:col-span-2" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-50 p-2.5">
                    <Car className="h-5 w-5 text-amber-600" />
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

                {!isRejecting && (
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => openRejectDialog(vehicle.id)}
                      disabled={actioningId === vehicle.id}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(vehicle.id)}
                      disabled={actioningId === vehicle.id}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {actioningId === vehicle.id
                        ? "Approving..."
                        : "Approve"}
                    </button>
                  </div>
                )}

                {isRejecting && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <label className="block text-xs font-medium text-slate-500">
                      Rejection reason
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="Explain why this vehicle is being rejected..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelReject}
                        disabled={actioningId === vehicle.id}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmReject(vehicle.id)}
                        disabled={actioningId === vehicle.id}
                        className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        {actioningId === vehicle.id
                          ? "Rejecting..."
                          : "Confirm Rejection"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVehicles;
