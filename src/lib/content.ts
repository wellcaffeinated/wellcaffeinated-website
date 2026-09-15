// Server-side content helpers shared by pages and the shell index endpoint.
// Sorting and filtering rules live here so every list agrees.
import { type CollectionEntry, getCollection } from 'astro:content'
import type { ShellItem } from '../shell/content'
import { itemHref } from '../shell/paths'
import { readingMinutes } from './reading-time'

export type Thought = CollectionEntry<'thoughts'>
export type ArchivePost = CollectionEntry<'archive'>
export type Project = CollectionEntry<'projects'>
export type Toy = CollectionEntry<'play'>

const newestFirst = (a: Thought | ArchivePost, b: Thought | ArchivePost) =>
  b.data.pubDate.getTime() - a.data.pubDate.getTime()

const byOrder = (a: Project | Toy, b: Project | Toy) =>
  a.data.order - b.data.order || a.data.title.localeCompare(b.data.title)

export async function getThoughts(): Promise<Thought[]> {
  return (await getCollection('thoughts', (e) => !e.data.draft)).sort(
    newestFirst,
  )
}

export async function getArchive(): Promise<ArchivePost[]> {
  return (await getCollection('archive', (e) => !e.data.draft)).sort(
    newestFirst,
  )
}

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort(byOrder)
}

export async function getToys(): Promise<Toy[]> {
  return (await getCollection('play')).sort(byOrder)
}

export function minutes(entry: Thought | ArchivePost): number {
  return readingMinutes(entry.body ?? '')
}

/** Previous and next entries in an already-sorted list. */
export function neighbours<T extends { id: string }>(
  list: T[],
  id: string,
): { prev?: T; next?: T } {
  const i = list.findIndex((e) => e.id === id)
  return { prev: list[i - 1], next: list[i + 1] }
}

export function toShellItem(
  entry: Thought | ArchivePost | Project | Toy,
): ShellItem {
  const base = {
    slug: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    tags: entry.data.tags,
  }
  switch (entry.collection) {
    case 'thoughts':
    case 'archive':
      return {
        ...base,
        section: entry.collection,
        href: itemHref(entry.collection, entry.id),
        date: entry.data.pubDate.toISOString(),
        year: entry.data.pubDate.getUTCFullYear(),
        minutes: minutes(entry),
      }
    case 'projects':
      return {
        ...base,
        section: 'projects',
        href: itemHref('projects', entry.id),
        kind: entry.data.kind,
        years: entry.data.years,
        alive: entry.data.alive,
      }
    case 'play':
      return {
        ...base,
        section: 'play',
        href: itemHref('play', entry.id),
        color: entry.data.color,
        ink: entry.data.ink,
        game: entry.data.game,
        tilt: entry.data.tilt,
      }
  }
}

export async function buildShellIndex(): Promise<ShellItem[]> {
  const [projects, thoughts, archive, toys] = await Promise.all([
    getProjects(),
    getThoughts(),
    getArchive(),
    getToys(),
  ])
  return [...projects, ...thoughts, ...archive, ...toys].map(toShellItem)
}
