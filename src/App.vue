<script setup>
import ChatWidget from "./components/ChatWidget.vue";
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header class="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <RouterLink to="/" class="font-extrabold tracking-tight text-lg sm:text-xl">
            MovieFinder
          </RouterLink>

          <nav class="flex flex-wrap gap-2">
            <RouterLink to="/" class="rounded-xl px-3 py-2 text-sm hover:bg-white/5">Home</RouterLink>
            <RouterLink to="/search" class="rounded-xl px-3 py-2 text-sm hover:bg-white/5">Search</RouterLink>
            <RouterLink to="/favorites" class="rounded-xl px-3 py-2 text-sm hover:bg-white/5">Favorites</RouterLink>
            <RouterLink to="/lists" class="rounded-xl px-3 py-2 text-sm hover:bg-white/5">Lists</RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <!--  Chatbot floating widget -->
    <ChatWidget />
  </div>
</template>
