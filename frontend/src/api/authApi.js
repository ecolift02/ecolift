import api from "./axiosConfig";

export const registerUser = (payload) => api.post("/auth/register", payload);

export const loginUser = (payload) => api.post("/auth/login", payload);

export const verifyOtp = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp });

export const resendOtp = (email, purpose) =>
  api.post("/auth/resend-otp", { email, purpose });

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (email, otp, newPassword) =>
  api.post("/auth/reset-password", { email, otp, newPassword });
