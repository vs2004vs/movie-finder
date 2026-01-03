<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MovieCard from "../components/MovieCard.vue";
import { useFavorites } from "../composables/useFavorites";
import CommunityPanel from "../components/CommunityPanel.vue";


import {
  backdropUrl,
  posterUrl,
  profileUrl,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getMovieWatchProviders,
  getMovieReviews,
} from "../api/tmdb";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);

const loading = ref(false);
const error = ref("");

const movie = ref(null);
const cast = ref([]);
const trailer = ref(null);
const similar = ref([]);

// ✅ Where to Watch
const watchProviders = ref(null);
const region = ref("LR"); // Liberia default

const providersForRegion = computed(() => {
  const map = watchProviders.value || {};
  return map[region.value] || map.US || null; // fallback to US
});

function logoUrl(path) {
  return path ? `https://image.tmdb.org/t/p/w92${path}` : "";
}

// ✅ Reviews
const reviews = ref([]);
const reviewsError = ref("");

// ✅ Favorites
const fav = useFavorites();
const isFav = computed(() => (movie.value?.id ? fav.has("movie", movie.value.id) : false));
function toggleFav() {
  if (!movie.value?.id) return;
  fav.toggle("movie", movie.value.id);
}

const year = computed(() => (movie.value?.release_date || "").slice(0, 4));
const runtime = computed(() => {
  const mins = movie.value?.runtime;
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
});

function pickTrailer(videos) {
  const list = videos?.results || [];
  const yt = list.filter((v) => v.site === "YouTube");
  return (
    yt.find((v) => v.type === "Trailer" && /official/i.test(v.name)) ||
    yt.find((v) => v.type === "Trailer") ||
    yt.find((v) => v.type === "Teaser") ||
    null
  );
}

