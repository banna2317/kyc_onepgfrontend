// src/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://fcc1-2401-4900-88b7-ccb5-fd28-80c1-9b45-a12e.ngrok-free.app/api",
  // baseURL: "http://127.0.0.1:8000/api",
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
