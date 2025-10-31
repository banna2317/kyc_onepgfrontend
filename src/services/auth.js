import api from "@/axios";

export async function getCsrfCookie() {
  await api.get("/sanctum/csrf-cookie");
}

export async function login(email, password) {
  await getCsrfCookie();
  return api.post("/login", { email, password });
}

export async function logout() {
  return api.post("/logout");
}

export async function fetchUser() {
  return api.get("/api/user");
}
