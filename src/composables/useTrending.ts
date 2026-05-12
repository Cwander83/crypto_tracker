import { ref } from 'vue'
import { cacheGet, cacheSet } from '../utils/cache'

const BASE = 'https://api.coingecko.com/api/v3'
const TTL = 5 * 60_000 // 5 minutes

export interface TrendingCoin {
  item: {
    id: string
    name: string
    symbol: string
    thumb: string
    score: number
    data?: { price_change_percentage_24h?: { usd?: number } }
  }
}

export function useTrending() {
  const trending = ref<TrendingCoin[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetch() {
    const cached = cacheGet<TrendingCoin[]>('trending')
    if (cached) {
      trending.value = cached
      loading.value = false
      return
    }

    loading.value = true
    error.value = null
    try {
      const res = await window.fetch(`${BASE}/search/trending`)
      if (res.status === 429) {
        error.value = 'Rate limited — please wait a moment and try again'
        return
      }
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      const coins = (data.coins ?? []).slice(0, 8) as TrendingCoin[]
      cacheSet('trending', coins, TTL)
      trending.value = coins
    } catch (e) {
      error.value = 'Failed to load trending data'
    } finally {
      loading.value = false
    }
  }

  return { trending, loading, error, fetch }
}
