<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MovieCard from "../components/MovieCard.vue";
import { getCompanyDetails, getCompanyMovies } from "../api/tmdb";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);

const loading = ref(false);
const error = ref("");
const company = ref(null);
const movies = ref([]);

async function load() {
  if (!apiKey) {
    error.value = "Missing TMDB API key.";
    return;
  }

  loading.value = true;
  error.value = "";
  company.value = null;
  movies.value = [];

  try {
    const [c, m] = await Promise.all([
      getCompanyDetails({ apiKey, id: id.value }),
      getCompanyMovies({ apiKey, id: id.value, page: 1 }),
    ]);

    company.value = c;
    movies.value = (m.results || []).slice(0, 20);
  } catch (e) {
    error.value = e?.message || "Failed to load company.";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(id, load);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <button @click="router.back()" class="rounded-xl px-4 py-2 border border-white/10 text-slate-200 hover:bg-white/5">
      ← Back
    </button>

    <div v-if="error" class="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
      {{ error }}
    </div>

    <div v-if="loading" class="mt-6 text-slate-300">Loading…</div>

    <div v-else-if="company" class="mt-6 space-y-8">
      <div class="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
        <h1 class="text-3xl md:text-5xl font-extrabold text-white">{{ company.name }}</h1>
        <div class="mt-2 text-slate-300">
          <span v-if="company.headquarters">{{ company.headquarters }}</span>
          <span v-if="company.origin_country" class="text-slate-400"> • {{ company.origin_country }}</span>
        </div>
        <a
          v-if="company.homepage"
          class="inline-block mt-4 rounded-xl px-4 py-2 border border-white/10 text-slate-200 hover:bg-white/5"
          :href="company.homepage"
          target="_blank"
          rel="noreferrer"
        >
          Company website
        </a>
      </div>

      <section>
        <h2 class="text-xl font-bold text-slate-100">Movies</h2>
        <div v-if="movies.length" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MovieCard v-for="m in movies" :key="m.id" :movie="m" />
        </div>
        <div v-else class="mt-4 text-slate-400">No movies found for this company.</div>
      </section>
    </div>
  </div>
</template>
