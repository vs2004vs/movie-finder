<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MovieCard from "../components/MovieCard.vue";
import { getCollectionDetails, backdropUrl } from "../api/tmdb";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);

const loading = ref(false);
const error = ref("");
const collection = ref(null);

async function load() {
  if (!apiKey) {
    error.value = "Missing TMDB API key.";
    return;
  }
  loading.value = true;
  error.value = "";
  collection.value = null;

  try {
    collection.value = await getCollectionDetails({ apiKey, id: id.value });
  } catch (e) {
    error.value = e?.message || "Failed to load collection.";
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

    <div v-else-if="collection" class="mt-6 space-y-8">
      <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6">
        <div
          class="absolute inset-0 opacity-30"
          :style="collection.backdrop_path ? `background-image:url(${backdropUrl(collection.backdrop_path)})` : ''"
          style="background-size:cover;background-position:center;"
        />
        <div class="relative">
          <h1 class="text-3xl md:text-5xl font-extrabold text-white">{{ collection.name }}</h1>
          <p class="mt-3 text-slate-200/90 max-w-3xl">
            {{ collection.overview || "No description available." }}
          </p>
        </div>
      </div>

      <section>
        <h2 class="text-xl font-bold text-slate-100">Movies in this Collection</h2>
        <div v-if="collection.parts?.length" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MovieCard
            v-for="m in [...collection.parts].sort((a,b)=> (a.release_date||'').localeCompare(b.release_date||''))"
            :key="m.id"
            :movie="m"
          />
        </div>
        <div v-else class="mt-4 text-slate-400">No movies found in this collection.</div>
      </section>
    </div>
  </div>
</template>
