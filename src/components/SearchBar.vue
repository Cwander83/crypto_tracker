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
  gsap.fromTo(
    dropdownRef.value,
    { autoAlpha: 0, y: -8 },
    { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' },
  )
}

function closeDropdown() {
  gsap.to(dropdownRef.value, {
    autoAlpha: 0,
    y: -8,
    duration: 0.15,
    onComplete: () => {
      isOpen.value = false
    },
  })
}

function onInput() {
  clearTimeout(debounceTimer)
  if (!query.value.trim()) {
    results.value = []
    return
  }
  debounceTimer = setTimeout(search, 300)
}

async function search() {
  loading.value = true
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query.value)}`,
    )
    const data = await res.json()
    results.value = (data.coins ?? []).slice(0, 6)
  } finally {
    loading.value = false
  }
}

function selectCoin(id: string) {
  recentSearches.value = [id, ...recentSearches.value.filter((r) => r !== id)].slice(0, 10)
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
  <div ref="containerRef" class="relative max-w-lg flex-1">
    <div class="relative">
      <svg
        class="text-md-on-surface-variant/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        @focus="openDropdown"
        @input="onInput"
        type="text"
        placeholder="Search coins…"
        class="border-md-outline-variant/40 bg-md-surface-container text-md-on-surface placeholder-md-on-surface-variant/60 focus:border-md-primary/60 w-full border py-2 pr-4 pl-10 text-sm transition-colors outline-none"
      />
    </div>

    <!-- Dropdown -->
    <div
      v-show="isOpen"
      ref="dropdownRef"
      class="border-md-outline-variant/40 bg-md-surface-container absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden border shadow-2xl"
      style="visibility: hidden"
    >
      <!-- Search results -->
      <template v-if="query.trim()">
        <div v-if="loading" class="text-md-on-surface-variant/60 px-4 py-3 text-xs">Searching…</div>
        <template v-else>
          <button
            v-for="coin in results"
            :key="coin.id"
            @click="selectCoin(coin.id)"
            class="hover:bg-md-primary/5 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
          >
            <img :src="coin.thumb" :alt="coin.name" class="h-7 w-7 rounded-full" />
            <div>
              <div class="text-md-on-surface text-sm font-medium">{{ coin.name }}</div>
              <div class="text-md-on-surface-variant font-mono text-xs">
                {{ coin.symbol.toUpperCase() }}
              </div>
            </div>
            <div
              v-if="coin.market_cap_rank"
              class="text-md-on-surface-variant/60 ml-auto font-mono text-xs"
            >
              #{{ coin.market_cap_rank }}
            </div>
          </button>
          <div v-if="results.length === 0" class="text-md-on-surface-variant/60 px-4 py-3 text-xs">
            No results for "{{ query }}"
          </div>
        </template>
      </template>

      <!-- Recent searches (shown when input is empty) -->
      <template v-else>
        <div class="text-md-on-surface-variant/60 px-3 pt-3 pb-1 text-xs font-medium">
          Recent searches
        </div>
        <div
          v-if="recentSearches.length === 0"
          class="text-md-on-surface-variant/60 px-4 py-3 text-xs"
        >
          No recent searches
        </div>
        <button
          v-for="id in recentSearches.slice(0, 5)"
          :key="id"
          @click="selectCoin(id)"
          class="hover:bg-md-primary/5 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
        >
          <div
            class="bg-md-surface-container-high text-md-on-surface-variant flex h-7 w-7 items-center justify-center rounded-full text-xs"
          >
            ↩
          </div>
          <div class="text-md-on-surface text-sm font-medium capitalize">
            {{ id.replace(/-/g, ' ') }}
          </div>
        </button>
        <div
          class="border-md-outline-variant/20 text-md-on-surface-variant/60 mt-1 border-t px-3 py-2 text-xs"
        >
          Type to search all coins…
        </div>
      </template>
    </div>
  </div>
</template>
