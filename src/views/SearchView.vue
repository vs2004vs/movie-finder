<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import SearchBar from "../components/SearchBar.vue";
import { multiSearch, posterUrl, profileUrl } from "../api/tmdb";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const router = useRouter();

const q = ref("");

// nextPage = the next page we will fetch (1, 2, 3…)
const nextPage = ref(1);
const totalPages = ref(Infinity);

const loading = ref(false);
const error = ref("");
const results = ref([]);

const hasQuery = computed(() => q.value.trim().length > 0);
const canLoadMore = computed(() => hasQuery.value && !loading.value && nextPage.value <= totalPages.value);

function titleOf(r) {
  return r.media_type === "movie" ? r.title : r.name;
}
function subOf(r) {
  if (r.media_type === "person") return "Person";
  const d = r.media_type === "movie" ? r.release_date : r.first_air_date;
  return (d || "").slice(0, 4) || (r.media_type === "tv" ? "TV" : "Movie");
}
function imgOf(r) {
  if (r.media_type === "person") return profileUrl(r.profile_path, "w185");
  return posterUrl(r.poster_path, "w185");
}
function go(r) {
  if (r.media_type === "movie") router.push(`/movie/${r.id}`);
  else if (r.media_type === "tv") router.push(`/tv/${r.id}`);
  else if (r.media_type === "person") router.push(`/person/${r.id}`);
}

function resetSearch() {
  results.value = [];
  error.value = "";
  nextPage.value = 1;
  totalPages.value = Infinity;
}

function appendUnique(items) {
  const seen = new Set(results.value.map((x) => `${x.media_type}:${x.id}`));
  const fresh = items.filter((x) => x?.id && x?.media_type && !seen.has(`${x.media_type}:${x.id}`));
  results.value.push(...fresh);
}

async function fetchPage() {
  const query = q.value.trim();
  if (!query) return;

  if (!apiKey) {
    error.value = "Missing TMDB API key.";
    return;
  }

  if (loading.value) return;
  if (nextPage.value > totalPages.value) return;

  loading.value = true;
  error.value = "";

  try {
    const data = await multiSearch({
      apiKey,
      query,
      page: nextPage.value,
    });

    // set total pages (first time we learn it)
    totalPages.value = data?.total_pages || 1;

    const incoming = (data?.results || []).filter((r) =>
      ["movie", "tv", "person"].includes(r.media_type)
    );

    appendUnique(incoming);

    // move to next page for next "Load more"
    nextPage.value += 1;
  } catch (e) {
    error.value = e?.message || "Search failed.";
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  resetSearch();
  await fetchPage();
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
    <div class="space-y-2">
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100">Search</h1>
      <p class="text-slate-400">Search movies, TV shows and people.</p>
    </div>

    <div class="mt-6">
      <SearchBar v-model="q" @submit="onSubmit" placeholder="Search movies, TV, people..." />
    </div>

    <div v-if="error" class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
      {{ error }}
    </div>

    <!-- Results grid -->
    <div class="mt-8">
      <div v-if="results.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <button
          v-for="r in results"
          :key="`${r.media_type}-${r.id}`"
          @click="go(r)"
          class="text-left rounded-2xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/50 transition p-3 flex gap-3"
        >
          <div class="h-16 w-12 rounded-xl overflow-hidden bg-slate-800/40 flex-shrink-0">
            <img v-if="imgOf(r)" :src="imgOf(r)" class="h-full w-full object-cover" />
            <div v-else class="h-full w-full flex items-center justify-center text-xs text-slate-400">No</div>
          </div>

          <div class="min-w-0">
            <div class="font-semibold text-slate-100 truncate">
              {{ titleOf(r) }}
              <span class="text-slate-400 font-normal">• {{ r.media_type }}</span>
            </div>
            <div class="text-sm text-slate-400">{{ subOf(r) }}</div>
          </div>
        </button>
      </div>

      

      <!-- Load more: keeps results visible -->
      <div v-if="results.length" class="mt-8 flex flex-col items-center gap-2">
        <button
          @click="fetchPage"
          :disabled="!canLoadMore"
          class="rounded-xl px-5 py-2 border border-white/10 text-slate-200 hover:bg-white/5 disabled:opacity-50"
        >
          {{ loading ? "Loading more…" : nextPage > totalPages ? "No more results" : "Load more" }}
        </button>

        <div class="text-xs text-slate-400">
          Showing {{ results.length }} • Loaded pages: {{ Math.max(nextPage - 1, 0) }}
          <span v-if="totalPages !== Infinity"> / {{ totalPages }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
