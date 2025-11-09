import axios from "axios";

// ✅ Centralized API configuration
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    "https://mini-lms-1-1.onrender.com/api/",
});

// ✅ Automatically attach auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// ✅ Auto logout if session expired
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // redirect to login
    }
    return Promise.reject(err);
  }
);

// (Optional) Debugging
console.log("🌐 API Base URL:", API.defaults.baseURL);

export default API;
