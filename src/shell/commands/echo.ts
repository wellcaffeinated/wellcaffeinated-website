import type { SiteCommand } from './util'
import { text } from './util'

export const echo: SiteCommand = {
  name: 'echo',
  tier: 'hidden',
  run: (args) => text(args.join(' ')),
}
