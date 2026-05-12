<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
import SearchBar from './SearchBar.vue'

const emit = defineEmits<{ 'open-coin': [id: string] }>()
</script>

<template>
  <header
    class="border-md-outline-variant/20 bg-md-surface/90 sticky top-0 z-50 border-b backdrop-blur-xl"
  >
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
      <!-- Logo -->
      <div class="flex shrink-0 items-center">
        <span class="text-md-on-surface font-semibold tracking-tight">CryptoTrack</span>
      </div>

      <SearchBar @open-coin="(id) => emit('open-coin', id)" />

      <div class="ml-auto flex items-center">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
