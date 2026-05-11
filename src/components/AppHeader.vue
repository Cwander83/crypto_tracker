<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
import SearchBar from './SearchBar.vue'

const emit = defineEmits<{ 'open-coin': [id: string] }>()
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-white/5 bg-[#06080f]/90 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
      <!-- Logo -->
      <div class="flex items-center gap-2 shrink-0">
        <div class="w-7 h-7 bg-[#00d4ff] flex items-center justify-center text-[#06080f] font-bold text-sm">C</div>
        <span class="font-semibold text-white tracking-tight">CryptoTrack</span>
      </div>

      <SearchBar @open-coin="(id) => emit('open-coin', id)" />

      <div class="flex items-center gap-3 ml-auto">
        <!-- Live indicator -->
        <div class="flex items-center gap-1.5 text-xs text-white/40">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span>Live</span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
