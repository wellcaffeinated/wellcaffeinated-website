export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [
    i,
    ...Array(n).fill(0),
  ])
  for (let j = 1; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      )
    }
  }
  return d[m][n]
}

/** Closest candidate within `max` edits, or null. */
export function didYouMean(
  word: string,
  candidates: string[],
  max = 2,
): string | null {
  let best: string | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  for (const c of candidates) {
    const distance = levenshtein(word.toLowerCase(), c.toLowerCase())
    if (distance < bestDistance) {
      bestDistance = distance
      best = c
    }
  }
  return bestDistance <= max ? best : null
}
