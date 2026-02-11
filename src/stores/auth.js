// src/stores/auth.js
import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "../axios"; // tumhara axios instance

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const accessToken = ref(null);
  const loading = ref(true);
  const isVerified = ref(false);
  /**
   * Initialize auth state from localStorage
   */
  const initAuth = async () => {
    const rawUser = localStorage.getItem("auth_user");
    const token = localStorage.getItem("auth_token");
    if (rawUser && token) {
      try {
        user.value = JSON.parse(rawUser);
        accessToken.value = token;

        const res = await axios.post("/userinfo", {
          headers: { Authorization: `Bearer ${token}` }
        });

        isVerified.value = res.data.is_verified;

      } catch (err) {
        console.error("Auth init failed:", err);
        user.value = null;
        accessToken.value = null;
      }
    }
    loading.value = false;
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      console.log('dsdds');

      const res = await axios.post("/login", { email, password });
      console.log(res);

      user.value = res.data.user;
      accessToken.value = res.data.token;
      isVerified.value = res.data.user?.is_verified ?? false;
      localStorage.setItem("auth_user", JSON.stringify(user.value));
      localStorage.setItem("auth_token", accessToken.value);
      
      return { error: null };
    } catch (err) {
      return { error: err.response?.data || { message: "Login failed" } };
    }
  };

  /**
   * Register / Sign up user
   */
  const signUp = async (name, email, phone_number, password) => {
    console.log('sss', name, email, phone_number, password);

    try {
      console.log('parth');

      const res = await axios.post("/register", { name, email, phone_number, password });
      console.log('dhamo', res);

      user.value = res.data.user;
      accessToken.value = res.data.token;

      localStorage.setItem("auth_user", JSON.stringify(user.value));
      localStorage.setItem("auth_token", accessToken.value);

      return { error: null };
    } catch (err) {
      return { error: err.response?.data || { message: "SignUp failed" } };
    }
  };

  /**
   * Logout user
   */
  const signOut = async () => {
    try {

      if (accessToken.value) {
        await axios.post("/logout", {}, {
          headers: { Authorization: `Bearer ${accessToken.value}` }
        });
      }
    } catch (err) {
      console.warn("Logout failed:", err);
    } finally {
      user.value = null;
      accessToken.value = null;
      isVerified.value = false;
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
    return { error: null };
  };

  /**
   * Check if user is logged in
   */
  const isAuthenticated = () => !!user.value;

  return {
    user,
    accessToken,
    loading,
    isVerified,
    initAuth,
    login,
    signUp,
    signOut,
    isAuthenticated,
  };
});
