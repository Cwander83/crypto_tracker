import { ref } from 'vue'
import { cacheGet, cacheSet } from '../utils/cache'

const BASE = 'https://api.coingecko.com/api/v3'
const DETAIL_TTL = 60_000 // 60 seconds
const CHART_TTL = 5 * 60_000 // 5 minutes

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
    const cacheKey = `coin-detail-${id}`
    const cached = cacheGet<CoinDetail>(cacheKey)
    if (cached) {
      detail.value = cached
      loading.value = false
      return
    }

    loading.value = true
    error.value = null
    detail.value = null
    try {
      const res = await window.fetch(`${BASE}/coins/${id}?localization=false&sparkline=false`)
      if (res.status === 429) {
        error.value = 'Rate limited — please wait a moment and try again'
        return
      }
      if (!res.ok) throw new Error('API error')
      const data: CoinDetail = await res.json()
      cacheSet(cacheKey, data, DETAIL_TTL)
      detail.value = data
    } catch (e) {
      error.value = 'Failed to load coin data'
    } finally {
      loading.value = false
    }
  }

  async function fetchChart(id: string, days: number) {
    const cacheKey = `coin-chart-${id}-${days}`
    const cached = cacheGet<ChartData>(cacheKey)
    if (cached) {
      chartData.value = cached
      chartLoading.value = false
      return
    }

    chartLoading.value = true
    chartData.value = null
    try {
      const res = await window.fetch(
        `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
      )
      if (res.status === 429) return // chart non-critical, fail silently
      if (!res.ok) throw new Error('API error')
      const data: ChartData = await res.json()
      cacheSet(cacheKey, data, CHART_TTL)
      chartData.value = data
    } catch {
      // chart is non-critical, fail silently
    } finally {
      chartLoading.value = false
    }
  }

  return { detail, chartData, loading, chartLoading, error, fetchDetail, fetchChart }
}
