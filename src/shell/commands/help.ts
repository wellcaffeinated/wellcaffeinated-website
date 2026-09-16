import type { SiteCommand } from './util'

export const help: SiteCommand = {
  name: 'help',
  tier: 'shown',
  desc: 'this list',
  run: (_, { shell }) => ({
    type: 'help',
    rows: [...shell.list('shown'), ...shell.list('hinted')].map((command) => ({
      cmd: command.usage ?? command.name,
      desc: command.desc,
      tier: command.tier,
    })),
    footer: 'there are others. you know how terminals work.',
  }),
}
