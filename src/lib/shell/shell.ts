import { parseFlags, tokenize } from './args'
import { didYouMean } from './fuzzy'
import type { Command, CommandApi, Output, Shell, Tier } from './types'

export interface ShellOptions<Ctx> {
  /** Replaces the default "command not found" output. */
  notFound?: (name: string, shell: Shell<Ctx>) => Output
}

const ALL_TIERS: Tier[] = ['shown', 'hinted', 'hidden']
const VISIBLE_TIERS: Tier[] = ['shown', 'hinted']

const DOT_SLASH = './'

/** "./play/foo" reads as `play foo`; "./play" as `play`. */
function normalize(tokens: string[]): [string, string[]] {
  const [first, ...rest] = tokens
  if (!first.startsWith(DOT_SLASH)) return [first, rest]
  const [name = first, ...subpath] = first
    .slice(DOT_SLASH.length)
    .split('/')
    .filter(Boolean)
  if (subpath.length === 0) return [name, rest]
  return [name, [subpath.join('/'), ...rest]]
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

/**
 * A command registry plus a dispatcher. Knows nothing about the UI or the
 * site: `ctx` is whatever the host wants commands to be able to reach.
 */
export function createShell<Ctx>(
  ctx: Ctx,
  options: ShellOptions<Ctx> = {},
): Shell<Ctx> {
  const commands = new Map<string, Command<Ctx>>()
  const aliases = new Map<string, string>()

  function register(def: Command<Ctx>) {
    commands.set(def.name, def)
    for (const alias of def.aliases ?? []) {
      aliases.set(alias, def.name)
    }
    return def
  }

  function resolve(name: string) {
    return commands.get(name) ?? commands.get(aliases.get(name) ?? '')
  }

  function list(tiers: Tier | Tier[] = ALL_TIERS) {
    const wanted = new Set(Array.isArray(tiers) ? tiers : [tiers])
    return [...commands.values()].filter((command) => wanted.has(command.tier))
  }

  function visibleNames() {
    return list(VISIBLE_TIERS).map((command) => command.name)
  }

  function api(line: string, args: string[]): CommandApi<Ctx> {
    return { ctx, shell, line, flags: parseFlags(args) }
  }

  function notFound(name: string): Output {
    if (options.notFound) return options.notFound(name, shell)
    const guess = didYouMean(name, visibleNames())
    return {
      type: 'error',
      message: `command not found: ${name}`,
      hint: guess ? `did you mean: ${guess}?` : 'try "help".',
      suggestions: guess ? [{ label: guess, cmd: guess, primary: true }] : [],
    }
  }

  async function run(line: string): Promise<Output | null> {
    const tokens = tokenize(line)
    if (tokens.length === 0) return null
    const [name, args] = normalize(tokens)
    const def = resolve(name)
    if (!def) return notFound(name)
    try {
      return await def.run(args, api(line, args))
    } catch (error) {
      return { type: 'error', message: `${name}: ${errorMessage(error)}` }
    }
  }

  function completeName(partial: string): string[] {
    return visibleNames()
      .filter((name) => name.startsWith(partial) && name !== partial)
      .map((name) => `${name} `)
  }

  // Hidden commands never complete; discovery is the point.
  function complete(partial: string): string[] {
    const tokens = tokenize(partial)
    if (tokens.length === 0) return []
    const trailingSpace = /\s$/.test(partial)
    if (tokens.length === 1 && !trailingSpace) return completeName(tokens[0])
    const [name, args] = normalize(tokens)
    const def = resolve(name)
    if (!def?.complete) return []
    const arg = trailingSpace ? '' : (args.at(-1) ?? '')
    const head = trailingSpace ? tokens : tokens.slice(0, -1)
    return def
      .complete(arg, api(partial, args))
      .filter((completion) => completion !== arg)
      .map((completion) => [...head, completion].join(' '))
  }

  const shell: Shell<Ctx> = { register, resolve, run, complete, list }
  return shell
}
