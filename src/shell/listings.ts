// Index items → list descriptors. Pure functions shared by the `ls` command
// (browser) and the static section pages (build), so both agree on what a
// listing looks like.

import type { Card, Output, Row } from '../lib/shell'
import { STATUS_LABELS } from '../lib/status'
import { itemsIn, type ShellIndex, type ShellItem } from './content'

export const openCmd = (item: Pick<ShellItem, 'section' | 'slug'>) =>
  `open ${item.section}/${item.slug}`

const markOf = (item: ShellItem) =>
  item.status ? STATUS_LABELS[item.status] : undefined

/** The mark leads, so an unpublished row reads as unpublished first. */
const withMark = (item: ShellItem, meta: string) => {
  const mark = markOf(item)
  if (!mark) return meta
  return meta ? `${mark} · ${meta}` : mark
}

const SECRETS_ROW: Row = {
  title: '.secrets/',
  meta: 'nice try',
  tone: 'muted',
  cmd: 'ls .secrets',
}

export function rootRows(index: ShellIndex, showHidden: boolean): Output {
  const count = (section: ShellItem['section']) =>
    String(itemsIn(index, section).length)
  const items: Row[] = [
    { title: 'projects/', meta: count('projects'), cmd: 'ls projects' },
    {
      title: 'thoughts/',
      meta: `${count('thoughts')} + archive`,
      cmd: 'ls thoughts',
    },
    { title: 'play/', meta: count('play'), cmd: 'ls play' },
    { title: 'me.md', meta: 'about', cmd: 'man jasper' },
    ...(showHidden ? [SECRETS_ROW] : []),
  ]
  return { type: 'rows', items }
}

export function projectCards(projects: ShellItem[]): Card[] {
  return projects.map((project) => ({
    title: project.title,
    meta: `${project.kind} · ${project.years}`,
    badge: markOf(project) ?? (project.alive ? '● alive' : 'retired'),
    cmd: openCmd(project),
  }))
}

function toyMeta(toy: ShellItem): string {
  if (toy.game) return 'game'
  if (toy.tilt) return 'tilt ✓'
  return ''
}

export function toyCards(toys: ShellItem[]): Card[] {
  return toys.map((toy) => ({
    title: toy.title,
    meta: toyMeta(toy),
    badge: markOf(toy),
    cmd: openCmd(toy),
    color: toy.color,
    ink: toy.ink,
  }))
}

/** The year shows only on the first row of each year's group. */
function yearKey(thought: ShellItem, previous: ShellItem | undefined): string {
  return thought.year === previous?.year ? '' : String(thought.year)
}

function archiveSummaryRow(archive: ShellItem[]): Row {
  const years = archive.map((post) => post.year ?? 0)
  const span = `${Math.min(...years)}–${Math.max(...years)}`
  return {
    title: `▸ archive/ ${span} · ${archive.length} old posts`,
    meta: 'collapsed',
    tone: 'muted',
    cmd: 'ls thoughts/archive',
  }
}

/** Grouped by year, with the archive as one collapsed row at the end. */
export function thoughtRows(
  thoughts: ShellItem[],
  archive: ShellItem[],
): Row[] {
  const rows: Row[] = thoughts.map((thought, i) => ({
    k: yearKey(thought, thoughts[i - 1]),
    title: thought.title,
    meta: withMark(thought, `${thought.minutes} min`),
    cmd: openCmd(thought),
  }))
  if (archive.length === 0) return rows
  return [...rows, archiveSummaryRow(archive)]
}

export function archiveRows(archive: ShellItem[]): Row[] {
  return archive.map((post) => ({
    k: String(post.year),
    title: post.title,
    meta: withMark(post, `${post.minutes} min · archive`),
    cmd: openCmd(post),
  }))
}
