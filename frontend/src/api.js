import axios from "axios";

// 🌍 Centralized API instance
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    "https://mini-lms-1.onrender.com/api/",
  timeout: 15000, // ⏱️ Prevents hanging requests
});

// 🔑 Attach token for every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Token ${token}`;

    // ⚙️ Auto-detect content type for uploads
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Global response handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const { response } = err;

    if (!response) {
      console.error("❌ Network Error: Backend unreachable");
      alert("Server connection lost. Please try again.");
      return Promise.reject(err);
    }

    // 🧩 Auto logout on expired token
    if (response.status === 401) {
      console.warn("⚠️ Token expired. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    // 🚫 Permission Denied (Instructor vs Student guard)
    if (response.status === 403) {
      alert("You don’t have permission to perform this action.");
    }

    // 🔄 Retry handler for transient errors (e.g. 502 from Render)
    if ([502, 503, 504].includes(response.status)) {
      console.warn("⚙️ Retrying request...");
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const retryRes = await API.request(err.config);
            resolve(retryRes);
          } catch (retryErr) {
            Promise.reject(retryErr);
          }
        }, 2000);
      });
    }

    return Promise.reject(err);
  }
);

// 🧭 Debug logging
if (import.meta.env.DEV) {
  console.log("🌐 API Base URL:", API.defaults.baseURL);
}

export default API;
