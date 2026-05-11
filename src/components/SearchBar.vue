<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useStorage } from '../composables/useStorage'

const emit = defineEmits<{ 'open-coin': [id: string] }>()

interface SearchResult {
  id: string
  name: string
  symbol: string
  thumb: string
  market_cap_rank: number | null
}

const dropdownRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const query = ref('')
const results = ref<SearchResult[]>([])
const isOpen = ref(false)
const loading = ref(false)

const recentSearches = useStorage<string[]>('ct_recent_searches', [])

let debounceTimer: ReturnType<typeof setTimeout>

function openDropdown() {
  if (isOpen.value) return
  isOpen.value = true
  gsap.fromTo(dropdownRef.value, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' })
}

function closeDropdown() {
  gsap.to(dropdownRef.value, { autoAlpha: 0, y: -8, duration: 0.15, onComplete: () => { isOpen.value = false } })
}

function onInput() {
  clearTimeout(debounceTimer)
  if (!query.value.trim()) { results.value = []; return }
  debounceTimer = setTimeout(search, 300)
}

async function search() {
  loading.value = true
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query.value)}`)
    const data = await res.json()
    results.value = (data.coins ?? []).slice(0, 6)
  } finally {
    loading.value = false
  }
}

function selectCoin(id: string) {
  recentSearches.value = [id, ...recentSearches.value.filter(r => r !== id)].slice(0, 10)
  query.value = ''
  results.value = []
  closeDropdown()
  emit('open-coin', id)
}

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="containerRef" class="relative flex-1 max-w-lg">
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        @focus="openDropdown"
        @input="onInput"
        type="text"
        placeholder="Search coins…"
        class="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#00d4ff]/60 transition-colors"
      />
    </div>

    <!-- Dropdown -->
    <div
      v-show="isOpen"
      ref="dropdownRef"
      class="absolute top-full left-0 right-0 mt-2 bg-[#0b0f1a] border border-white/10 shadow-2xl z-50 overflow-hidden"
      style="visibility: hidden"
    >
      <!-- Search results -->
      <template v-if="query.trim()">
        <div v-if="loading" class="px-4 py-3 text-xs text-white/30">Searching…</div>
        <template v-else>
          <button
            v-for="coin in results"
            :key="coin.id"
            @click="selectCoin(coin.id)"
            class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#00d4ff]/5 transition-colors text-left"
          >
            <img :src="coin.thumb" :alt="coin.name" class="w-7 h-7 rounded-full" />
            <div>
              <div class="text-sm font-medium">{{ coin.name }}</div>
              <div class="text-xs text-white/40 font-mono">{{ coin.symbol.toUpperCase() }}</div>
            </div>
            <div v-if="coin.market_cap_rank" class="ml-auto text-xs text-white/30 font-mono">#{{ coin.market_cap_rank }}</div>
          </button>
          <div v-if="results.length === 0" class="px-4 py-3 text-xs text-white/30">No results for "{{ query }}"</div>
        </template>
      </template>

      <!-- Recent searches (shown when input is empty) -->
      <template v-else>
        <div class="px-3 pt-3 pb-1 text-xs text-white/30 font-medium">Recent searches</div>
        <div v-if="recentSearches.length === 0" class="px-4 py-3 text-xs text-white/30">No recent searches</div>
        <button
          v-for="id in recentSearches.slice(0, 5)"
          :key="id"
          @click="selectCoin(id)"
          class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#00d4ff]/5 transition-colors text-left"
        >
          <div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/50">↩</div>
          <div class="text-sm font-medium capitalize">{{ id.replace(/-/g, ' ') }}</div>
        </button>
        <div class="border-t border-white/5 mt-1 px-3 py-2 text-xs text-white/30">Type to search all coins…</div>
      </template>
    </div>
  </div>
</template>
