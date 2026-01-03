<script setup>
import { computed, ref } from "vue";
import { useCommunity } from "../composables/useCommunity";

const props = defineProps({
  type: { type: String, required: true }, // "movie" | "tv"
  item: { type: Object, required: true }, // must include id + title/name + poster_path
});

const c = useCommunity();

const newListName = ref("");
const commentText = ref("");

const lists = computed(() => c.allLists.value);
const currentRating = computed(() => c.getRating(props.type, props.item.id));
const comments = computed(() => c.getComments(props.type, props.item.id));

function createAndAdd() {
  const created = c.createList(newListName.value);
  if (created) {
    c.addToList(created.id, props.type, props.item);
    newListName.value = "";
  }
}

function addComment() {
  c.addComment(props.type, props.item.id, commentText.value);
  commentText.value = "";
}
</script>

<template>
  <section class="rounded-3xl border border-white/10 bg-slate-900/30 p-5 space-y-6">
    <h2 class="text-xl font-bold text-slate-100">Community</h2>

    <!-- Rating -->
    <div>
      <div class="flex items-center justify-between">
        <div class="text-slate-200 font-semibold">Your Rating</div>
        <button
          v-if="currentRating"
          @click="c.clearRating(type, item.id)"
          class="text-sm text-slate-300 underline hover:opacity-90"
        >
          Clear
        </button>
      </div>

      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="n in 10"
          :key="n"
          @click="c.setRating(type, item.id, n)"
          class="rounded-xl px-3 py-2 border border-white/10 text-sm hover:bg-white/5"
          :class="currentRating === n ? 'bg-white text-slate-950 font-semibold' : 'text-slate-200'"
        >
          {{ n }}
        </button>
      </div>

      <div class="mt-2 text-slate-400 text-sm">
        {{ currentRating ? `You rated this ${currentRating}/10` : "No rating yet" }}
      </div>
    </div>

    <!-- Lists -->
    <div>
      <div class="text-slate-200 font-semibold">Add to your Lists</div>

      <div v-if="lists.length" class="mt-3 grid sm:grid-cols-2 gap-2">
        <button
          v-for="l in lists"
          :key="l.id"
          @click="c.toggleInList(l.id, type, item)"
          class="rounded-xl px-4 py-2 border border-white/10 hover:bg-white/5 text-left"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="text-slate-100 font-semibold line-clamp-1">{{ l.name }}</div>
            <span class="text-xs text-slate-300">
              {{ c.listHas(l.id, type, item.id) ? "✓ Added" : "+ Add" }}
            </span>
          </div>
          <div class="text-xs text-slate-400 mt-1">
            {{ l.items.length }} items
          </div>
        </button>
      </div>

      <div v-else class="mt-3 text-slate-400 text-sm">
        No lists yet. Create one below.
      </div>

      <div class="mt-4 flex gap-2">
        <input
          v-model="newListName"
          placeholder="New list name (e.g., Watchlist)"
          class="flex-1 rounded-xl bg-slate-950/60 border border-white/10 px-3 py-2 text-slate-100"
        />
        <button
          @click="createAndAdd"
          class="rounded-xl px-4 py-2 bg-white text-slate-950 font-semibold hover:opacity-90"
        >
          Create
        </button>
      </div>
    </div>

    <!-- Comments -->
    <div>
      <div class="text-slate-200 font-semibold">Comments</div>

      <div class="mt-3 flex gap-2">
        <textarea
          v-model="commentText"
          rows="2"
          placeholder="Write a comment…"
          class="flex-1 rounded-xl bg-slate-950/60 border border-white/10 px-3 py-2 text-slate-100"
        />
        <button
          @click="addComment"
          class="rounded-xl px-4 py-2 border border-white/10 text-slate-200 hover:bg-white/5"
        >
          Post
        </button>
      </div>

      <div v-if="comments.length" class="mt-4 space-y-2">
        <div
          v-for="cm in comments"
          :key="cm.id"
          class="rounded-2xl border border-white/10 bg-slate-950/40 p-3"
        >
          <div class="text-slate-200 whitespace-pre-line">{{ cm.text }}</div>
          <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{{ (cm.createdAt || '').slice(0, 10) }}</span>
            <button @click="c.deleteComment(type, item.id, cm.id)" class="underline hover:opacity-90">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-else class="mt-3 text-slate-400 text-sm">No comments yet.</div>
    </div>
  </section>
</template>
