// Substring search over the index with a highlighted excerpt. Deliberately
// naive; swap for Pagefind / MiniSearch when there is enough content to need it.
import type { ShellIndex, ShellItem } from './content'

export interface Hit {
  item: ShellItem
  score: number
  before: string
  match: string
  after: string
}

const CONTEXT_BEFORE = 48
const CONTEXT_AFTER = 60

export function search(index: ShellIndex, query: string): Hit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hits: Hit[] = []
  for (const item of index.items) {
    const hay = [item.title, ...item.tags, item.description].join(' · ')
    const at = hay.toLowerCase().indexOf(q)
    if (at < 0) continue
    const start = Math.max(0, at - CONTEXT_BEFORE)
    const end = Math.min(hay.length, at + q.length + CONTEXT_AFTER)
    hits.push({
      item,
      score:
        (item.title.toLowerCase().includes(q) ? 2 : 0) +
        (item.section === 'archive' ? -0.5 : 0),
      before: (start > 0 ? '…' : '') + hay.slice(start, at),
      match: hay.slice(at, at + q.length),
      after: hay.slice(at + q.length, end) + (end < hay.length ? '…' : ''),
    })
  }
  return hits.sort((a, b) => b.score - a.score)
}

/** Best matches for the words of a path nobody could find. */
export function searchWords(index: ShellIndex, path: string, limit = 3): Hit[] {
  const words = path.split(/[/\-_.\s]+/).filter((w) => w.length > 2)
  const seen = new Set<string>()
  const out: Hit[] = []
  for (const w of words) {
    for (const hit of search(index, w)) {
      const key = `${hit.item.section}/${hit.item.slug}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(hit)
    }
  }
  return out.slice(0, limit)
}
