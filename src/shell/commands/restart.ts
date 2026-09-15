import type { SiteCommand } from './util'

export const restart: SiteCommand = {
  name: 'restart',
  aliases: ['clear', 'reboot'],
  tier: 'hinted',
  desc: 'start over',
  run: (_, { ctx }) => {
    ctx.restart()
    return null
  },
}
