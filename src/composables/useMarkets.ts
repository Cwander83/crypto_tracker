import { ref, computed } from 'vue'
import { cacheGet, cacheSet } from '../utils/cache'

const BASE = 'https://api.coingecko.com/api/v3'
const TTL = 60_000 // 60 seconds

export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  market_cap_rank: number
}

export function useMarkets() {
  const coins = ref<Coin[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetch() {
    const cached = cacheGet<Coin[]>('markets')
    if (cached) {
      coins.value = cached
      loading.value = false
      return
    }

    loading.value = true
    error.value = null
    try {
      const res = await window.fetch(
        `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&price_change_percentage=24h`,
      )
      if (res.status === 429) {
        error.value = 'Rate limited — please wait a moment and try again'
        return
      }
      if (!res.ok) throw new Error('API error')
      const data: Coin[] = await res.json()
      cacheSet('markets', data, TTL)
      coins.value = data
    } catch (e) {
      error.value = 'Failed to load market data'
    } finally {
      loading.value = false
    }
  }

  const topByMarketCap = computed(() => coins.value.slice(0, 10))

  const topGainers = computed(() =>
    [...coins.value]
      .filter((c) => c.price_change_percentage_24h != null)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 8),
  )

  const topLosers = computed(() =>
    [...coins.value]
      .filter((c) => c.price_change_percentage_24h != null)
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 8),
  )

  return { coins, topByMarketCap, topGainers, topLosers, loading, error, fetch }
}
