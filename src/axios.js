// src/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://7dfc-2401-4900-88b7-ccb5-3c55-4a4-427c-6832.ngrok-free.app/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Token auto attach
api.interceptors.request.use(config => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
