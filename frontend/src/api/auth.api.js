import api from "./axios";

export const loginUser = (data) => api.post("/user/login", data);

export const registerUser = (formData) =>
  api.post("/user/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getCurrentUser = () => api.get("/user/get-current-user");

export const logoutUser = () => api.post("/user/logout");

export const updateAccountDetails = (data) =>
  api.patch("/user/change-account-details", data);

export const changePassword = (data) => api.post("/user/change-password", data);

export const updateAvatar = (formData) =>
  api.patch("/user/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateCoverImage = (formData) =>
  api.patch("/user/coverImage", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
