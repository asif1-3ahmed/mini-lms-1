import axios from "axios";

// ✅ Use one base for all endpoints
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000/api/",
});

// ✅ Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default API;
