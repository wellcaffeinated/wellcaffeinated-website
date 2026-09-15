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

type Article = Thought | ArchivePost
type Entry = Article | Project | Toy

const newestFirst = (a: Article, b: Article) =>
  b.data.pubDate.getTime() - a.data.pubDate.getTime()

const byOrder = (a: Project | Toy, b: Project | Toy) =>
  a.data.order - b.data.order || a.data.title.localeCompare(b.data.title)

const published = (entry: Article) => !entry.data.draft

export async function getThoughts(): Promise<Thought[]> {
  return (await getCollection('thoughts', published)).sort(newestFirst)
}

export async function getArchive(): Promise<ArchivePost[]> {
  return (await getCollection('archive', published)).sort(newestFirst)
}

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort(byOrder)
}

export async function getToys(): Promise<Toy[]> {
  return (await getCollection('play')).sort(byOrder)
}

export function minutes(entry: Article): number {
  return readingMinutes(entry.body ?? '')
}

/** Previous and next entries in an already-sorted list. */
export function neighbours<T extends { id: string }>(
  list: T[],
  id: string,
): { prev?: T; next?: T } {
  const i = list.findIndex((entry) => entry.id === id)
  return { prev: list[i - 1], next: list[i + 1] }
}

function baseItem(entry: Entry) {
  return {
    slug: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    tags: entry.data.tags,
    href: itemHref(entry.collection, entry.id),
  }
}

function articleItem(entry: Article): ShellItem {
  return {
    ...baseItem(entry),
    section: entry.collection,
    date: entry.data.pubDate.toISOString(),
    year: entry.data.pubDate.getUTCFullYear(),
    minutes: minutes(entry),
  }
}

function projectItem(entry: Project): ShellItem {
  return {
    ...baseItem(entry),
    section: 'projects',
    kind: entry.data.kind,
    years: entry.data.years,
    alive: entry.data.alive,
  }
}

function toyItem(entry: Toy): ShellItem {
  return {
    ...baseItem(entry),
    section: 'play',
    color: entry.data.color,
    ink: entry.data.ink,
    game: entry.data.game,
    tilt: entry.data.tilt,
  }
}

export function toShellItem(entry: Entry): ShellItem {
  if (entry.collection === 'projects') return projectItem(entry)
  if (entry.collection === 'play') return toyItem(entry)
  return articleItem(entry)
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
