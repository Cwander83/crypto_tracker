const store = new Map<string, { data: unknown; expiresAt: number }>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry || Date.now() > entry.expiresAt) return null
  return entry.data as T
}

export function cacheSet(key: string, data: unknown, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}
