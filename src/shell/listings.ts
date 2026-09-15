// Index items → list descriptors. Pure functions shared by the `ls` command
// (browser) and the static section pages (build), so both agree on what a
// listing looks like.
import type { Card, Output, Row } from '../lib/shell'
import { itemsIn, type ShellIndex, type ShellItem } from './content'

export const openCmd = (item: Pick<ShellItem, 'section' | 'slug'>) =>
  `open ${item.section}/${item.slug}`

export function rootRows(index: ShellIndex, showHidden: boolean): Output {
  const count = (s: ShellItem['section']) => itemsIn(index, s).length
  const items: Row[] = [
    { title: 'projects/', meta: String(count('projects')), cmd: 'ls projects' },
    {
      title: 'thoughts/',
      meta: `${count('thoughts')} + archive`,
      cmd: 'ls thoughts',
    },
    { title: 'play/', meta: String(count('play')), cmd: 'ls play' },
    { title: 'me.md', meta: 'about', cmd: 'man jasper' },
  ]
  if (showHidden)
    items.push({
      title: '.secrets/',
      meta: 'nice try',
      tone: 'muted',
      cmd: 'ls .secrets',
    })
  return { type: 'rows', items }
}

export function projectCards(projects: ShellItem[]): Card[] {
  return projects.map((p) => ({
    title: p.title,
    meta: `${p.kind} · ${p.years}`,
    badge: p.alive ? '● alive' : 'retired',
    cmd: openCmd(p),
  }))
}

export function toyCards(toys: ShellItem[]): Card[] {
  return toys.map((t) => ({
    title: t.title,
    meta: t.game ? 'game' : t.tilt ? 'tilt ✓' : '',
    cmd: openCmd(t),
    color: t.color,
    ink: t.ink,
  }))
}

// Grouped by year: the year shows only on the first row of each group.
// The archive is one collapsed row at the end.
export function thoughtRows(
  thoughts: ShellItem[],
  archive: ShellItem[],
): Row[] {
  let lastYear: number | undefined
  const rows: Row[] = thoughts.map((t) => {
    const k = t.year !== lastYear ? String(t.year) : ''
    lastYear = t.year
    return { k, title: t.title, meta: `${t.minutes} min`, cmd: openCmd(t) }
  })
  if (archive.length) {
    const years = archive.map((a) => a.year ?? 0)
    rows.push({
      title: `▸ archive/ ${Math.min(...years)}–${Math.max(...years)} · ${archive.length} old posts`,
      meta: 'collapsed',
      tone: 'muted',
      cmd: 'ls thoughts/archive',
    })
  }
  return rows
}

export function archiveRows(archive: ShellItem[]): Row[] {
  return archive.map((t) => ({
    k: String(t.year),
    title: t.title,
    meta: `${t.minutes} min · archive`,
    cmd: openCmd(t),
  }))
}
