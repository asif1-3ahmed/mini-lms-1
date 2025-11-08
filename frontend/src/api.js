import axios from "axios";

const API = axios.create({
  baseURL: (process.env.REACT_APP_API_BASE || "http://localhost:8000/api/") + "accounts/",
  timeout: 10000
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default API;
