import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import RegisterVehicle from "./pages/Register/RegisterVehicle";
import UserProfile from "./pages/Profile/UserProfile";
// 1. IMPORT YOUR NEW DASHBOARD
import Dashboard from "./pages/Dashboard/Dashboard"; 

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-vehicle" element={<RegisterVehicle />} />

          {/* Protected Routes: Any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfile />} />
            {/* 2. ADD THE DASHBOARD ROUTE HERE */}
            <Route path="/dashboard" element={<Dashboard />} /> 
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;