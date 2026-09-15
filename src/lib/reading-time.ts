const WORDS_PER_MINUTE = 220

/** Whole minutes to read a markdown body, never less than one. */
export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
