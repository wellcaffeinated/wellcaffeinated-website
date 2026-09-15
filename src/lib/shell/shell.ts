import { parseFlags, tokenize } from './args'
import { didYouMean } from './fuzzy'
import type { Command, CommandApi, Output, Shell, Tier } from './types'

export interface ShellOptions<Ctx> {
  /** Replaces the default "command not found" output. */
  notFound?: (name: string, shell: Shell<Ctx>) => Output
}

const VISIBLE: Tier[] = ['shown', 'hinted']

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
    for (const a of def.aliases ?? []) aliases.set(a, def.name)
    return def
  }

  function resolve(name: string) {
    return commands.get(name) ?? commands.get(aliases.get(name) ?? '')
  }

  function list(tiers: Tier | Tier[] = ['shown', 'hinted', 'hidden']) {
    const wanted = new Set(Array.isArray(tiers) ? tiers : [tiers])
    return [...commands.values()].filter((c) => wanted.has(c.tier))
  }

  // "./play/foo" reads as `play foo`; "./play" as `play`.
  function normalize(tokens: string[]): [string, string[]] {
    const [first, ...rest] = tokens
    if (!first.startsWith('./')) return [first, rest]
    const parts = first.slice(2).split('/').filter(Boolean)
    const name = parts[0] ?? first
    if (parts.length > 1) rest.unshift(parts.slice(1).join('/'))
    return [name, rest]
  }

  function api(line: string, args: string[]): CommandApi<Ctx> {
    return { ctx, shell, line, flags: parseFlags(args) }
  }

  function notFound(name: string): Output {
    if (options.notFound) return options.notFound(name, shell)
    const guess = didYouMean(
      name,
      list(VISIBLE).map((c) => c.name),
    )
    return {
      type: 'error',
      message: `command not found: ${name}`,
      hint: guess ? `did you mean: ${guess}?` : 'try "help".',
      suggestions: guess ? [{ label: guess, cmd: guess, primary: true }] : [],
    }
  }

  async function run(line: string): Promise<Output | null> {
    const tokens = tokenize(line)
    if (!tokens.length) return null
    const [name, args] = normalize(tokens)
    const def = resolve(name)
    if (!def) return notFound(name)
    try {
      return await def.run(args, api(line, args))
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      return { type: 'error', message: `${name}: ${message}` }
    }
  }

  // Hidden commands never complete; discovery is the point.
  function complete(partial: string): string[] {
    const tokens = tokenize(partial)
    const trailingSpace = /\s$/.test(partial)
    if (!tokens.length) return []
    if (tokens.length === 1 && !trailingSpace) {
      return list(VISIBLE)
        .map((c) => c.name)
        .filter((n) => n.startsWith(tokens[0]) && n !== tokens[0])
        .map((n) => `${n} `)
    }
    const [name, args] = normalize(tokens)
    const def = resolve(name)
    if (!def?.complete) return []
    const arg = trailingSpace ? '' : (args.at(-1) ?? '')
    const head = trailingSpace ? tokens : tokens.slice(0, -1)
    return def
      .complete(arg, api(partial, args))
      .filter((c) => c !== arg)
      .map((c) => [...head, c].join(' '))
  }

  const shell: Shell<Ctx> = { register, resolve, run, complete, list }
  return shell
}
