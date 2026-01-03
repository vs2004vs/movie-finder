<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  getTrendingMovies,
  getPopularMovies,
  multiSearch,
  posterUrl,
  profileUrl,
} from "../api/tmdb";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const router = useRouter();

const mode = ref("assistant"); // "assistant" | "support"
const isOpen = ref(false);
const input = ref("");
const loading = ref(false);

const messages = ref([
  {
    role: "bot",
    mode: "assistant",
    type: "text",
    text:
      "Hi! I’m MovieFinder Assistant.\nType 'help' to see commands.\nTry: trending, popular, search game of thrones, open tv 1399",
    ts: Date.now(),
  },
]);

const SUPPORT = {
  title: "MovieFinder Support",
  email: "support@yourdomain.com",
  whatsappLink: "",
};

const listEl = ref(null);

const trendingPage = ref(1);
const popularPage = ref(1);

const filteredMessages = computed(() =>
  messages.value.filter((x) => x.mode === mode.value)
);

function open() {
  isOpen.value = true;
  scrollToBottom();
}
function close() {
  isOpen.value = false;
}
function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) scrollToBottom();
}

function scrollToBottom() {
  nextTick(() => {
    const el = listEl.value;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });
}

function pushUser(text) {
  messages.value.push({
    role: "user",
    mode: mode.value,
    type: "text",
    text,
    ts: Date.now(),
  });
  scrollToBottom();
}

function pushBotText(text, botMode = mode.value) {
  messages.value.push({
    role: "bot",
    mode: botMode,
    type: "text",
    text,
    ts: Date.now(),
  });
  scrollToBottom();
}

function pushBotCards(title, items, botMode = mode.value) {
  messages.value.push({
    role: "bot",
    mode: botMode,
    type: "cards",
    title,
    items,
    ts: Date.now(),
  });
  scrollToBottom();
}

