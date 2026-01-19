<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useAuthStore } from "../src/stores/authStore";
const auth = useAuthStore();

const year = computed(() => new Date().getFullYear());

// Back-to-top visibility (shows after scrolling a bit)
const showTop = ref(false);

function onScroll() {
  showTop.value = window.scrollY > 600;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Modal system
const modalOpen = ref(false);
const modalKey = ref(""); // "privacy" | "terms" | "cookies"

const modalTitle = computed(() => {
  if (modalKey.value === "privacy") return "Privacy Policy";
  if (modalKey.value === "terms") return "Terms of Service";
  if (modalKey.value === "cookies") return "Cookies Policy";
  return "";
});

const modalBody = computed(() => {
  if (modalKey.value === "privacy") {
    return [
      "This is a placeholder Privacy Policy for MovieFinder.",
      "",
      "• We do not collect personal data by default.",
      "• Favorites and lists are stored locally in your browser (localStorage).",
      "• TMDB content is fetched using your API key in the app.",
      "",
      "You can replace this content later with your official policy."
    ].join("\n");
  }

  if (modalKey.value === "terms") {
    return [
      "This is a placeholder Terms of Service for MovieFinder.",
      "",
      "• MovieFinder is a demo/portfolio app.",
      "• Content is provided by TMDB and belongs to its respective owners.",
      "• Do not use the app for unlawful purposes.",
      "",
      "You can replace this content later with your official terms."
    ].join("\n");
  }

  if (modalKey.value === "cookies") {
    return [
      "This is a placeholder Cookies Policy for MovieFinder.",
      "",
      "• The app does not use tracking cookies by default.",
      "• LocalStorage may be used to store favorites/lists/settings.",
      "",
      "You can replace this content later with your official cookies policy."
    ].join("\n");
  }

  return "";
});

function openModal(key) {
  modalKey.value = key;
  modalOpen.value = true;
  // prevent background scroll
  document.documentElement.style.overflow = "hidden";
}

function closeModal() {
  modalOpen.value = false;
  modalKey.value = "";
  document.documentElement.style.overflow = "";
}

function onKeyDown(e) {
  if (e.key === "Escape" && modalOpen.value) closeModal();
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", onKeyDown);
  onScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("keydown", onKeyDown);
  document.documentElement.style.overflow = "";
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <header class="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <RouterLink to="/" class="font-extrabold tracking-tight text-lg sm:text-xl">
            moviefinder
          </RouterLink>

          <nav class="flex flex-wrap gap-2">
            <RouterLink to="/" class="rounded-xl px-3 py-2 text-sm hover:bg-white/5">Home</RouterLink>
            <RouterLink to="/search" class="rounded-xl px-3 py-2 text-sm hover:bg-white/5">Search</RouterLink>
            <RouterLink to="/favorites" class="rounded-xl px-3 py-2 text-sm hover:bg-white/5">Favorites</RouterLink>
             <RouterLink v-if="!auth.isAuthed" to="/login" class="rounded-xl px-3 py-2 text-sm hover:bg-white/5">
    Login
  </RouterLink>

   <button
    v-else
    @click="auth.logout()"
    class="rounded-xl px-3 py-2 text-sm hover:bg-white/5 text-left"
    type="button"
  >
    Logout
  </button>
                   </nav>
        </div>
      </div>
    </header>

    <!-- Main content grows, footer stays at bottom -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/10 bg-slate-950/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="space-y-3">
            <div class="text-lg font-extrabold tracking-tight">MovieFinder</div>
            <p class="text-sm text-slate-400 leading-relaxed">
              Discover movies, TV shows, and people. Save favorites, build lists, and explore what’s trending.
            </p>

            <div class="text-xs text-slate-500">
              Data provided by TMDB.
            </div>

            <!-- Back to top (always visible here) -->
            <button
              @click="scrollToTop"
              class="mt-3 inline-flex items-center gap-2 text-xs rounded-xl px-3 py-2 border border-white/10 hover:bg-white/5 text-slate-200"
              type="button"
            >
              ↑ Back to top
            </button>
          </div>

          <!-- Explore -->
          <div>
            <div class="text-sm font-semibold text-slate-200">Explore</div>
            <ul class="mt-3 space-y-2 text-sm">
              <li><RouterLink to="/" class="text-slate-400 hover:text-slate-200">Trending</RouterLink></li>
              <li><RouterLink to="/search" class="text-slate-400 hover:text-slate-200">Search</RouterLink></li>
              <li><RouterLink to="/favorites" class="text-slate-400 hover:text-slate-200">Favorites</RouterLink></li>
                         </ul>
          </div>

          <!-- Project -->
          <div>
            <div class="text-sm font-semibold text-slate-200">Project</div>
            <ul class="mt-3 space-y-2 text-sm">
              <li><a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" class="text-slate-400 hover:text-slate-200">TMDB</a></li>
              <li><a href="https://developer.themoviedb.org/" target="_blank" rel="noreferrer" class="text-slate-400 hover:text-slate-200">API Docs</a></li>
              <li><span class="text-slate-500">Changelog (soon)</span></li>
              <li><span class="text-slate-500">Roadmap (soon)</span></li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <div class="text-sm font-semibold text-slate-200">Support</div>
            <ul class="mt-3 space-y-2 text-sm">
              <li><span class="text-slate-500">Report a bug (soon)</span></li>
              <li><span class="text-slate-500">Request a feature (soon)</span></li>
              <li><a href="#" class="text-slate-400 hover:text-slate-200">Email Support</a></li>
            </ul>

            <div class="mt-4 flex flex-wrap gap-2">
              <span class="text-xs px-3 py-1 rounded-full border border-white/10 bg-slate-900/40 text-slate-300"></span>
              <span class="text-xs px-3 py-1 rounded-full border border-white/10 bg-slate-900/40 text-slate-300"></span>
              <span class="text-xs px-3 py-1 rounded-full border border-white/10 bg-slate-900/40 text-slate-300"></span>
            </div>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div class="text-xs text-slate-500">
            © {{ year }} MovieFinder. All rights reserved.           <br>  <div class="mt-6 text-center text-xs text-slate-500">
  POWER BY ORANGE LIBERIA
</div>

          </div>

          <!-- Modal links (working) -->
          <div class="flex flex-wrap gap-3 text-xs">
            <button @click="openModal('privacy')" class="text-slate-500 hover:text-slate-300" type="button">Privacy</button>
            <button @click="openModal('terms')" class="text-slate-500 hover:text-slate-300" type="button">Terms</button>
            <button @click="openModal('cookies')" class="text-slate-500 hover:text-slate-300" type="button">Cookies</button>
          </div>
        </div>
      </div>
    </footer>

    <!-- Floating back-to-top button (shows after scroll) -->
    <button
      v-if="showTop"
      @click="scrollToTop"
      type="button"
      class="fixed bottom-4 left-4 z-50 rounded-full border border-white/10 bg-slate-900/90 hover:bg-slate-900 text-slate-100 shadow-lg px-4 py-3 text-sm"
      aria-label="Back to top"
    >
      ↑ Top
    </button>

    <!-- Modal -->
    <teleport to="body">
      <div v-if="modalOpen" class="fixed inset-0 z-[9999]">
        <div class="absolute inset-0 bg-black/70" @click="closeModal"></div>

        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden">
            <div class="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-slate-100 font-extrabold truncate">{{ modalTitle }}</div>
                <div class="text-xs text-slate-400">Press Esc to close</div>
              </div>
              <button
                @click="closeModal"
                class="text-slate-300 hover:text-white text-sm px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5"
                type="button"
              >
                ✕
              </button>
            </div>

            <div class="p-4 sm:p-6">
              <pre class="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">{{ modalBody }}</pre>
            </div>

            <div class="p-4 sm:p-5 border-t border-white/10 flex justify-end">
              <button
                @click="closeModal"
                class="rounded-xl px-4 py-2 bg-white text-slate-950 font-semibold hover:opacity-90"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
