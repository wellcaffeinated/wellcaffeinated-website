import { ABOUT_HREF } from '../paths'
import { muted, type SiteCommand, text } from './util'

const MANUAL_ENTRIES = ['jasper']

export const man: SiteCommand = {
  name: 'man',
  tier: 'shown',
  usage: 'man jasper',
  desc: 'the manual. mostly accurate.',
  complete: (partial) =>
    MANUAL_ENTRIES.filter((entry) => entry.startsWith(partial)),
  run: (args) => {
    const who = args[0] ?? 'jasper'
    if (who !== 'jasper') {
      return text(
        `No manual entry for ${who}.`,
        muted('try: man jasper', 'man jasper'),
      )
    }
    return { type: 'navigate', href: ABOUT_HREF }
  },
}
