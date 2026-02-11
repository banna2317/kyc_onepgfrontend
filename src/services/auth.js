import api from "@/axios";

// Send cookies with every request (for refresh token handling)
api.defaults.withCredentials = true;

let accessToken = sessionStorage.getItem("access_token") || null;

/**
 * Set Authorization header globally
 */
function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}
setAuthHeader(accessToken);

/**
 * Login using Laravel Passport.
 */
export async function login(email, password) {
  const response = await api.post("/api/login", { email, password });
  accessToken = response.data.access_token;

  // Save in sessionStorage
  sessionStorage.setItem("access_token", accessToken);

  // Set default header
  setAuthHeader(accessToken);

  return response;
}

/**
 * Logout and clear tokens
 */
export async function logout() {
  try {
    await api.post("/api/logout", {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    console.error("Logout failed:", e);
  } finally {
    accessToken = null;
    sessionStorage.removeItem("access_token");
    setAuthHeader(null);
  }
}

/**
 * Fetch current authenticated user
 */
export async function fetchUser() {
  if (!accessToken) throw new Error("User not authenticated");

  return api.get("/api/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * Refresh token using refresh cookie
 */
export async function refreshToken() {
  const response = await api.post("/api/refresh-token", {}, { withCredentials: true });
  accessToken = response.data.access_token;
  sessionStorage.setItem("access_token", accessToken);
  setAuthHeader(accessToken);
  return accessToken;
}

/**
 * Load token from session storage (on reload)
 */
export function loadToken() {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    accessToken = token;
    setAuthHeader(token);
  }
  return accessToken;
}
