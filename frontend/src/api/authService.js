import api from "./axiosConfig";

// Thin wrapper around the /api/auth/* endpoints used by Register, Login,
// VerifyOtp and ForgotPassword pages. Centralising these means the
// components stay focused on UI state instead of repeating fetch() calls.

export const registerUser = (payload) => api.post("/auth/register", payload);

export const loginUser = (payload) => api.post("/auth/login", payload);

export const verifyOtp = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp });

// purpose: "REGISTER" | "RESET_PASSWORD"
export const resendOtp = (email, purpose) =>
  api.post("/auth/resend-otp", { email, purpose });

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (email, otp, newPassword) =>
  api.post("/auth/reset-password", { email, otp, newPassword });
