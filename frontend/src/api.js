import axios from "axios";

// ✅ Centralized API instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "https://mini-lms-1-1.onrender.com/api/",
});

// ✅ Auto-attach token for every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default API;
