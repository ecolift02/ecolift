import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosConfig";
import EcoLoader from "../components/Loader/EcoLoader";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("jwt_token"));
  const [currentMode, setCurrentMode] = useState("PASSENGER");
  const [loading, setLoading] = useState(true);

  // On mount, check if user exists in local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (token) {
      loadCurrentMode(token);
    }
    setLoading(false);
  }, [token]);

  const login = (userData, jwtToken) => {
    localStorage.setItem("jwt_token", jwtToken);
    localStorage.setItem("user_data", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const loadCurrentMode = async (jwtToken) => {
    if (!jwtToken) {
      setCurrentMode("PASSENGER");
      return;
    }

    try {
      const response = await api.get("/users/current-mode");
      if (response?.data?.mode) {
        setCurrentMode(response.data.mode);
      }
    } catch (error) {
      setCurrentMode("PASSENGER");
    }
  };

  const updateCurrentMode = async (mode) => {
    try {
      const response = await api.put("/users/current-mode", { mode });
      if (response?.data?.mode) {
        setCurrentMode(response.data.mode);
        return response.data.mode;
      }
      return currentMode;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setCurrentMode("PASSENGER");
    window.location.href = "/";
  };

  // ✅ Fix: Use the reactive 'token' state here
  const isAuthenticated = !!token;

  if (loading) return <EcoLoader />; // Prevent flickering on refresh

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        currentMode,
        login,
        logout,
        updateCurrentMode,
        loadCurrentMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
