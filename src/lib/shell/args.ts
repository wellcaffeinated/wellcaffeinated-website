import type { Flags } from './types'

/** Splits a line on whitespace, keeping quoted strings together. */
export function tokenize(line: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  for (const m of line.matchAll(re)) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

export function parseFlags(args: string[]): Flags {
  const flags: Flags = {}
  for (const a of args) {
    if (a.startsWith('--')) flags[a.slice(2)] = true
    else if (/^-[a-z]+$/i.test(a)) for (const ch of a.slice(1)) flags[ch] = true
  }
  return flags
}

export function positional(args: string[]): string[] {
  return args.filter((a) => !a.startsWith('-'))
}
