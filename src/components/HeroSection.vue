<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import type { Coin } from '../composables/useMarkets'
import { formatPrice, formatPercent } from '../utils/format'

const props = defineProps<{ coins: Coin[] }>()

const containerRef = ref<HTMLElement | null>(null)
let ctx: ReturnType<typeof gsap.context>

const TICKER_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple']

const tickerCoins = () => props.coins.filter((c) => TICKER_IDS.includes(c.id)).slice(0, 5)

onMounted(() => {
  if (!containerRef.value) return
  ctx = gsap.context(() => {
    // Animate static hero elements immediately — they're always in the DOM
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-tag', { y: 20, autoAlpha: 0, duration: 0.5 })
      .from('.hero-title', { y: 30, autoAlpha: 0, duration: 0.6 }, '-=0.2')
      .from('.hero-sub', { y: 20, autoAlpha: 0, duration: 0.5 }, '-=0.3')
  }, containerRef.value)
})

// Animate ticker chips only once coins have loaded and rendered
watch(
  () => props.coins,
  async (coins) => {
    if (!coins.length || !containerRef.value) return
    await nextTick()
    gsap.from(containerRef.value.querySelectorAll('.ticker-chip'), {
      y: 16,
      autoAlpha: 0,
      stagger: 0.07,
      duration: 0.4,
      ease: 'power3.out',
    })
  },
  { once: true },
)

onUnmounted(() => ctx?.revert())
</script>

<template>
  <section ref="containerRef" class="mx-auto max-w-7xl px-6 pt-16 pb-12">
    <div class="flex flex-col items-start gap-4">
      <div
        class="hero-tag border-md-primary/20 bg-md-primary/10 text-md-primary flex items-center gap-2 border px-3 py-1 text-xs font-medium"
      >
        <div class="bg-md-primary h-1.5 w-1.5 animate-pulse rounded-full"></div>
        Real-time crypto data
      </div>

      <h1 class="hero-title text-md-on-surface text-5xl leading-tight font-bold tracking-tight">
        Crazy Crypto Tracker<br />
        <span class="from-md-primary to-md-tertiary bg-gradient-to-r bg-clip-text text-transparent"
          >Track every coin.</span
        >
      </h1>

      <p class="hero-sub text-md-on-surface-variant max-w-lg text-lg">
        Live prices, market data, and trending coins — all in one place.
      </p>

      <!-- Ticker chips -->
      <div class="mt-2 flex flex-wrap gap-3">
        <div
          v-for="coin in tickerCoins()"
          :key="coin.id"
          class="ticker-chip border-md-outline-variant/40 bg-md-surface-container-high flex items-center gap-2 border px-4 py-2.5"
        >
          <img :src="coin.image" :alt="coin.symbol" class="h-4 w-4 rounded-full" />
          <span class="text-md-on-surface-variant font-mono text-xs uppercase">{{
            coin.symbol
          }}</span>
          <span class="text-md-on-surface font-mono text-sm font-medium">{{
            formatPrice(coin.current_price)
          }}</span>
          <span
            class="font-mono text-xs"
            :class="coin.price_change_percentage_24h >= 0 ? 'text-gain' : 'text-loss'"
            >{{ formatPercent(coin.price_change_percentage_24h) }}</span
          >
        </div>

        <!-- Skeleton chips while loading -->
        <template v-if="coins.length === 0">
          <div
            v-for="i in 5"
            :key="i"
            class="ticker-chip border-md-outline-variant/40 bg-md-surface-container-high flex items-center gap-2 border px-4 py-2.5"
          >
            <div class="bg-md-on-surface/10 h-3 w-16 animate-pulse"></div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
