export function formatPrice(n: number): string {
  if (n >= 1)
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 0.01) return '$' + n.toFixed(4)
  return '$' + n.toFixed(8)
}

export function formatPercent(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return sign + n.toFixed(2) + '%'
}

export function formatLargeNumber(n: number): string {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
  return '$' + n.toLocaleString('en-US')
}
