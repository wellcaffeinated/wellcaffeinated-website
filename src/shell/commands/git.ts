import { muted, type SiteCommand, text } from './util'

const FAKE_LOG = [
  'a1b2c3d retired, fondly.',
  'e4f5a6b made it faster',
  '0c0ffee initial commit (2013)',
]

export const git: SiteCommand = {
  name: 'git',
  tier: 'hidden',
  run: (args) => {
    const subcommand = args[0] ?? ''
    if (subcommand === 'log')
      return text(...FAKE_LOG.map((line) => muted(line)))
    return text(
      muted(
        `git: '${subcommand}' is not a git command. neither is this a repo.`,
      ),
    )
  },
}
