import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import RegisterVehicle from "./pages/Register/RegisterVehicle";
import UserProfile from "./pages/Profile/UserProfile";
import SearchResults from "./pages/Search/SearchResults";
import RideDetails from "./pages/RideDetails/RideDetails";
import Booking from "./pages/Booking/Booking";
import DriverRides from "./pages/DriverRides/DriverRides";
import MyVehicles from "./pages/MyVehicles/MyVehicles";
import Unauthorized from "./pages/Unauthorized/Unauthorized";
import MyBookings from "./pages/MyBookings/MyBookings";
import DriverBookings from "./pages/DriverBookings/DriverBookings";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminVehicles from "./pages/Admin/AdminVehicles";
import AdminRides from "./pages/Admin/AdminRides";
import AdminBookings from "./pages/Admin/AdminBookings";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/ride-details" element={<RideDetails />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* New Vehicle Registration Route */}
          <Route path="/register-vehicle" element={<RegisterVehicle />} />

          {/* Protected Routes: Any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/bookings/my" element={<MyBookings />} />
          </Route>

          {/* Protected Routes: DRIVERS only */}
          <Route element={<ProtectedRoute allowedRoles={["DRIVER"]} />}>
            <Route path="/driver/rides" element={<DriverRides />} />
            <Route path="/driver/vehicles" element={<MyVehicles />} />
            <Route path="/driver/bookings" element={<DriverBookings />} />
          </Route>
          {/* <Route element={<ProtectedRoute allowedRoles={["DRIVER"]} />}>
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route
              path="/publish-ride"
              element={<div>Publish Ride Page</div>}
            />
          </Route> */}

          {/* Protected Routes: ADMIN only */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/vehicles" element={<AdminVehicles />} />
            <Route path="/admin/rides" element={<AdminRides />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;