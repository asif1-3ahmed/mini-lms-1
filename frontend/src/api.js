import axios from "axios";

// ✅ Use a single API base for ALL routes
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "https://mini-lms-1-1.onrender.com/api/",
});

// ✅ Attach token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default API;
