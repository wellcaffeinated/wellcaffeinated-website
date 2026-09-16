// One command per file. Adding a feature to the shell = adding one file here
// and one line to this list. If it needs a new output shape, add it to
// src/lib/shell/types.ts and one renderer to src/shell/render.ts.
import type { Shell } from '../../lib/shell'
import type { SiteCtx } from '../context'
import { cd } from './cd'
import { date } from './date'
import { echo } from './echo'
import { fortune } from './fortune'
import { git } from './git'
import { grep } from './grep'
import { help } from './help'
import { history } from './history'
import { ls } from './ls'
import { man } from './man'
import { oneLiners } from './one-liners'
import { open } from './open'
import { play } from './play'
import { restart } from './restart'
import { rm } from './rm'
import { theme } from './theme'
import type { SiteCommand } from './util'

/** Registration order is `help` order within each tier. */
const COMMANDS: SiteCommand[] = [
  // shown
  help,
  ls,
  man,
  // hinted
  open,
  play,
  grep,
  theme,
  history,
  cd,
  restart,
  // hidden
  ...oneLiners,
  date,
  echo,
  fortune,
  rm,
  git,
]

export function registerCommands(shell: Shell<SiteCtx>): void {
  COMMANDS.forEach(shell.register)
}
