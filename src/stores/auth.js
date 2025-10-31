import { defineStore } from "pinia";
import { login, logout, fetchUser } from "@/services/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async getUser() {
      try {
        this.loading = true;
        const res = await fetchUser();
        this.user = res.data;
      } catch {
        this.user = null;
      } finally {
        this.loading = false;
      }
    },

    async login(email, password) {
      try {
        this.loading = true;
        await login(email, password);
        await this.getUser(); // Fetch after login
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      await logout();
      this.user = null;
    },
  },
});
