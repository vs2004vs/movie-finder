// src/stores/authStore.js
import { defineStore } from "pinia";

const KEY = "mf_auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem(KEY) || "null"),
  }),
  getters: {
    isAuthed: (s) => !!s.user,
  },
  actions: {
    login({ email }) {
      // Demo: all any email for now oh
      this.user = { email, name: email.split("@")[0] || "User" };
      localStorage.setItem(KEY, JSON.stringify(this.user));
    },
    logout() {
      this.user = null;
      localStorage.removeItem(KEY);
    },
  },
});