async function load() {
  if (!apiKey) {
    error.value = "Missing TMDB API key.";
    return;
  }

  loading.value = true;
  error.value = "";

  movie.value = null;
  cast.value = [];
  trailer.value = null;
  similar.value = [];
  watchProviders.value = null;
  reviews.value = [];
  reviewsError.value = "";

  try {
    const [details, credits, videos, sim, wp, rev] = await Promise.all([
      getMovieDetails({ apiKey, id: id.value }),
      getMovieCredits({ apiKey, id: id.value }),
      getMovieVideos({ apiKey, id: id.value }),
      getSimilarMovies({ apiKey, id: id.value }),
      getMovieWatchProviders({ apiKey, id: id.value }),
      getMovieReviews({ apiKey, id: id.value, page: 1 }),
    ]);

    movie.value = details;
    cast.value = (credits.cast || []).slice(0, 12);
    trailer.value = pickTrailer(videos);
    similar.value = (sim.results || []).slice(0, 10);
    watchProviders.value = wp?.results || {};
    reviews.value = (rev?.results || []).slice(0, 6);
  } catch (e) {
    error.value = e?.message || "Failed to load movie.";
    reviewsError.value = e?.message || "Failed to load reviews.";
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

    <div
      v-if="error"
      class="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200"
    >
      {{ error }}
    </div>

    <div v-if="loading" class="mt-6 text-slate-300">Loading…</div>

    <div v-else-if="movie" class="mt-6 space-y-10">
      <!-- HERO -->
      <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40">
        <div
          class="absolute inset-0 opacity-30"
          :style="movie.backdrop_path ? `background-image:url(${backdropUrl(movie.backdrop_path)})` : ''"
          style="background-size: cover; background-position: center;"
        />
        <div class="relative p-6 md:p-10 grid md:grid-cols-[240px_1fr] gap-6">
          <!-- Poster -->
          <div class="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40">
            <img
              v-if="movie.poster_path"
              :src="posterUrl(movie.poster_path, 'w500')"
              class="w-full h-full object-cover"
              :alt="movie.title"
            />
            <div v-else class="h-[360px] flex items-center justify-center text-slate-400">
              No Poster
            </div>
          </div>

          <!-- Details -->
          <div>
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 class="text-3xl md:text-5xl font-extrabold text-white">
                  {{ movie.title }}
                  <span class="text-slate-300 font-semibold">({{ year || "—" }})</span>
                </h1>

                <div class="mt-2 text-slate-200/90 flex flex-wrap gap-x-3 gap-y-1">
                  <span>⭐ {{ movie.vote_average?.toFixed?.(1) ?? "—" }}</span>
                  <span class="text-slate-400">•</span>
                  <span>Votes: {{ movie.vote_count ?? "—" }}</span>
                  <span v-if="runtime" class="text-slate-400">•</span>
                  <span v-if="runtime">{{ runtime }}</span>
                </div>

                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="g in (movie.genres || [])"
                    :key="g.id"
                    class="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm text-slate-200"
                  >
                    {{ g.name }}
                  </span>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  @click="toggleFav"
                  class="rounded-xl px-4 py-2 bg-white text-slate-900 font-semibold hover:opacity-90"
                >
                  {{ isFav ? "★ Favorited" : "☆ Favorite" }}
                </button>

                <a
                  :href="`https://www.themoviedb.org/movie/${movie.id}`"
                  target="_blank"
                  rel="noreferrer"
                  class="rounded-xl px-4 py-2 border border-white/10 text-slate-200 hover:bg-white/5"
                >
                  TMDB
                </a>
              </div>
            </div>

            <p class="mt-6 text-slate-200/90 leading-relaxed">
              {{ movie.overview || "No overview available." }}
            </p>
          </div>
        </div>
      </div>

      <!-- TRAILER -->
      <section>
        <h2 class="text-xl font-bold text-slate-100">Trailer</h2>

        <div v-if="trailer" class="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-slate-900/30">
          <div class="aspect-video">
            <iframe
              class="w-full h-full"
              :src="`https://www.youtube.com/embed/${trailer.key}`"
              :title="trailer.name"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>

        <div v-else class="mt-4 text-slate-400">No trailer found.</div>
      </section>

      <!-- WHERE TO WATCH -->
      <section>
        <h2 class="text-xl font-bold text-slate-100">Where to Watch</h2>

        <div
          v-if="providersForRegion"
          class="mt-4 rounded-2xl border border-white/10 bg-slate-900/30 p-4 space-y-4"
        >
          <div class="flex items-center gap-3 flex-wrap">
            <label class="text-slate-300 text-sm">Region:</label>
            <select
              v-model="region"
              class="rounded-xl bg-slate-950/60 border border-white/10 px-3 py-2 text-slate-100"
            >
              <option value="LR">Liberia (LR)</option>
              <option value="US">United States (US)</option>
              <option value="GB">United Kingdom (GB)</option>
              <option value="CA">Canada (CA)</option>
              <option value="NG">Nigeria (NG)</option>
              <option value="GH">Ghana (GH)</option>
            </select>

            <a
              v-if="providersForRegion.link"
              :href="providersForRegion.link"
              target="_blank"
              rel="noreferrer"
              class="ml-auto rounded-xl px-3 py-2 border border-white/10 text-slate-200 hover:bg-white/5 text-sm"
            >
              View providers
            </a>
          </div>

          <div v-for="(key, label) in { Streaming: 'flatrate', Rent: 'rent', Buy: 'buy' }" :key="label">
            <div class="text-slate-300 font-semibold mb-2">{{ label }}</div>

            <div v-if="providersForRegion[key]?.length" class="flex flex-wrap gap-2">
              <div
                v-for="p in providersForRegion[key]"
                :key="p.provider_id"
                class="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2"
              >
                <img
                  v-if="p.logo_path"
                  :src="logoUrl(p.logo_path)"
                  class="h-6 w-6 rounded"
                  :alt="p.provider_name"
                />
                <span class="text-slate-100 text-sm">{{ p.provider_name }}</span>
              </div>
            </div>

            <div v-else class="text-slate-400 text-sm">No data for this region.</div>
          </div>
        </div>

        <div v-else class="mt-4 text-slate-400">No watch-provider info available.</div>
      </section>

      <!-- REVIEWS -->
      <section>
        <h2 class="text-xl font-bold text-slate-100">Reviews</h2>

        <div
          v-if="reviewsError"
          class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200"
        >
          {{ reviewsError }}
        </div>

        <div v-if="reviews.length" class="mt-4 space-y-3">
          <div
            v-for="r in reviews"
            :key="r.id"
            class="rounded-2xl border border-white/10 bg-slate-900/30 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-slate-100 font-semibold">{{ r.author }}</div>
                <div class="text-slate-400 text-sm">{{ (r.created_at || '').slice(0, 10) }}</div>
              </div>

              <a
                v-if="r.url"
                :href="r.url"
                target="_blank"
                rel="noreferrer"
                class="text-sm text-slate-200 underline hover:opacity-90"
              >
                Read on TMDB
              </a>
            </div>

            <p class="mt-3 text-slate-200/90 whitespace-pre-line line-clamp-6">
              {{ r.content }}
            </p>
          </div>
        </div>

        <div v-else class="mt-4 text-slate-400">No reviews found.</div>
      </section>

      <CommunityPanel v-if="movie" type="movie" :item="movie" />


      <!-- CAST (CLICKABLE) -->
      <section>
        <h2 class="text-xl font-bold text-slate-100">Top Cast</h2>

        <div v-if="cast.length" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <RouterLink
            v-for="p in cast"
            :key="p.cast_id || p.credit_id"
            :to="`/person/${p.id}`"
            class="rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden hover:bg-slate-900/50 transition"
          >
            <div class="aspect-[2/3] bg-slate-800/40">
              <img
                v-if="p.profile_path"
                :src="profileUrl(p.profile_path, 'w185')"
                class="w-full h-full object-cover"
                :alt="p.name"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400">No Photo</div>
            </div>
            <div class="p-3">
              <div class="text-slate-100 font-semibold text-sm line-clamp-1">{{ p.name }}</div>
              <div class="text-slate-400 text-xs line-clamp-1">{{ p.character || "—" }}</div>
            </div>
          </RouterLink>
        </div>

        <div v-else class="mt-4 text-slate-400">No cast data available.</div>
      </section>

      <!-- SIMILAR -->
      <section>
        <h2 class="text-xl font-bold text-slate-100">Similar Movies</h2>

        <div v-if="similar.length" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MovieCard v-for="m in similar" :key="m.id" :movie="m" />
        </div>

        <div v-else class="mt-4 text-slate-400">No similar movies found.</div>
      </section>
    </div>

    <div v-else class="mt-6 text-slate-300">No movie found.</div>
  </div>
</template>
