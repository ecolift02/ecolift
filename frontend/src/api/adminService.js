import api from "./axiosConfig";

// ---------- Module 1 - Dashboard ----------

export const getDashboard = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

// ---------- Module 2 - User Management ----------

export const getUsers = async (search, role) => {
  const params = {};
  if (search) params.search = search;
  if (role) params.role = role;
  const res = await api.get("/admin/users", { params });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const suspendUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/suspend`);
  return res.data;
};

export const activateUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/activate`);
  return res.data;
};

// ---------- Module 3 - Vehicle Verification ----------

export const getPendingVehicles = async () => {
  const res = await api.get("/admin/vehicles/pending");
  return res.data;
};

export const approveVehicle = async (id) => {
  const res = await api.patch(`/admin/vehicles/${id}/approve`);
  return res.data;
};

export const rejectVehicle = async (id, reason) => {
  const res = await api.patch(`/admin/vehicles/${id}/reject`, { reason });
  return res.data;
};

// ---------- Module 4 - Ride Monitoring ----------

export const getRides = async (status) => {
  const params = {};
  if (status) params.status = status;
  const res = await api.get("/admin/rides", { params });
  return res.data;
};

export const getRideById = async (id) => {
  const res = await api.get(`/admin/rides/${id}`);
  return res.data;
};

// ---------- Module 5 - Booking Monitoring ----------

export const getBookings = async (status) => {
  const params = {};
  if (status) params.status = status;
  const res = await api.get("/admin/bookings", { params });
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await api.get(`/admin/bookings/${id}`);
  return res.data;
};
