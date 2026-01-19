<script setup>
import { computed, onMounted, ref, watch } from "vue";
import MovieCard from "../components/MovieCard.vue";
import { backdropUrl, getPopularMovies, getTrendingMovies, getUpcomingMovies } from "../api/tmdb";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;

console.log(Object.keys(import.meta.env).filter(k => k.startsWith("VITE_")));



const trendingWindow = ref("day"); // "day" | "week"
const loading = ref(false);
const error = ref("");

const trending = ref([]);
const popular = ref([]);
const upcoming = ref([]);

const hero = computed(() => trending.value?.[0] || popular.value?.[0] || null);

async function loadHome() {
  if (!apiKey) {
    error.value = "Missing TMDB API key. Add VITE_TMDB_API_KEY in your .env file.";
    return;
  }

  loading.value = true;
  error.value = "";
  try {
    const [t, p, u] = await Promise.all([
      getTrendingMovies({ apiKey, timeWindow: trendingWindow.value }),
      getPopularMovies({ apiKey }),
      getUpcomingMovies({ apiKey }),
    ]);

    trending.value = t.results || [];
    popular.value = p.results || [];
    upcoming.value = u.results || [];
  } catch (e) {
    error.value = e?.message || "Failed to load homepage.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadHome);
watch(trendingWindow, loadHome);
</script>

<template>



  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Hero -->
    <div
      v-if="hero"
      class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40"
    >
      <div
        class="absolute inset-0 opacity-30"
        :style="hero.backdrop_path ? `background-image:url(${backdropUrl(hero.backdrop_path)})` : ''"
        style="background-size:cover;background-position:center;"
      />
      <div class="relative p-6 md:p-10">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm text-slate-200">
           Trending now
          <span class="text-slate-400">•</span>
          <span class="capitalize">{{ trendingWindow }}</span>
        </div>

        <h1 class="mt-4 text-3xl md:text-5xl font-extrabold text-white max-w-2xl">
          {{ hero.title }}
        </h1>

        <p class="mt-3 text-slate-200/90 max-w-2xl line-clamp-3">
          {{ hero.overview || "No overview available." }}
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink
            :to="`/movie/${hero.id}`"
            class="rounded-xl px-5 py-3 bg-white text-slate-900 font-semibold hover:opacity-90"
          >
            View details
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-if="error" class="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
      {{ error }}
    </div>

    <!-- Trending controls -->
    <div class="mt-8 flex items-center justify-between gap-4 flex-wrap">
      <h2 class="text-xl md:text-2xl font-bold text-slate-100">What’s hot now</h2>
      <RouterLink
            to="/search"
            class="rounded-xl px-5 py-3 border border-white/10 text-slate-200 hover:bg-white/5"
          >
            Search movies
          </RouterLink>

      <div class="inline-flex rounded-xl border border-white/10 bg-slate-900/40 p-1">
        <button
          class="px-4 py-2 rounded-lg text-sm font-semibold"
          :class="trendingWindow === 'day' ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-white/5'"
          @click="trendingWindow = 'day'"
        >
          Today
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-semibold"
          :class="trendingWindow === 'week' ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-white/5'"
          @click="trendingWindow = 'week'"
        >
          This Week
        </button>
      </div>
    </div>

    <!-- Trending grid -->
    <div v-if="loading" class="mt-6 text-slate-300">Loading…</div>

    <div v-else class="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <MovieCard v-for="m in trending" :key="m.id" :movie="m" />
    </div>

    <!-- Popular row -->
    <div class="mt-10">
      <h3 class="text-lg md:text-xl font-bold text-slate-100">Popular</h3>
      <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MovieCard v-for="m in popular.slice(0, 10)" :key="m.id" :movie="m" />
      </div>
    </div>

    <!-- Upcoming row -->
    <div class="mt-10">
      <h3 class="text-lg md:text-xl font-bold text-slate-100">Upcoming</h3>
      <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MovieCard v-for="m in upcoming.slice(0, 10)" :key="m.id" :movie="m" />
      </div>
    </div>
  </div>
</template>
