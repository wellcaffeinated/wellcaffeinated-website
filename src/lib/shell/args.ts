import type { Flags } from './types'

const TOKEN_PATTERN = /"([^"]*)"|'([^']*)'|(\S+)/g
const LONG_FLAG_PREFIX = '--'
const SHORT_FLAGS_PATTERN = /^-[a-z]+$/i

/** Splits a line on whitespace, keeping quoted strings together. */
export function tokenize(line: string): string[] {
  return [...line.matchAll(TOKEN_PATTERN)].map(
    ([, doubleQuoted, singleQuoted, bare]) =>
      doubleQuoted ?? singleQuoted ?? bare,
  )
}

/** `--all` → ["all"]; `-la` → ["l", "a"]; anything else → []. */
function flagNames(arg: string): string[] {
  if (arg.startsWith(LONG_FLAG_PREFIX))
    return [arg.slice(LONG_FLAG_PREFIX.length)]
  if (SHORT_FLAGS_PATTERN.test(arg)) return [...arg.slice(1)]
  return []
}

export function parseFlags(args: string[]): Flags {
  return Object.fromEntries(
    args.flatMap(flagNames).map((name) => [name, true] as const),
  )
}

export function positional(args: string[]): string[] {
  return args.filter((arg) => !arg.startsWith('-'))
}
