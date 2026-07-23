import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import RegisterVehicle from "./pages/Register/RegisterVehicle";
import UserProfile from "./pages/Profile/UserProfile";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/search" element={<RideSearch />} /> */}
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
          {/* New Vehicle Registration Route */}
          <Route path="/register-vehicle" element={<RegisterVehicle />} />

          {/* Protected Routes: Any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Protected Routes: DRIVERS only */}
          {/* <Route element={<ProtectedRoute allowedRoles={["DRIVER"]} />}>
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route
              path="/publish-ride"
              element={<div>Publish Ride Page</div>}
            />
          </Route> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
