import type { Shell } from '../../lib/shell'
import type { SiteCtx } from '../context'
import { searchCommands } from './grep'
import { hiddenCommands } from './hidden'
import { navCommands } from './nav'
import { systemCommands } from './system'

// Adding a feature to the shell = adding one command object to one of these
// files. If it needs a new output shape, add it to src/lib/shell/types.ts and
// one branch to src/shell/render.ts.
export function registerCommands(shell: Shell<SiteCtx>): void {
  for (const c of [
    ...navCommands,
    ...searchCommands,
    ...systemCommands,
    ...hiddenCommands,
  ]) {
    shell.register(c)
  }
}
