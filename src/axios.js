// src/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://a8bd-2401-4900-88b7-ccb5-419a-b016-d5f6-8fec.ngrok-free.app/api",
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
