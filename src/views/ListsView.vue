<script setup>
import { computed, ref } from "vue";
import { useCommunity } from "../composables/useCommunity";
import { posterUrl } from "../api/tmdb";

const c = useCommunity();
const lists = computed(() => c.allLists.value);

const selectedId = ref(lists.value[0]?.id || "");
const selected = computed(() => lists.value.find((l) => l.id === selectedId.value) || null);

const newName = ref("");

function pickFirstIfMissing() {
  if (!selectedId.value && lists.value.length) selectedId.value = lists.value[0].id;
}
pickFirstIfMissing();

function createList() {
  const created = c.createList(newName.value);
  if (created) {
    selectedId.value = created.id;
    newName.value = "";
  }
}

function toRoute(item) {
  return item.type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-end justify-between gap-4 flex-wrap">
      <h1 class="text-3xl font-extrabold text-slate-100">My Lists</h1>

      <div class="flex gap-2">
        <input
          v-model="newName"
          placeholder="New list name…"
          class="rounded-xl bg-slate-950/60 border border-white/10 px-3 py-2 text-slate-100"
        />
        <button
          @click="createList"
          class="rounded-xl px-4 py-2 bg-white text-slate-950 font-semibold hover:opacity-90"
        >
          Create
        </button>
      </div>
    </div>

    <div class="mt-6 grid md:grid-cols-[280px_1fr] gap-6">
      <!-- Lists sidebar -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/30 p-4">
        <div class="text-slate-200 font-semibold mb-3">Your Lists</div>

        <div v-if="lists.length" class="space-y-2">
          <button
            v-for="l in lists"
            :key="l.id"
            @click="selectedId = l.id"
            class="w-full text-left rounded-2xl border border-white/10 px-4 py-3 hover:bg-white/5"
            :class="selectedId === l.id ? 'bg-white/10' : ''"
          >
            <div class="flex items-center justify-between">
              <div class="text-slate-100 font-semibold line-clamp-1">{{ l.name }}</div>
              <div class="text-xs text-slate-400">{{ l.items.length }}</div>
            </div>

            <div class="mt-1 flex gap-2">
              <button
                class="text-xs text-slate-300 underline"
                @click.stop="c.deleteList(l.id); if (selectedId === l.id) selectedId = lists[0]?.id || ''"
              >
                Delete
              </button>
            </div>
          </button>
        </div>

        <div v-else class="text-slate-400 text-sm">No lists yet.</div>
      </div>

      <!-- Selected list -->
      <div v-if="selected" class="space-y-4">
        <div class="rounded-3xl border border-white/10 bg-slate-900/30 p-5">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div class="text-slate-100 text-2xl font-extrabold">{{ selected.name }}</div>
              <div class="text-slate-400 text-sm">{{ selected.items.length }} items</div>
            </div>
          </div>
        </div>

        <div v-if="selected.items.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <RouterLink
            v-for="it in selected.items"
            :key="`${it.type}:${it.id}`"
            :to="toRoute(it)"
            class="group block text-left rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition"
          >
            <div class="aspect-[2/3] bg-slate-800/40 overflow-hidden">
              <img
                v-if="it.poster_path"
                :src="posterUrl(it.poster_path, 'w500')"
                :alt="it.label"
                class="h-full w-full object-cover group-hover:scale-[1.02] transition"
                loading="lazy"
              />
              <div v-else class="h-full w-full flex items-center justify-center text-slate-400">No Poster</div>
            </div>

            <div class="p-4">
              <div class="font-semibold text-slate-100 line-clamp-1">{{ it.label }}</div>
              <div class="text-sm text-slate-400 mt-1">
                {{ it.year || "—" }} • {{ it.type.toUpperCase() }}
              </div>

              <button
                class="mt-3 text-sm text-slate-200 underline"
                @click.prevent="c.removeFromList(selected.id, it.type, it.id)"
              >
                Remove
              </button>
            </div>
          </RouterLink>
        </div>

        <div v-else class="text-slate-400">This list is empty.</div>
      </div>

      <div v-else class="text-slate-400">Select or create a list.</div>
    </div>
  </div>
</template>
