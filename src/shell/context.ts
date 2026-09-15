// What commands are allowed to reach. The host (host.ts) implements this; the
// commands only see this interface. Add to it deliberately: it is the only way
// a command causes a side effect.
import type { Output } from '../lib/shell'
import type { ShellIndex } from './content'
import type { Theme } from './theme'

export interface SiteCtx {
  index: ShellIndex
  setTheme(theme: Theme): void
  restart(): void
  openMenu(): void
  history(): string[]
  /** The `rm -rf /` gag. Ends in a restart. */
  breakEverything(): void
  /** Server-rendered markup embedded in the page, by name (e.g. "hello"). */
  fragment(name: string): string | null
}

export type SiteOutput = Output
