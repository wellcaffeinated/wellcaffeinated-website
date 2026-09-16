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
const ELLIPSIS = '…'

const TITLE_MATCH_BONUS = 2
const ARCHIVE_PENALTY = -0.5

const PATH_WORD_SEPARATORS = /[/\-_.\s]+/
const MIN_WORD_LENGTH = 3
const DEFAULT_WORD_HITS = 3

function score(item: ShellItem, query: string): number {
  const titleBonus = item.title.toLowerCase().includes(query)
    ? TITLE_MATCH_BONUS
    : 0
  const archivePenalty = item.section === 'archive' ? ARCHIVE_PENALTY : 0
  return titleBonus + archivePenalty
}

function hitFor(item: ShellItem, query: string): Hit | null {
  const haystack = [item.title, ...item.tags, item.description].join(' · ')
  const at = haystack.toLowerCase().indexOf(query)
  if (at < 0) return null
  const start = Math.max(0, at - CONTEXT_BEFORE)
  const matchEnd = at + query.length
  const end = Math.min(haystack.length, matchEnd + CONTEXT_AFTER)
  const leading = start > 0 ? ELLIPSIS : ''
  const trailing = end < haystack.length ? ELLIPSIS : ''
  return {
    item,
    score: score(item, query),
    before: `${leading}${haystack.slice(start, at)}`,
    match: haystack.slice(at, matchEnd),
    after: `${haystack.slice(matchEnd, end)}${trailing}`,
  }
}

const isHit = (hit: Hit | null): hit is Hit => hit !== null

export function search(index: ShellIndex, query: string): Hit[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return index.items
    .map((item) => hitFor(item, needle))
    .filter(isHit)
    .sort((a, b) => b.score - a.score)
}

const hitKey = (hit: Hit) => `${hit.item.section}/${hit.item.slug}`

/** Keeps the first hit for each item, in order. */
function dedupe(hits: Hit[]): Hit[] {
  const byItem = new Map<string, Hit>()
  for (const hit of hits) {
    if (!byItem.has(hitKey(hit))) byItem.set(hitKey(hit), hit)
  }
  return [...byItem.values()]
}

/** Best matches for the words of a path nobody could find. */
export function searchWords(
  index: ShellIndex,
  path: string,
  limit = DEFAULT_WORD_HITS,
): Hit[] {
  const words = path
    .split(PATH_WORD_SEPARATORS)
    .filter((word) => word.length >= MIN_WORD_LENGTH)
  const hits = words.flatMap((word) => search(index, word))
  return dedupe(hits).slice(0, limit)
}
