import { useEffect, useState } from "react";
import {
  Users,
  Car,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Route,
  CheckCircle2,
  XCircle,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { getDashboard } from "../../api/adminService";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatCard = ({ icon: Icon, label, value, tint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`rounded-xl p-2.5 ${tint}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold text-slate-800">
          {value ?? 0}
        </p>
      </div>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
    {children}
  </h2>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getDashboard();
        setData(res);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load the dashboard. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Platform-wide statistics at a glance"
    >
      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-14 text-center text-slate-500 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          Loading dashboard...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <p className="text-xs text-slate-400">
            Last updated {formatDateTime(data.generatedAt)}
          </p>

          <SectionTitle>Users</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={Users}
              label="Total Users"
              value={data.totalUsers}
              tint="bg-blue-50 text-blue-700"
            />
            <StatCard
              icon={Car}
              label="Drivers"
              value={data.totalDrivers}
              tint="bg-emerald-50 text-emerald-700"
            />
            <StatCard
              icon={Users}
              label="Passengers"
              value={data.totalPassengers}
              tint="bg-amber-50 text-amber-700"
            />
          </div>

          <SectionTitle>Vehicles</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatCard
              icon={Car}
              label="Total Vehicles"
              value={data.totalVehicles}
              tint="bg-blue-50 text-blue-700"
            />
            <StatCard
              icon={ShieldAlert}
              label="Pending Verification"
              value={data.pendingVehicleVerifications}
              tint="bg-amber-50 text-amber-700"
            />
            <StatCard
              icon={ShieldCheck}
              label="Approved"
              value={data.approvedVehicles}
              tint="bg-emerald-50 text-emerald-700"
            />
            <StatCard
              icon={ShieldX}
              label="Rejected"
              value={data.rejectedVehicles}
              tint="bg-red-50 text-red-600"
            />
          </div>

          <SectionTitle>Rides</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatCard
              icon={Route}
              label="Total Published"
              value={data.totalPublishedRides}
              tint="bg-blue-50 text-blue-700"
            />
            <StatCard
              icon={Route}
              label="Active"
              value={data.activeRides}
              tint="bg-emerald-50 text-emerald-700"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={data.completedRides}
              tint="bg-slate-100 text-slate-600"
            />
            <StatCard
              icon={XCircle}
              label="Cancelled"
              value={data.cancelledRides}
              tint="bg-red-50 text-red-600"
            />
          </div>

          <SectionTitle>Bookings</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={ClipboardList}
              label="Total Bookings"
              value={data.totalBookings}
              tint="bg-blue-50 text-blue-700"
            />
          </div>

          {data.additionalStats &&
            Object.keys(data.additionalStats).length > 0 && (
              <>
                <SectionTitle>Additional Stats</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {Object.entries(data.additionalStats).map(([key, val]) => (
                    <StatCard
                      key={key}
                      icon={ClipboardList}
                      label={key}
                      value={val}
                      tint="bg-slate-100 text-slate-600"
                    />
                  ))}
                </div>
              </>
            )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
