import { useEffect, useState } from "react";
import {
  Search,
  AlertCircle,
  Ban,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { getUsers, suspendUser, activateUser } from "../../api/adminService";

const ROLE_FILTERS = ["ALL", "DRIVER", "PASSENGER", "ADMIN"];

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [actioningId, setActioningId] = useState(null);
  const [rowError, setRowError] = useState("");

  const fetchUsers = async (searchTerm, role) => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers(
        searchTerm || undefined,
        role && role !== "ALL" ? role : undefined,
      );
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load users. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("", "ALL");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(search, roleFilter);
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    fetchUsers(search, role);
  };

  const handleToggleSuspend = async (user) => {
    setRowError("");
    setActioningId(user.id);
    try {
      if (user.isSuspended) {
        await activateUser(user.id);
      } else {
        await suspendUser(user.id);
      }
      await fetchUsers(search, roleFilter);
    } catch (err) {
      setRowError(
        err?.response?.data?.message || "Failed to update this user.",
      );
    } finally {
      setActioningId(null);
    }
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle="Search, filter, suspend, or reactivate accounts"
    >
      <form
        onSubmit={handleSearchSubmit}
        className="mb-4 flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Search
        </button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {ROLE_FILTERS.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleFilterChange(role)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              roleFilter === role
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {role === "ALL" ? "All Roles" : role}
          </button>
        ))}
      </div>

      {loading && (
        <p className="py-10 text-center text-slate-500">Loading users...</p>
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

      {!loading && !error && users.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No users match this search/filter.
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {user.name}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.isSuspended
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {user.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {user.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(user.roles || []).map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {role}
                      </span>
                    ))}
                    {user.currentMode && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        Mode: {user.currentMode}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleSuspend(user)}
                  disabled={actioningId === user.id}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                    user.isSuspended
                      ? "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      : "border border-red-200 text-red-600 hover:bg-red-50"
                  }`}
                >
                  {user.isSuspended ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Ban className="h-4 w-4" />
                  )}
                  {actioningId === user.id
                    ? "Working..."
                    : user.isSuspended
                      ? "Activate"
                      : "Suspend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
