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

  /**
   * Step 1: Register user and request email verification OTP
   */
  const registerStep1 = async (userData) => {
    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/register-step1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Step 2: Verify email OTP and complete registration
   */
  const verifyEmailAndRegister = async (email, otp) => {
    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: otp }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Email verification failed");
      }

      const data = await response.json();
      if (data.token) {
        login(data, data.token);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Step 1: Login - Send OTP to email after password verification
   */
  const loginStep1 = async (email, password) => {
    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/login-step1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Step 2: Login - Verify OTP and complete login
   */
  const loginStep2 = async (email, otp) => {
    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/login-step2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: otp }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "OTP verification failed");
      }

      const data = await response.json();
      if (data.token) {
        login(data, data.token);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Request password reset - Send OTP to email
   */
  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Verify reset OTP
   */
  const verifyResetOTP = async (email, otp) => {
    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/verify-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: otp }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    try {
      const response = await fetch(
        "http://localhost:8083/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword,
            confirmPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Password reset failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
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
        registerStep1,
        verifyEmailAndRegister,
        loginStep1,
        loginStep2,
        requestPasswordReset,
        verifyResetOTP,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
