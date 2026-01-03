<script setup>
import { computed } from "vue";
import { posterUrl } from "../api/tmdb";

const props = defineProps({
  item: { type: Object, required: true },
  mediaType: { type: String, default: "" }, // "movie" | "tv"
  removable: { type: Boolean, default: false },
});

const emit = defineEmits(["remove"]);

const type = computed(() => {
  if (props.mediaType) return props.mediaType;
  if (props.item?.media_type) return props.item.media_type; // from combined_credits
  if (props.item?.name && !props.item?.title) return "tv";
  return "movie";
});

const title = computed(() => props.item?.title || props.item?.name || "Untitled");
const year = computed(() => {
  const d = props.item?.release_date || props.item?.first_air_date || "";
  return d ? d.slice(0, 4) : "—";
});

const to = computed(() => (type.value === "tv" ? `/tv/${props.item.id}` : `/movie/${props.item.id}`));
</script>

<template>
  <div class="relative">
    <RouterLink
      :to="to"
      class="group block text-left rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition"
    >
      <div class="aspect-[2/3] bg-slate-800/40 overflow-hidden">
        <img
          v-if="item.poster_path"
          :src="posterUrl(item.poster_path, 'w500')"
          :alt="title"
          class="h-full w-full object-cover group-hover:scale-[1.02] transition"
          loading="lazy"
        />
        <div v-else class="h-full w-full flex items-center justify-center text-slate-400">
          No Poster
        </div>
      </div>

      <div class="p-4">
        <div class="font-semibold text-slate-100 line-clamp-1">{{ title }}</div>
        <div class="text-sm text-slate-400 mt-1">
          {{ year }} • ⭐ {{ item.vote_average?.toFixed?.(1) ?? "—" }}
        </div>
      </div>
    </RouterLink>

    <button
      v-if="removable"
      @click.stop.prevent="emit('remove', { type, id: item.id })"
      class="absolute top-2 right-2 rounded-xl px-3 py-2 bg-black/60 border border-white/10 text-white hover:bg-black/80"
      title="Remove"
    >
      ✕
    </button>
  </div>
</template>
