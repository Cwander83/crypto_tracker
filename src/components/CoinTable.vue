<script setup lang="ts">
import { ref, onUnmounted, watch, nextTick } from 'vue'
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

const emit = defineEmits<{ select: [id: string] }>()

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

watch(
  () => props.coins,
  async () => {
    if (!props.coins.length) return
    await nextTick()
    animateRows()
  },
  { once: true },
)
onUnmounted(() => ctx?.revert())
</script>

<template>
  <div
    ref="containerRef"
    class="border-md-outline-variant/30 bg-md-surface-container overflow-hidden border"
  >
    <!-- Header -->
    <div class="border-md-outline-variant/20 flex items-center justify-between border-b px-5 py-4">
      <h2 class="text-md-on-surface flex items-center gap-2 text-sm font-semibold">
        <span v-if="titleIcon">{{ titleIcon }}</span>
        {{ title }}
      </h2>
    </div>

    <table class="w-full text-sm">
      <thead>
        <tr class="text-md-on-surface-variant/60 text-xs">
          <th v-if="columns.includes('rank')" class="w-8 px-5 py-2.5 text-left font-medium">#</th>
          <th class="py-2.5 text-left font-medium" :class="columns.includes('rank') ? '' : 'px-5'">
            Coin
          </th>
          <th v-if="columns.includes('price')" class="py-2.5 pr-5 text-right font-medium">Price</th>
          <th v-if="columns.includes('change')" class="py-2.5 pr-5 text-right font-medium">
            24h %
          </th>
          <th
            v-if="columns.includes('market_cap')"
            class="hidden py-2.5 pr-5 text-right font-medium sm:table-cell"
          >
            Mkt Cap
          </th>
          <th v-if="columns.includes('score')" class="py-2.5 pr-5 text-right font-medium">Trend</th>
        </tr>
      </thead>
      <tbody>
        <!-- Skeleton rows -->
        <template v-if="loading || coins.length === 0">
          <tr v-for="i in 6" :key="i" class="border-md-outline-variant/20 border-t">
            <td v-if="columns.includes('rank')" class="px-5 py-3">
              <div class="bg-md-on-surface/10 h-3 w-4 animate-pulse"></div>
            </td>
            <td class="py-3" :class="columns.includes('rank') ? '' : 'px-5'">
              <div class="flex items-center gap-2.5">
                <div class="bg-md-on-surface/10 h-6 w-6 animate-pulse rounded-full"></div>
                <div class="bg-md-on-surface/10 h-3 w-20 animate-pulse"></div>
              </div>
            </td>
            <td v-if="columns.includes('price')" class="py-3 pr-5">
              <div class="bg-md-on-surface/10 ml-auto h-3 w-16 animate-pulse"></div>
            </td>
            <td v-if="columns.includes('change')" class="py-3 pr-5">
              <div class="bg-md-on-surface/10 ml-auto h-3 w-12 animate-pulse"></div>
            </td>
            <td v-if="columns.includes('market_cap')" class="hidden py-3 pr-5 sm:table-cell">
              <div class="bg-md-on-surface/10 ml-auto h-3 w-14 animate-pulse"></div>
            </td>
            <td v-if="columns.includes('score')" class="py-3 pr-5">
              <div class="bg-md-on-surface/10 ml-auto h-1 w-16 animate-pulse"></div>
            </td>
          </tr>
        </template>

        <!-- Data rows -->
        <tr
          v-for="(coin, i) in coins"
          :key="coin.id"
          class="coin-row border-md-outline-variant/20 hover:bg-md-primary/5 cursor-pointer border-t transition-colors"
          @click="emit('select', coin.id)"
        >
          <td
            v-if="columns.includes('rank')"
            class="text-md-on-surface-variant/60 px-5 py-3 font-mono text-xs"
          >
            {{ coin.market_cap_rank ?? i + 1 }}
          </td>
          <td class="py-3" :class="columns.includes('rank') ? '' : 'px-5'">
            <div class="flex items-center gap-2.5">
              <img :src="coin.image" :alt="coin.name" class="h-6 w-6 rounded-full" />
              <div>
                <div class="text-md-on-surface font-medium">{{ coin.name }}</div>
                <div class="text-md-on-surface-variant/60 font-mono text-xs">
                  {{ coin.symbol.toUpperCase() }}
                </div>
              </div>
            </div>
          </td>
          <td
            v-if="columns.includes('price')"
            class="text-md-on-surface py-3 pr-5 text-right font-mono"
          >
            {{ formatPrice(coin.current_price) }}
          </td>
          <td v-if="columns.includes('change')" class="py-3 pr-5 text-right">
            <span
              class="rounded-md-full px-2 py-0.5 font-mono text-xs"
              :class="
                coin.price_change_percentage_24h >= 0
                  ? 'bg-gain/10 text-gain'
                  : 'bg-loss/10 text-loss'
              "
              >{{ formatPercent(coin.price_change_percentage_24h) }}</span
            >
          </td>
          <td
            v-if="columns.includes('market_cap')"
            class="text-md-on-surface-variant hidden py-3 pr-5 text-right font-mono text-xs sm:table-cell"
          >
            {{ coin.market_cap ? formatLargeNumber(coin.market_cap) : '—' }}
          </td>
          <td v-if="columns.includes('score')" class="py-3 pr-5 text-right">
            <div class="bg-md-on-surface/10 ml-auto h-1 w-16">
              <div
                class="bg-md-primary h-1"
                :style="{ width: `${Math.max(10, 100 - (coin.score ?? i) * 12)}%` }"
              ></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
