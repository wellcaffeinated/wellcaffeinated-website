import type { SiteCommand } from './util'

export const history: SiteCommand = {
  name: 'history',
  tier: 'hinted',
  desc: 'where you have been',
  run: (_, { ctx }) => ({
    type: 'rows',
    items: ctx.history().map((line, index) => ({
      k: String(index + 1),
      title: line,
      cmd: line,
    })),
  }),
}
