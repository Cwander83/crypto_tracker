import { ref } from 'vue'

const BASE = 'https://api.coingecko.com/api/v3'

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
    loading.value = true
    error.value = null
    try {
      const res = await window.fetch(`${BASE}/search/trending`)
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      trending.value = (data.coins ?? []).slice(0, 8)
    } catch (e) {
      error.value = 'Failed to load trending data'
    } finally {
      loading.value = false
    }
  }

  return { trending, loading, error, fetch }
}
