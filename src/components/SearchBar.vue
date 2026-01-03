<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { multiSearch, posterUrl, profileUrl } from "../api/tmdb";

const router = useRouter();
const apiKey = import.meta.env.VITE_TMDB_API_KEY;

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Search movies, TV, people..." },
});
const emit = defineEmits(["update:modelValue", "submit"]);

const q = ref(props.modelValue);
const open = ref(false);
const loading = ref(false);
const items = ref([]);
const err = ref("");

watch(
  () => props.modelValue,
  (v) => (q.value = v)
);

let timer = null;

function close() {
  open.value = false;
}

function onDocClick(e) {
  // close dropdown if click outside the component
  const root = document.getElementById("mf-searchbar-root");
  if (root && !root.contains(e.target)) close();
}
function onKeydown(e) {
  if (e.key === "Escape") close();
}

document.addEventListener("click", onDocClick);
document.addEventListener("keydown", onKeydown);
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onKeydown);
  if (timer) clearTimeout(timer);
});

watch(q, (val) => {
  emit("update:modelValue", val);
  err.value = "";

  const text = (val || "").trim();

  if (timer) clearTimeout(timer);

  // If empty, close dropdown
  if (!text) {
    items.value = [];
    open.value = false;
    return;
  }

  // Debounce
  timer = setTimeout(async () => {
    if (!apiKey) {
      err.value = "Missing TMDB API key.";
      items.value = [];
      open.value = true;
      return;
    }

    loading.value = true;
    try {
      const data = await multiSearch({ apiKey, query: text, page: 1 });
      items.value = (data.results || [])
        .filter((x) => ["movie", "tv", "person"].includes(x.media_type))
        .slice(0, 8);

      open.value = true;
    } catch (e) {
      err.value = e?.message || "Search failed";
      items.value = [];
      open.value = true;
    } finally {
      loading.value = false;
    }
  }, 350);
});

const hasResults = computed(() => items.value.length > 0);

function titleOf(x) {
  if (x.media_type === "movie") return x.title || "Untitled";
  return x.name || "Untitled";
}
function subOf(x) {
  if (x.media_type === "person") return "Person";
  const d = x.media_type === "movie" ? x.release_date : x.first_air_date;
  return (d || "").slice(0, 4) || (x.media_type === "tv" ? "TV" : "Movie");
}
function imgOf(x) {
  if (x.media_type === "person") return profileUrl(x.profile_path, "w185");
  return posterUrl(x.poster_path, "w185");
}

function goPick(x) {
  close();
  if (x.media_type === "movie") router.push(`/movie/${x.id}`);
  else if (x.media_type === "tv") router.push(`/tv/${x.id}`);
  else if (x.media_type === "person") router.push(`/person/${x.id}`);
}

function onSubmit() {
  close();
  emit("submit");
}
</script>

<template>
  <div id="mf-searchbar-root" class="relative">
    <div class="flex gap-2">
      <input
        v-model="q"
        @keydown.enter="onSubmit"
        @focus="q.trim() && (open = true)"
        :placeholder="placeholder"
        class="w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:border-white/20"
      />
      <button
        @click="onSubmit"
        class="rounded-xl px-4 py-3 bg-white text-slate-900 font-semibold hover:opacity-90"
      >
        Search
      </button>
    </div>

    <div
      v-if="open"
      class="absolute z-50 mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 shadow-xl overflow-hidden"
    >
      <div class="px-3 py-2 text-sm text-slate-400 flex items-center justify-between">
        <span v-if="loading">Searching…</span>
        <span v-else-if="err">{{ err }}</span>
        <span v-else-if="!hasResults">No results</span>
        <button class="text-slate-300 hover:text-white" @click="close">✕</button>
      </div>

      <button
        v-for="x in items"
        :key="`${x.media_type}-${x.id}`"
        @click="goPick(x)"
        class="w-full text-left px-3 py-3 hover:bg-white/5 flex gap-3 items-center"
      >
        <div class="h-12 w-10 rounded-lg overflow-hidden bg-slate-800/40 flex-shrink-0">
          <img v-if="imgOf(x)" :src="imgOf(x)" class="h-full w-full object-cover" />
        </div>

        <div class="min-w-0">
          <div class="text-slate-100 font-semibold truncate">
            {{ titleOf(x) }}
            <span class="text-slate-400 font-normal">• {{ x.media_type }}</span>
          </div>
          <div class="text-slate-400 text-sm truncate">{{ subOf(x) }}</div>
        </div>
      </button>

      <div class="p-3 border-t border-white/10 text-sm text-slate-400">
        Press <span class="text-slate-200">Enter</span> for full results.
      </div>
    </div>
  </div>
</template>
