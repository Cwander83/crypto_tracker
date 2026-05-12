<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import CoinTable from './components/CoinTable.vue'
import CoinModal from './components/CoinModal.vue'
import { useMarkets } from './composables/useMarkets'
import { useTrending } from './composables/useTrending'
import type { TableCoin } from './components/CoinTable.vue'

const {
  coins,
  topByMarketCap,
  topGainers,
  topLosers,
  loading: marketsLoading,
  fetch: fetchMarkets,
} = useMarkets()
const { trending, loading: trendingLoading, fetch: fetchTrending } = useTrending()

const selectedCoinId = ref<string | null>(null)

function openCoin(id: string) {
  selectedCoinId.value = id
}

function closeModal() {
  selectedCoinId.value = null
}

const trendingCoins = (): TableCoin[] =>
  trending.value.map((t, i) => ({
    id: t.item.id,
    name: t.item.name,
    symbol: t.item.symbol,
    image: t.item.thumb,
    current_price: 0,
    price_change_percentage_24h: t.item.data?.price_change_percentage_24h?.usd ?? 0,
    score: i,
  }))

onMounted(() => {
  fetchMarkets()
  fetchTrending()
})
</script>

<template>
  <div class="bg-md-surface text-md-on-surface min-h-screen overflow-x-hidden">
    <AppHeader @open-coin="openCoin" />

    <HeroSection :coins="coins" />

    <!-- Tables grid -->
    <section class="mx-auto max-w-7xl px-6 pb-16">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CoinTable
          title="Top by Market Cap"
          :coins="topByMarketCap"
          :columns="['rank', 'coin', 'price', 'change', 'market_cap']"
          :loading="marketsLoading"
          @select="openCoin"
        />
        <CoinTable
          title="Top Gainers"
          title-icon="↑"
          :coins="topGainers"
          :columns="['coin', 'price', 'change']"
          :loading="marketsLoading"
          @select="openCoin"
        />
        <CoinTable
          title="Top Losers"
          title-icon="↓"
          :coins="topLosers"
          :columns="['coin', 'price', 'change']"
          :loading="marketsLoading"
          @select="openCoin"
        />
        <CoinTable
          title="Trending"
          title-icon="🔥"
          :coins="trendingCoins()"
          :columns="['rank', 'coin', 'change', 'score']"
          :loading="trendingLoading"
          @select="openCoin"
        />
      </div>
    </section>

    <CoinModal v-if="selectedCoinId" :coin-id="selectedCoinId" @close="closeModal" />
  </div>
</template>
