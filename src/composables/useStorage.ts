import { ref, watch } from 'vue'

export function useStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  const state = ref<T>(stored ? JSON.parse(stored) : defaultValue)
  watch(state, (val) => localStorage.setItem(key, JSON.stringify(val)), { deep: true })
  return state
}