function normalizeSpaces(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function parseCommand(raw) {
  const text = normalizeSpaces(raw);
  const lower = text.toLowerCase();

  if (lower === "help" || lower === "/help") return { cmd: "help" };

  if (lower === "trending" || lower === "/trending") return { cmd: "trending" };
  if (lower === "more trending") return { cmd: "more_trending" };

  if (lower === "popular" || lower === "/popular") return { cmd: "popular" };
  if (lower === "more popular") return { cmd: "more_popular" };

  if (lower.startsWith("search ")) return { cmd: "search", q: text.slice(7).trim() };
  if (lower.startsWith("/search ")) return { cmd: "search", q: text.slice(8).trim() };

  if (lower.startsWith("open ")) {
    const parts = text.split(" ");
    if (parts.length >= 3) return { cmd: "open", type: parts[1].toLowerCase(), id: parts[2] };
  }
  if (lower.startsWith("/open ")) {
    const parts = text.split(" ");
    if (parts.length >= 3) return { cmd: "open", type: parts[1].toLowerCase(), id: parts[2] };
  }

  if (lower === "support" || lower === "/support") return { cmd: "switch_support" };
  if (lower === "assistant" || lower === "/assistant") return { cmd: "switch_assistant" };

  return { cmd: "unknown", raw: text };
}

function toCardItem(r) {
  const media_type = r.media_type;
  const id = r.id;

  if (media_type === "person") {
    return {
      media_type,
      id,
      title: r.name,
      subtitle: "Person",
      img: r.profile_path ? profileUrl(r.profile_path, "w185") : "",
    };
  }

  const title = media_type === "movie" ? r.title : r.name;
  const date = media_type === "movie" ? r.release_date : r.first_air_date;
  const year = (date || "").slice(0, 4) || (media_type === "tv" ? "TV" : "Movie");

  return {
    media_type,
    id,
    title,
    subtitle: year,
    img: r.poster_path ? posterUrl(r.poster_path, "w185") : "",
  };
}

function goTo(media_type, id) {
  if (!id) return;
  if (media_type === "movie") router.push(`/movie/${id}`);
  else if (media_type === "tv") router.push(`/tv/${id}`);
  else if (media_type === "person") router.push(`/person/${id}`);
  close();
}

async function handleAssistantCommand(raw) {
  const parsed = parseCommand(raw);

  if (!apiKey) {
    pushBotText("Missing TMDB API key. Add VITE_TMDB_API_KEY in your .env file.");
    return;
  }

  if (parsed.cmd === "help") {
    pushBotText(
      [
        "Commands you can use:",
        "",
        "• trending  → show trending movies",
        "• popular   → show popular movies",
        "• search <title> → multi-search TMDB (top 10)",
        "• open movie 550 / open tv 1399 / open person 287 → open page",
        "",
        "Extras:",
        "• more trending / more popular → load next page",
        "• support / assistant → switch modes",
      ].join("\n")
    );
    return;
  }

  if (parsed.cmd === "switch_support") {
    mode.value = "support";
    pushBotText("Switched to Support chat. Tell me what’s wrong and I’ll guide you.", "support");
    return;
  }

  if (parsed.cmd === "trending" || parsed.cmd === "more_trending") {
    if (parsed.cmd === "trending") trendingPage.value = 1;
    loading.value = true;
    try {
      const data = await getTrendingMovies({ apiKey, timeWindow: "day", page: trendingPage.value });
      const items = (data.results || [])
        .slice(0, 10)
        .map((r) => ({ ...r, media_type: "movie" }))
        .map(toCardItem);

      pushBotCards(
        trendingPage.value === 1 ? "Trending today" : `Trending (page ${trendingPage.value})`,
        items
      );
      trendingPage.value += 1;
    } catch (e) {
      pushBotText(e?.message || "Failed to load trending.");
    } finally {
      loading.value = false;
    }
    return;
  }

  if (parsed.cmd === "popular" || parsed.cmd === "more_popular") {
    if (parsed.cmd === "popular") popularPage.value = 1;
    loading.value = true;
    try {
      const data = await getPopularMovies({ apiKey, page: popularPage.value });
      const items = (data.results || [])
        .slice(0, 10)
        .map((r) => ({ ...r, media_type: "movie" }))
        .map(toCardItem);

      pushBotCards(
        popularPage.value === 1 ? "Popular movies" : `Popular (page ${popularPage.value})`,
        items
      );
      popularPage.value += 1;
    } catch (e) {
      pushBotText(e?.message || "Failed to load popular.");
    } finally {
      loading.value = false;
    }
    return;
  }

  if (parsed.cmd === "search") {
    if (!parsed.q) {
      pushBotText("Usage: search <title>");
      return;
    }
    loading.value = true;
    try {
      const data = await multiSearch({ apiKey, query: parsed.q, page: 1 });
      const filtered = (data.results || []).filter((r) =>
        ["movie", "tv", "person"].includes(r.media_type)
      );
      const items = filtered.slice(0, 10).map(toCardItem);

      if (!items.length) pushBotText(`No results for "${parsed.q}". Try another title.`);
      else pushBotCards(`Top results for "${parsed.q}"`, items);
    } catch (e) {
      pushBotText(e?.message || "Search failed.");
    } finally {
      loading.value = false;
    }
    return;
  }

  if (parsed.cmd === "open") {
    const t = parsed.type;
    const idNum = parsed.id;
    if (!["movie", "tv", "person"].includes(t)) {
      pushBotText("Usage: open movie 550 | open tv 1399 | open person 287");
      return;
    }
    goTo(t, idNum);
    return;
  }

  pushBotText("I didn’t understand that.\nType 'help' to see commands.\nExample: search interstellar");
}

function handleSupportMessage(raw) {
  const text = normalizeSpaces(raw);
  if (!text) return;

  const parsed = parseCommand(text);

  if (parsed.cmd === "switch_assistant") {
    mode.value = "assistant";
    pushBotText("Switched to Movie Assistant. Type 'help' for commands.", "assistant");
    return;
  }

  pushBotText(
    [
      "Thanks — I got your message.",
      "Tell me:",
      "1) Which page? (Home / Search / MovieView / TvView / PersonView)",
      "2) What you expected to happen",
      "3) What you see instead (error text if any)",
      "",
      "Quick actions:",
      SUPPORT.email ? `• Email support: ${SUPPORT.email}` : "• Email support: (configure email in ChatWidget.vue)",
      SUPPORT.whatsappLink ? "• WhatsApp support: available" : "• WhatsApp support: (configure whatsappLink in ChatWidget.vue)",
      "• Tip: copy the console error and paste it here.",
    ].join("\n"),
    "support"
  );
}

function submit() {
  const text = input.value;
  if (!normalizeSpaces(text) || loading.value) return;

  input.value = "";
  pushUser(text);

  if (mode.value === "assistant") handleAssistantCommand(text);
  else handleSupportMessage(text);
}

function copyTranscript() {
  const lines = messages.value
    .filter((m) => m.mode === mode.value)
    .map((m) => `${m.role.toUpperCase()}: ${m.type === "text" ? m.text : `[${m.title}]`}`)
    .join("\n\n");
  navigator.clipboard?.writeText(lines);
  pushBotText("Transcript copied to clipboard.", mode.value);
}

const supportMailto = computed(() => {
  if (!SUPPORT.email) return "";
  const subject = encodeURIComponent("MovieFinder Support Request");
  const body = encodeURIComponent("Describe your issue and include screenshots or console errors if possible.\n\n");
  return `mailto:${SUPPORT.email}?subject=${subject}&body=${body}`;
});

onMounted(() => {});
</script>

<template>

  <!-- Floating Button -->
  <button
    @click="toggle"
    class="fixed bottom-4 right-4 z-50 rounded-full border border-white/10 bg-slate-900/90 hover:bg-slate-900 text-slate-100 shadow-lg px-4 py-3 flex items-center gap-2"
  >
    <span class="text-sm font-semibold">Chat</span>
    <span class="text-xs text-slate-300">{{ mode === "assistant" ? "Movie" : "Support" }}</span>
  </button>

  <!-- Panel -->
  <div
    v-if="isOpen"
    class="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-4 z-50 sm:w-[420px] sm:max-w-[calc(100vw-2rem)]"
  >
    <div
      class="h-full sm:h-[640px] bg-slate-950/95 border border-white/10 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="p-4 border-b border-white/10 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="text-slate-100 font-extrabold truncate">
            {{ mode === "assistant" ? "Movie Assistant" : SUPPORT.title }}
          </div>
          <div class="text-xs text-slate-400">
            {{
              mode === "assistant"
                ? "Phase 1: commands + TMDB results • Phase 2: AI later"
                : "Phase 1: guided support • Phase 2: AI support later"
            }}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="mode = 'assistant'"
            class="text-xs rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5"
            :class="mode === 'assistant' ? 'bg-white text-slate-950 font-semibold' : 'text-slate-200'"
          >
            Movie
          </button>

          <button
            @click="mode = 'support'"
            class="text-xs rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5"
            :class="mode === 'support' ? 'bg-white text-slate-950 font-semibold' : 'text-slate-200'"
          >
            Support
          </button>

          <button @click="close" class="text-slate-300 hover:text-white text-sm px-2">✕</button>
        </div>
      </div>

      <!-- Messages (ONE v-for keeps correct order) -->
      <div ref="listEl" class="flex-1 overflow-auto p-4 space-y-3">
        <template v-for="m in filteredMessages" :key="`${m.ts}-${m.role}-${m.title || ''}`">
          <!-- Text -->
          <div
            v-if="m.type === 'text'"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line"
              :class="m.role === 'user'
                ? 'bg-white text-slate-950'
                : 'bg-slate-900/60 border border-white/10 text-slate-100'"
            >
              {{ m.text }}
            </div>
          </div>

          <!-- Cards -->
          <div v-else-if="m.type === 'cards'" class="flex justify-start">
            <div class="w-full rounded-2xl border border-white/10 bg-slate-900/40 p-3">
              <div class="text-slate-100 font-semibold text-sm">{{ m.title }}</div>

              <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  v-for="it in m.items"
                  :key="`${it.media_type}-${it.id}`"
                  @click="goTo(it.media_type, it.id)"
                  class="text-left rounded-2xl border border-white/10 bg-slate-950/40 hover:bg-slate-950/60 transition p-3 flex gap-3"
                >
                  <div class="h-14 w-10 rounded-xl overflow-hidden bg-slate-800/40 flex-shrink-0">
                    <img v-if="it.img" :src="it.img" class="h-full w-full object-cover" />
                  </div>
                  <div class="min-w-0">
                    <div class="text-slate-100 font-semibold truncate">{{ it.title }}</div>
                    <div class="text-xs text-slate-400">{{ it.subtitle }} • {{ it.media_type }}</div>
                  </div>
                </button>
              </div>

              <div v-if="mode === 'assistant'" class="mt-3 flex gap-2 flex-wrap">
                <button
                  v-if="(m.title || '').toLowerCase().includes('trending')"
                  @click="handleAssistantCommand('more trending')"
                  class="text-xs rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5 text-slate-200"
                >
                  More trending
                </button>

                <button
                  v-if="(m.title || '').toLowerCase().includes('popular')"
                  @click="handleAssistantCommand('more popular')"
                  class="text-xs rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5 text-slate-200"
                >
                  More popular
                </button>
              </div>
            </div>
          </div>
        </template>

        <div v-if="loading" class="text-slate-400 text-sm">Loading…</div>
      </div>

      <!-- Support quick actions -->
      <div v-if="mode === 'support'" class="px-4 pb-3 flex items-center gap-2 flex-wrap">
        <button
          @click="copyTranscript"
          class="text-xs rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5 text-slate-200"
        >
          Copy transcript
        </button>

        <a
          v-if="supportMailto"
          :href="supportMailto"
          class="text-xs rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5 text-slate-200"
        >
          Email support
        </a>

        <a
          v-if="SUPPORT.whatsappLink"
          :href="SUPPORT.whatsappLink"
          target="_blank"
          rel="noreferrer"
          class="text-xs rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5 text-slate-200"
        >
          WhatsApp
        </a>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-white/10">
        <form @submit.prevent="submit" class="flex gap-2">
          <input
            v-model="input"
            :disabled="loading"
            class="flex-1 rounded-xl bg-slate-950/60 border border-white/10 px-3 py-2 text-slate-100 placeholder:text-slate-500"
            :placeholder="mode === 'assistant'
              ? 'Type: help, trending, popular, search interstellar…'
              : 'Describe your issue…'"
          />
          <button
            type="submit"
            :disabled="loading"
            class="rounded-xl px-4 py-2 bg-white text-slate-950 font-semibold hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
