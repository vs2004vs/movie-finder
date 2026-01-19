<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const error = ref("");

function submit() {
  error.value = "";
  if (!email.value.trim()) {
    error.value = "Email is required.";
    return;
  }
  auth.login({ email: email.value.trim() });

  const redirect = route.query.redirect || "/";
  router.replace(String(redirect));
}
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-10">
    <h1 class="text-3xl font-extrabold text-white">Login</h1>
    <p class="text-slate-400 mt-2">login </p>

    <div v-if="error" class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 text-sm">
      {{ error }}
    </div>

    <form @submit.prevent="submit" class="mt-6 space-y-3">
      <div>
        <label class="text-sm text-slate-300">Email</label>
        <input
          v-model="email"
          type="email"
          class="mt-1 w-full rounded-xl bg-slate-950/60 border border-white/10 px-3 py-2 text-slate-100"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        class="w-full rounded-xl px-4 py-2 bg-white text-slate-950 font-semibold hover:opacity-90"
      >
        Sign in
      </button>
    </form>
  </div>
</template>
