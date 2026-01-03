<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MediaCard from "../components/MediaCard.vue";
import { getPersonDetails, getPersonCombinedCredits, profileUrl } from "../api/tmdb";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);

const loading = ref(false);
const error = ref("");

const person = ref(null);
const knownFor = ref([]);
const creditsAll = ref([]);

function titleOf(x) {
  return x.title || x.name || "";
}
function yearOf(x) {
  const d = x.release_date || x.first_air_date || "";
  return d ? Number(d.slice(0, 4)) : 0;
}

function buildCredits(c) {
  const all = [...(c.cast || []), ...(c.crew || [])]
    .filter((x) => ["movie", "tv"].includes(x.media_type));

  // de-dupe
  const map = new Map();
  for (const x of all) map.set(`${x.media_type}-${x.id}`, x);

  const arr = [...map.values()];

  // Known for: popularity
  knownFor.value = [...arr]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 12);

  // Filmography: year desc then title
  creditsAll.value = [...arr].sort((a, b) => {
    const dy = yearOf(b) - yearOf(a);
    if (dy) return dy;
    return titleOf(a).localeCompare(titleOf(b));
  });
}

async function load() {
  loading.value = true;
  error.value = "";
  person.value = null;
  knownFor.value = [];
  creditsAll.value = [];

  try {
    const [p, c] = await Promise.all([
      getPersonDetails({ apiKey, id: id.value }),
      getPersonCombinedCredits({ apiKey, id: id.value }),
    ]);

    person.value = p;
    buildCredits(c);
  } catch (e) {
    error.value = e?.message || "Failed to load person.";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(id, load);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <button
      @click="router.back()"
      class="rounded-xl px-4 py-2 border border-white/10 text-slate-200 hover:bg-white/5"
    >
      ← Back
    </button>

    <div v-if="error" class="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
      {{ error }}
    </div>

    <div v-if="loading" class="mt-6 text-slate-300">Loading…</div>

    <div v-else-if="person" class="mt-6 space-y-10">
      <!-- Header -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/30 p-6 md:p-8 grid md:grid-cols-[220px_1fr] gap-6">
        <div class="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40">
          <img
            v-if="person.profile_path"
            :src="profileUrl(person.profile_path, 'w342')"
            class="w-full h-full object-cover"
            :alt="person.name"
          />
          <div v-else class="h-[320px] flex items-center justify-center text-slate-400">No Photo</div>
        </div>

        <div>
          <h1 class="text-3xl md:text-5xl font-extrabold text-white">{{ person.name }}</h1>

          <div class="mt-2 text-slate-300">
            <span v-if="person.known_for_department">{{ person.known_for_department }}</span>
            <span v-if="person.birthday" class="text-slate-400"> • Born: {{ person.birthday }}</span>
            <span v-if="person.place_of_birth" class="text-slate-400"> • {{ person.place_of_birth }}</span>
          </div>

          <p class="mt-5 text-slate-200/90 leading-relaxed whitespace-pre-line">
            {{ person.biography || "No biography available." }}
          </p>

          <a
            class="inline-block mt-6 rounded-xl px-4 py-2 border border-white/10 text-slate-200 hover:bg-white/5"
            :href="`https://www.themoviedb.org/person/${person.id}`"
            target="_blank"
            rel="noreferrer"
          >
            View on TMDB
          </a>
        </div>
      </div>

      <!-- Known For -->
      <section>
        <h2 class="text-xl font-bold text-slate-100">Known For</h2>
        <div v-if="knownFor.length" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MediaCard
            v-for="x in knownFor"
            :key="`${x.media_type}-${x.id}`"
            :item="x"
            :mediaType="x.media_type"
          />
        </div>
        <div v-else class="mt-4 text-slate-400">No credits found.</div>
      </section>

      <!-- Filmography -->
      <section>
        <h2 class="text-xl font-bold text-slate-100">Filmography</h2>
        <div v-if="creditsAll.length" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MediaCard
            v-for="x in creditsAll.slice(0, 40)"
            :key="`${x.media_type}-${x.id}`"
            :item="x"
            :mediaType="x.media_type"
          />
        </div>
        <div v-else class="mt-4 text-slate-400">No filmography found.</div>
      </section>
    </div>
  </div>
</template>
