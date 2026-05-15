// src/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://296b-2401-4900-8fc6-bd28-6884-bca0-483e-8e4b.ngrok-free.app/api",
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
