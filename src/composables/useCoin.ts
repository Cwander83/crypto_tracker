import { ref } from 'vue'

const BASE = 'https://api.coingecko.com/api/v3'

export interface CoinDetail {
  id: string
  name: string
  symbol: string
  image: { large: string }
  market_data: {
    current_price: { usd: number }
    price_change_percentage_24h: number
    market_cap: { usd: number }
    total_volume: { usd: number }
    circulating_supply: number
    high_24h: { usd: number }
    low_24h: { usd: number }
  }
  description: { en: string }
  links: {
    homepage: string[]
    blockchain_site: string[]
    subreddit_url: string
    twitter_screen_name: string
  }
}

export interface ChartData {
  prices: [number, number][]
}

export function useCoin() {
  const detail = ref<CoinDetail | null>(null)
  const chartData = ref<ChartData | null>(null)
  const loading = ref(false)
  const chartLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDetail(id: string) {
    loading.value = true
    error.value = null
    detail.value = null
    try {
      const res = await window.fetch(`${BASE}/coins/${id}?localization=false&sparkline=false`)
      if (!res.ok) throw new Error('API error')
      detail.value = await res.json()
    } catch (e) {
      error.value = 'Failed to load coin data'
    } finally {
      loading.value = false
    }
  }

  async function fetchChart(id: string, days: number) {
    chartLoading.value = true
    chartData.value = null
    try {
      const res = await window.fetch(`${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`)
      if (!res.ok) throw new Error('API error')
      chartData.value = await res.json()
    } catch {
      // chart is non-critical, fail silently
    } finally {
      chartLoading.value = false
    }
  }

  return { detail, chartData, loading, chartLoading, error, fetchDetail, fetchChart }
}
