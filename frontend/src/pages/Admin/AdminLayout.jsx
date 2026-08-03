import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Car,
  ClipboardList,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

const TABS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/vehicles", label: "Vehicle Verification", icon: ShieldCheck },
  { to: "/admin/rides", label: "Rides", icon: Car },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
];

const AdminLayout = ({ title, subtitle, children }) => {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-10 md:px-10">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-emerald-50">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-white px-4 md:px-10">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-1 overflow-x-auto">
            {TABS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-emerald-700"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-8 md:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminLayout;
