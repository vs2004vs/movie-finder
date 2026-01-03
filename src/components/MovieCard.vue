<script setup>
import { posterUrl } from "../api/tmdb";
defineProps({ movie: { type: Object, required: true } });
</script>

<template>
  <RouterLink
    :to="`/movie/${movie.id}`"
    class="group block text-left rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition"
  >
    <div class="aspect-[2/3] bg-slate-800/40 overflow-hidden">
      <img
        v-if="movie.poster_path"
        :src="posterUrl(movie.poster_path, 'w500')"
        :alt="movie.title"
        class="h-full w-full object-cover group-hover:scale-[1.02] transition"
        loading="lazy"
      />
      <div v-else class="h-full w-full flex items-center justify-center text-slate-400">
        No Poster
      </div>
    </div>

    <div class="p-4">
      <div class="font-semibold text-slate-100 line-clamp-1">{{ movie.title }}</div>
      <div class="text-sm text-slate-400 mt-1">
        {{ (movie.release_date || "").slice(0, 4) || "—" }} • ⭐ {{ movie.vote_average?.toFixed?.(1) ?? "—" }}
      </div>
    </div>
  </RouterLink>
</template>
