// Every command is a URL. Commands that produce shell output live in the hash
// of the shell page (`/#ls+projects`) so back/forward replays them; commands
// that open content point at that content's real page.
import { findItem, isSection, type ShellIndex } from './content'
import { ABOUT_HREF, sectionHref } from './paths'

export const SHELL_PATH = '/'

export function hashFor(cmd: string): string {
  const words = cmd.trim().split(/\s+/)
  return `#${words.map((w) => encodeURIComponent(w).replace(/%2F/gi, '/')).join('+')}`
}

export function commandFromHash(hash: string): string {
  return decodeCommand(hash.replace(/^#/, ''))
}

/**
 * Markdown links can run commands: `[projects](cmd:ls+projects)`. Spaces are
 * written as `+` because CommonMark link destinations cannot contain spaces.
 */
export const CMD_PROTOCOL = 'cmd:'

export function commandFromHref(href: string): string | null {
  if (!href.startsWith(CMD_PROTOCOL)) return null
  return decodeCommand(href.slice(CMD_PROTOCOL.length))
}

function decodeCommand(encoded: string): string {
  if (!encoded) return ''
  try {
    return encoded.split('+').map(decodeURIComponent).join(' ').trim()
  } catch {
    return ''
  }
}

/** The best real URL for a command: a static page when one exists, else the shell. */
export function hrefFor(cmd: string, index?: ShellIndex): string {
  const [name, arg = ''] = cmd.trim().split(/\s+/)
  const target = arg.replace(/^\.?\/+/, '').replace(/\/+$/, '')
  if (name === 'ls' && isSection(target)) return sectionHref(target)
  if (name === 'ls' && target === 'thoughts/archive')
    return sectionHref('archive')
  if (name === 'man' && (target === 'jasper' || !target)) return ABOUT_HREF
  if ((name === 'open' || name === 'cat') && index) {
    const item = findItem(index, target)
    if (item) return item.href
  }
  if (name === 'play' && index && target) {
    const item = findItem(index, `play/${target}`)
    if (item) return item.href
  }
  return SHELL_PATH + hashFor(cmd)
}

export function onShellPage(): boolean {
  return location.pathname === SHELL_PATH
}
