// The browser's view of the site's content: a flat index built at build time
// by `src/pages/shell/index.json.ts`. Bodies are not included; full-text
// search is a later swap (Pagefind).
import { itemHref, SECTIONS, type Section, SHELL_INDEX_HREF } from './paths'

export interface ShellItem {
  section: Section
  slug: string
  href: string
  title: string
  description: string
  tags: string[]
  /** ISO date for thoughts and archive posts. */
  date?: string
  year?: number
  minutes?: number
  // projects
  kind?: 'personal' | 'professional'
  years?: string
  alive?: boolean
  // play
  color?: string
  ink?: string
  game?: boolean
  tilt?: boolean
}

export interface ShellIndex {
  items: ShellItem[]
}

let cached: Promise<ShellIndex> | undefined

export function loadIndex(): Promise<ShellIndex> {
  cached ??= fetch(SHELL_INDEX_HREF).then((r) => {
    if (!r.ok) throw new Error(`could not load ${SHELL_INDEX_HREF}`)
    return r.json() as Promise<ShellIndex>
  })
  return cached
}

export function itemsIn(index: ShellIndex, section: Section): ShellItem[] {
  return index.items.filter((it) => it.section === section)
}

/**
 * Resolves "thoughts/slug", "/thoughts/slug/", "./play/slug" or a bare slug.
 * "thoughts/<archived slug>" also works, since the archive lives under thoughts.
 */
export function findItem(index: ShellIndex, path: string): ShellItem | null {
  const parts = path
    .replace(/^\.?\/+/, '')
    .split('/')
    .filter(Boolean)
  const slug = parts.at(-1)
  if (!slug) return null
  const section = parts.length > 1 ? parts[0] : null
  return (
    index.items.find(
      (it) =>
        it.slug === slug &&
        (!section ||
          it.section === section ||
          (section === 'thoughts' && it.section === 'archive')),
    ) ?? null
  )
}

export function isSection(s: string): s is Section {
  return (SECTIONS as string[]).includes(s)
}

export function hrefOf(item: Pick<ShellItem, 'section' | 'slug'>): string {
  return itemHref(item.section, item.slug)
}
