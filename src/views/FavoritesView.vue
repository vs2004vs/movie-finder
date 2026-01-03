<script setup>
import { computed, onMounted, ref } from "vue";
import MediaCard from "../components/MediaCard.vue";
import { getMovieDetails, getTvDetails } from "../api/tmdb";
import { useFavorites } from "../composables/useFavorites";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const fav = useFavorites();

const loading = ref(false);
const error = ref("");

const query = ref("");
const typeFilter = ref("all"); // all | movie | tv
const sortBy = ref("title"); // title | year | rating

const entries = ref([]); // [{type,id}]
const items = ref([]);   // resolved media objects with __type

const count = computed(() => entries.value.length);

function titleOf(x) { return x.title || x.name || ""; }
function yearOf(x) {
  const d = x.release_date || x.first_air_date || "";
  return d ? Number(d.slice(0,4)) : 0;
}

async function loadFavs() {
  entries.value = fav.list();

  if (!apiKey) {
    error.value = "Missing TMDB API key.";
    return;
  }

  loading.value = true;
  error.value = "";
  items.value = [];

  try {
    const data = await Promise.all(
      entries.value.map(async (e) => {
        const obj = e.type === "tv"
          ? await getTvDetails({ apiKey, id: e.id })
          : await getMovieDetails({ apiKey, id: e.id });
        return { ...obj, __type: e.type };
      })
    );

    items.value = data;
  } catch (e) {
    error.value = e?.message || "Failed to load favorites.";
  } finally {
    loading.value = false;
  }
}

function removeFav(payload) {
  // payload: { type: computedRef, id } OR { type: 'movie'/'tv', id }
  const t = payload?.type?.value || payload?.type;
  const id = payload?.id;
  fav.remove(t, id);
  loadFavs();
}

function clearFavs() {
  fav.clear();
  loadFavs();
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return items.value
    .filter(x => typeFilter.value === "all" ? true : x.__type === typeFilter.value)
    .filter(x => !q ? true : titleOf(x).toLowerCase().includes(q));
});

const sorted = computed(() => {
  const arr = [...filtered.value];
  if (sortBy.value === "title") arr.sort((a,b) => titleOf(a).localeCompare(titleOf(b)));
  if (sortBy.value === "year") arr.sort((a,b) => yearOf(b) - yearOf(a));
  if (sortBy.value === "rating") arr.sort((a,b) => (b.vote_average||0) - (a.vote_average||0));
  return arr;
});

onMounted(loadFavs);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold">Favorites</h1>
        <p class="text-slate-400 mt-1">Movies + TV shows you saved on this device.</p>
      </div>

      <div class="flex items-center gap-2">
        <button @click="loadFavs" class="rounded-xl px-4 py-2 border border-white/10 text-slate-200 hover:bg-white/5">
          Refresh
        </button>
        <button v-if="count" @click="clearFavs" class="rounded-xl px-4 py-2 bg-white text-slate-900 font-semibold hover:opacity-90">
          Clear ({{ count }})
        </button>
      </div>
    </div>

    <div class="mt-6 grid md:grid-cols-3 gap-3">
      <input
        v-model="query"
        placeholder="Search favorites…"
        class="w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:border-white/20"
      />

      <select v-model="typeFilter" class="rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-slate-100 outline-none">
        <option value="all">All types</option>
        <option value="movie">Movies</option>
        <option value="tv">TV Shows</option>
      </select>

      <select v-model="sortBy" class="rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-slate-100 outline-none">
        <option value="title">Sort: Title</option>
        <option value="year">Sort: Year</option>
        <option value="rating">Sort: Rating</option>
      </select>
    </div>

    <div v-if="error" class="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
      {{ error }}
    </div>

    <div v-if="loading" class="mt-6 text-slate-300">Loading…</div>

    <div v-else class="mt-8">
      <div v-if="!sorted.length" class="rounded-2xl border border-white/10 bg-slate-900/30 p-6 text-slate-300">
        No favorites yet. Add from Movie/TV pages.
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MediaCard
          v-for="x in sorted"
          :key="`${x.__type}-${x.id}`"
          :item="x"
          :mediaType="x.__type"
          removable
          @remove="removeFav"
        />
      </div>
    </div>
  </div>
</template>

