<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import type { Coin } from '../composables/useMarkets'
import { formatPrice, formatPercent } from '../utils/format'

const props = defineProps<{ coins: Coin[] }>()

const containerRef = ref<HTMLElement | null>(null)
let ctx: ReturnType<typeof gsap.context>

const TICKER_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple']

const tickerCoins = () => props.coins.filter(c => TICKER_IDS.includes(c.id)).slice(0, 5)

onMounted(() => {
  if (!containerRef.value) return
  ctx = gsap.context(() => {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-tag', { y: 20, autoAlpha: 0, duration: 0.5 })
      .from('.hero-title', { y: 30, autoAlpha: 0, duration: 0.6 }, '-=0.2')
      .from('.hero-sub', { y: 20, autoAlpha: 0, duration: 0.5 }, '-=0.3')
      .from('.ticker-chip', { y: 16, autoAlpha: 0, stagger: 0.07, duration: 0.4 }, '-=0.2')
  }, containerRef.value)
})

onUnmounted(() => ctx?.revert())
</script>

<template>
  <section ref="containerRef" class="max-w-7xl mx-auto px-6 pt-16 pb-12">
    <div class="flex flex-col items-start gap-4">
      <div class="hero-tag flex items-center gap-2 text-xs font-medium text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-3 py-1">
        <div class="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse"></div>
        Real-time crypto data
      </div>

      <h1 class="hero-title text-5xl font-bold tracking-tight leading-tight">
        Track every coin.<br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-blue-400">Never miss a move.</span>
      </h1>

      <p class="hero-sub text-white/40 text-lg max-w-lg">
        Live prices, market data, and trending coins — all in one place.
      </p>

      <!-- Ticker chips -->
      <div class="flex flex-wrap gap-3 mt-2">
        <div
          v-for="coin in tickerCoins()"
          :key="coin.id"
          class="ticker-chip flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5"
        >
          <img :src="coin.image" :alt="coin.symbol" class="w-4 h-4 rounded-full" />
          <span class="text-white/50 text-xs uppercase font-mono">{{ coin.symbol }}</span>
          <span class="font-mono text-sm font-medium">{{ formatPrice(coin.current_price) }}</span>
          <span
            class="text-xs font-mono"
            :class="coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'"
          >{{ formatPercent(coin.price_change_percentage_24h) }}</span>
        </div>

        <!-- Skeleton chips while loading -->
        <template v-if="coins.length === 0">
          <div v-for="i in 5" :key="i" class="ticker-chip flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5">
            <div class="w-16 h-3 bg-white/10 animate-pulse"></div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
