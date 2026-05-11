<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'
import { formatPrice, formatPercent, formatLargeNumber } from '../utils/format'

export interface TableCoin {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap?: number
  market_cap_rank?: number
  score?: number
}

export type ColumnKey = 'rank' | 'coin' | 'price' | 'change' | 'market_cap' | 'score'

const props = defineProps<{
  title: string
  coins: TableCoin[]
  columns: ColumnKey[]
  loading?: boolean
  titleIcon?: string
}>()

const emit = defineEmits<{ 'select': [id: string] }>()

const containerRef = ref<HTMLElement | null>(null)
let ctx: ReturnType<typeof gsap.context>

function animateRows() {
  if (!containerRef.value) return
  ctx?.revert()
  ctx = gsap.context(() => {
    gsap.from('.coin-row', {
      autoAlpha: 0,
      x: -12,
      stagger: 0.04,
      duration: 0.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: containerRef.value, start: 'top 85%' },
    })
  }, containerRef.value)
}

onMounted(animateRows)
watch(() => props.coins, () => {
  if (props.coins.length) animateRows()
}, { once: true })
onUnmounted(() => ctx?.revert())
</script>

<template>
  <div ref="containerRef" class="bg-[#0b0f1a] border border-white/8 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-white/5">
      <h2 class="font-semibold text-sm flex items-center gap-2">
        <span v-if="titleIcon">{{ titleIcon }}</span>
        {{ title }}
      </h2>
    </div>

    <table class="w-full text-sm">
      <thead>
        <tr class="text-white/30 text-xs">
          <th v-if="columns.includes('rank')" class="text-left px-5 py-2.5 font-medium w-8">#</th>
          <th class="text-left py-2.5 font-medium" :class="columns.includes('rank') ? '' : 'px-5'">Coin</th>
          <th v-if="columns.includes('price')" class="text-right py-2.5 pr-5 font-medium">Price</th>
          <th v-if="columns.includes('change')" class="text-right py-2.5 pr-5 font-medium">24h %</th>
          <th v-if="columns.includes('market_cap')" class="text-right py-2.5 pr-5 font-medium hidden sm:table-cell">Mkt Cap</th>
          <th v-if="columns.includes('score')" class="text-right py-2.5 pr-5 font-medium">Trend</th>
        </tr>
      </thead>
      <tbody>
        <!-- Skeleton rows -->
        <template v-if="loading || coins.length === 0">
          <tr v-for="i in 6" :key="i" class="border-t border-white/5">
            <td v-if="columns.includes('rank')" class="px-5 py-3"><div class="w-4 h-3 bg-white/10 animate-pulse"></div></td>
            <td class="py-3" :class="columns.includes('rank') ? '' : 'px-5'">
              <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded-full bg-white/10 animate-pulse"></div>
                <div class="w-20 h-3 bg-white/10 animate-pulse"></div>
              </div>
            </td>
            <td v-if="columns.includes('price')" class="py-3 pr-5"><div class="w-16 h-3 bg-white/10 animate-pulse ml-auto"></div></td>
            <td v-if="columns.includes('change')" class="py-3 pr-5"><div class="w-12 h-3 bg-white/10 animate-pulse ml-auto"></div></td>
            <td v-if="columns.includes('market_cap')" class="py-3 pr-5 hidden sm:table-cell"><div class="w-14 h-3 bg-white/10 animate-pulse ml-auto"></div></td>
            <td v-if="columns.includes('score')" class="py-3 pr-5"><div class="w-16 h-1 bg-white/10 animate-pulse ml-auto"></div></td>
          </tr>
        </template>

        <!-- Data rows -->
        <tr
          v-for="(coin, i) in coins"
          :key="coin.id"
          class="coin-row border-t border-white/5 cursor-pointer transition-colors hover:bg-[#00d4ff]/5"
          @click="emit('select', coin.id)"
        >
          <td v-if="columns.includes('rank')" class="px-5 py-3 text-white/30 font-mono text-xs">
            {{ coin.market_cap_rank ?? i + 1 }}
          </td>
          <td class="py-3" :class="columns.includes('rank') ? '' : 'px-5'">
            <div class="flex items-center gap-2.5">
              <img :src="coin.image" :alt="coin.name" class="w-6 h-6 rounded-full" />
              <div>
                <div class="font-medium">{{ coin.name }}</div>
                <div class="text-xs text-white/30 font-mono">{{ coin.symbol.toUpperCase() }}</div>
              </div>
            </div>
          </td>
          <td v-if="columns.includes('price')" class="py-3 pr-5 text-right font-mono">
            {{ formatPrice(coin.current_price) }}
          </td>
          <td v-if="columns.includes('change')" class="py-3 pr-5 text-right">
            <span
              class="font-mono text-xs px-2 py-0.5 rounded-full"
              :class="coin.price_change_percentage_24h >= 0
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-red-400 bg-red-400/10'"
            >{{ formatPercent(coin.price_change_percentage_24h) }}</span>
          </td>
          <td v-if="columns.includes('market_cap')" class="py-3 pr-5 text-right text-white/50 hidden sm:table-cell font-mono text-xs">
            {{ coin.market_cap ? formatLargeNumber(coin.market_cap) : '—' }}
          </td>
          <td v-if="columns.includes('score')" class="py-3 pr-5 text-right">
            <div class="w-16 h-1 bg-white/10 ml-auto">
              <div
                class="h-1 bg-[#00d4ff]"
                :style="{ width: `${Math.max(10, 100 - (coin.score ?? i) * 12)}%` }"
              ></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
