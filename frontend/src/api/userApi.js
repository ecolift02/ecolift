import api from "./axiosConfig";

export const getProfile = async () => {
  const res = await api.get("/users/profile");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put("/users/profile", data);
  return res.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const res = await api.put("/users/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
};

// Uploads a new profile picture (multipart/form-data) and returns the
// updated profile (with the new profilePictureUrl already set).
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/users/profile/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
