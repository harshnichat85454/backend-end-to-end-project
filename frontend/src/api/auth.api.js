import api from "./axios";


export const loginUser = (data) => {
  console.log("API called with:", data); // DEBUG
  return api.post("/user/login", data);
};
export const registerUser = (data) => api.post("/user/register", data);
export const getCurrentUser = () => api.get("/user/current-user");
export const logoutUser = () => api.post("/user/logout");
