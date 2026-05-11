<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

const isDark = ref(true)
const iconRef = ref<SVGElement | null>(null)

onMounted(() => {
  const stored = localStorage.getItem('ct_theme')
  isDark.value = stored ? stored === 'dark' : true
  applyTheme(isDark.value, false)
})

function toggle() {
  isDark.value = !isDark.value
  applyTheme(isDark.value, true)
  localStorage.setItem('ct_theme', isDark.value ? 'dark' : 'light')
}

function applyTheme(dark: boolean, animate: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  if (animate && iconRef.value) {
    gsap.fromTo(iconRef.value, { rotate: -90, scale: 0.5 }, { rotate: 0, scale: 1, duration: 0.35, ease: 'back.out(2)' })
  }
}
</script>

<template>
  <button
    @click="toggle"
    class="w-9 h-9 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <!-- Sun (dark mode active) -->
    <svg v-if="isDark" ref="iconRef" class="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
    </svg>
    <!-- Moon (light mode active) -->
    <svg v-else ref="iconRef" class="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
    </svg>
  </button>
</template>
