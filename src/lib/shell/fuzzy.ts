const range = (length: number) => Array.from({ length }, (_, i) => i)

/** Edit distance, one row of the table at a time. */
export function levenshtein(a: string, b: string): number {
  const firstRow = range(b.length + 1)
  const lastRow = [...a].reduce((previous, charA, i) => {
    const current = [i + 1]
    for (const [j, charB] of [...b].entries()) {
      const substitution = previous[j] + (charA === charB ? 0 : 1)
      const deletion = previous[j + 1] + 1
      const insertion = current[j] + 1
      current.push(Math.min(substitution, deletion, insertion))
    }
    return current
  }, firstRow)
  return lastRow[b.length]
}

const DEFAULT_MAX_EDITS = 2

/** Closest candidate within `maxEdits` edits, or null. */
export function didYouMean(
  word: string,
  candidates: string[],
  maxEdits = DEFAULT_MAX_EDITS,
): string | null {
  const scored = candidates.map((candidate) => ({
    candidate,
    distance: levenshtein(word.toLowerCase(), candidate.toLowerCase()),
  }))
  const closest = scored.reduce(
    (best, next) => (next.distance < best.distance ? next : best),
    { candidate: null as string | null, distance: Number.POSITIVE_INFINITY },
  )
  return closest.distance <= maxEdits ? closest.candidate : null
}
