<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { gsap } from 'gsap'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
  prices: [number, number][] | null
  loading: boolean
}>()

const chartRef = ref<HTMLElement | null>(null)

const chartData = computed(() => {
  if (!props.prices?.length) return null
  const isUp = props.prices[props.prices.length - 1][1] >= props.prices[0][1]
  const color = isUp ? '#34d399' : '#f87171'

  // Downsample to 80 points max for performance
  const pts = props.prices
  const step = Math.max(1, Math.floor(pts.length / 80))
  const sampled = pts.filter((_, i) => i % step === 0)

  return {
    labels: sampled.map(() => ''),
    datasets: [{
      data: sampled.map(p => p[1]),
      borderColor: color,
      backgroundColor: isUp ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
      borderWidth: 1.5,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
    }],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 400 },
  plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
  scales: {
    x: { display: false },
    y: { display: false },
  },
}

watch(() => props.prices, (newVal, oldVal) => {
  if (!chartRef.value || !newVal || newVal === oldVal) return
  gsap.fromTo(chartRef.value, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
})
</script>

<template>
  <div ref="chartRef" class="relative w-full h-full">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <div class="text-xs text-white/30 animate-pulse">Loading chart…</div>
    </div>
    <Line v-else-if="chartData" :data="chartData" :options="chartOptions" class="w-full h-full" />
    <div v-else class="absolute inset-0 flex items-center justify-center text-xs text-white/20">No chart data</div>
  </div>
</template>
