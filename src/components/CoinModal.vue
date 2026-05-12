<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useCoin } from '../composables/useCoin'
import { formatPrice, formatPercent, formatLargeNumber } from '../utils/format'
import PriceChart from './PriceChart.vue'

const props = defineProps<{ coinId: string }>()
const emit = defineEmits<{ close: [] }>()

const { detail, chartData, loading, chartLoading, fetchDetail, fetchChart } = useCoin()

const backdropRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const selectedDays = ref(7)

const DAYS_OPTIONS = [
  { label: '1D', value: 1 },
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '1Y', value: 365 },
]

onMounted(() => {
  // Start data fetch and open animation together
  fetchDetail(props.coinId)
  fetchChart(props.coinId, 7)
  gsap.set(backdropRef.value, { autoAlpha: 0 })
  gsap
    .timeline()
    .to(backdropRef.value, { autoAlpha: 1, duration: 0.3 })
    .fromTo(panelRef.value, { y: '100%' }, { y: '0%', duration: 0.5, ease: 'power3.out' }, '-=0.2')

  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => document.removeEventListener('keydown', onKeydown))

function close() {
  if (!backdropRef.value || !panelRef.value) return
  gsap
    .timeline({ onComplete: () => emit('close') })
    .to(panelRef.value, { y: '100%', duration: 0.4, ease: 'power3.in' })
    .to(backdropRef.value, { autoAlpha: 0, duration: 0.2 }, '-=0.2')
}

// Stagger content sections in once detail data is in the DOM
watch(detail, async (val) => {
  if (!val || !panelRef.value) return
  await nextTick()
  gsap.from(panelRef.value.querySelectorAll('.modal-section'), {
    autoAlpha: 0,
    y: 14,
    stagger: 0.07,
    duration: 0.35,
    ease: 'power2.out',
  })
})

function changeTimeframe(days: number) {
  selectedDays.value = days
  fetchChart(props.coinId, days)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

const isUp = (n: number) => n >= 0
const cleanDescription = (s: string) =>
  s.replace(/<[^>]+>/g, '').slice(0, 400) + (s.length > 400 ? '…' : '')
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-end">
    <!-- Backdrop -->
    <div
      ref="backdropRef"
      class="bg-md-scrim/60 absolute inset-0"
      style="backdrop-filter: blur(4px)"
      @click="close"
    ></div>

    <!-- Panel -->
    <div
      ref="panelRef"
      class="scrollbar-hide border-md-outline-variant/30 bg-md-surface relative z-10 max-h-[90vh] w-full overflow-y-auto border-t"
      style="transform: translateY(100%)"
    >
      <!-- Drag handle -->
      <div class="flex justify-center pt-3 pb-1">
        <div class="bg-md-on-surface/20 h-1 w-10 rounded-full"></div>
      </div>

      <div class="px-6 pb-12">
        <!-- Header -->
        <div class="modal-section flex items-start justify-between pt-4 pb-6">
          <div v-if="loading" class="flex items-center gap-4">
            <div class="bg-md-on-surface/10 h-14 w-14 animate-pulse"></div>
            <div class="space-y-2">
              <div class="bg-md-on-surface/10 h-5 w-32 animate-pulse"></div>
              <div class="bg-md-on-surface/10 h-8 w-24 animate-pulse"></div>
            </div>
          </div>
          <div v-else-if="detail" class="flex items-center gap-4">
            <img :src="detail.image.large" :alt="detail.name" class="h-14 w-14" />
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-md-on-surface text-2xl font-bold">{{ detail.name }}</h2>
                <span
                  class="border-md-outline-variant/40 bg-md-surface-container text-md-on-surface-variant border px-2.5 py-1 font-mono text-xs uppercase"
                  >{{ detail.symbol }}</span
                >
              </div>
              <div class="mt-1 flex items-center gap-3">
                <span class="text-md-on-surface font-mono text-3xl font-bold">{{
                  formatPrice(detail.market_data.current_price.usd)
                }}</span>
                <span
                  class="rounded-md-full px-2.5 py-1 font-mono text-sm font-medium"
                  :class="
                    isUp(detail.market_data.price_change_percentage_24h)
                      ? 'bg-gain/15 text-gain'
                      : 'bg-loss/15 text-loss'
                  "
                  >{{ formatPercent(detail.market_data.price_change_percentage_24h) }}</span
                >
              </div>
            </div>
          </div>

          <button
            @click="close"
            class="border-md-outline-variant/40 bg-md-surface-container text-md-on-surface-variant hover:bg-md-primary/10 hover:text-md-primary mt-1 flex h-9 w-9 shrink-0 items-center justify-center border transition-colors"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Stat cards -->
        <div v-if="detail" class="modal-section mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="border-md-outline-variant/30 bg-md-surface-container border p-3.5">
            <div class="text-md-on-surface-variant mb-1 text-xs">Market Cap</div>
            <div class="text-md-on-surface font-mono text-sm font-semibold">
              {{ formatLargeNumber(detail.market_data.market_cap.usd) }}
            </div>
          </div>
          <div class="border-md-outline-variant/30 bg-md-surface-container border p-3.5">
            <div class="text-md-on-surface-variant mb-1 text-xs">24h Volume</div>
            <div class="text-md-on-surface font-mono text-sm font-semibold">
              {{ formatLargeNumber(detail.market_data.total_volume.usd) }}
            </div>
          </div>
          <div class="border-md-outline-variant/30 bg-md-surface-container border p-3.5">
            <div class="text-md-on-surface-variant mb-1 text-xs">Circulating</div>
            <div class="text-md-on-surface font-mono text-sm font-semibold">
              {{ formatLargeNumber(detail.market_data.circulating_supply) }}
            </div>
          </div>
          <div class="border-md-outline-variant/30 bg-md-surface-container border p-3.5">
            <div class="text-md-on-surface-variant mb-1 text-xs">24h High</div>
            <div class="text-gain font-mono text-sm font-semibold">
              {{ formatPrice(detail.market_data.high_24h.usd) }}
            </div>
          </div>
        </div>
        <div v-else-if="loading" class="modal-section mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            v-for="i in 4"
            :key="i"
            class="border-md-outline-variant/30 bg-md-surface-container border p-3.5"
          >
            <div class="bg-md-on-surface/10 mb-2 h-2 w-16 animate-pulse"></div>
            <div class="bg-md-on-surface/10 h-4 w-20 animate-pulse"></div>
          </div>
        </div>

        <!-- Chart -->
        <div class="modal-section mb-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-md-on-surface text-sm font-semibold">Price Chart</h3>
            <div class="flex gap-1">
              <button
                v-for="opt in DAYS_OPTIONS"
                :key="opt.value"
                @click="changeTimeframe(opt.value)"
                class="px-3 py-1.5 text-xs font-medium transition-colors"
                :class="
                  selectedDays === opt.value
                    ? 'bg-md-primary text-md-on-primary'
                    : 'bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high'
                "
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div class="chart-glass h-48 p-4">
            <PriceChart :prices="chartData?.prices ?? null" :loading="chartLoading" />
          </div>
        </div>

        <!-- Description -->
        <div v-if="detail?.description?.en" class="modal-section mb-6">
          <h3 class="text-md-on-surface mb-2 text-sm font-semibold">About</h3>
          <p class="text-md-on-surface-variant text-sm leading-relaxed">
            {{ cleanDescription(detail.description.en) }}
          </p>
        </div>

        <!-- Links -->
        <div v-if="detail" class="modal-section">
          <h3 class="text-md-on-surface mb-3 text-sm font-semibold">Links</h3>
          <div class="flex flex-wrap gap-2">
            <a
              v-if="detail.links.homepage[0]"
              :href="detail.links.homepage[0]"
              target="_blank"
              rel="noopener"
              class="border-md-outline-variant/40 bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high hover:text-md-on-surface flex items-center gap-2 border px-3 py-2 text-xs transition-colors"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Website
            </a>
            <a
              v-if="detail.links.blockchain_site[0]"
              :href="detail.links.blockchain_site[0]"
              target="_blank"
              rel="noopener"
              class="border-md-outline-variant/40 bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high hover:text-md-on-surface flex items-center gap-2 border px-3 py-2 text-xs transition-colors"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Explorer
            </a>
            <a
              v-if="detail.links.twitter_screen_name"
              :href="`https://twitter.com/${detail.links.twitter_screen_name}`"
              target="_blank"
              rel="noopener"
              class="border-md-outline-variant/40 bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high hover:text-md-on-surface flex items-center gap-2 border px-3 py-2 text-xs transition-colors"
            >
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
              Twitter
            </a>
            <a
              v-if="detail.links.subreddit_url"
              :href="detail.links.subreddit_url"
              target="_blank"
              rel="noopener"
              class="border-md-outline-variant/40 bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high hover:text-md-on-surface flex items-center gap-2 border px-3 py-2 text-xs transition-colors"
            >
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"
                />
              </svg>
              Reddit
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
