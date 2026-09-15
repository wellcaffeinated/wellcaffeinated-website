// Never listed, never tab-completed. Found by poking.
import type { TextLine } from '../../lib/shell'
import { itemsIn } from '../content'
import { muted, openCmd, type SiteCommand, text } from './util'

const oneLiner = (
  name: string,
  lines: (string | TextLine)[],
  extra: Partial<SiteCommand> = {},
): SiteCommand => ({
  name,
  tier: 'hidden',
  run: () => text(...lines),
  ...extra,
})

const oneLiners: SiteCommand[] = [
  oneLiner('pwd', ['Wherever you go, there you are.']),
  oneLiner('whoami', [
    'guest. (you, presumably)',
    muted('did you mean: man jasper?', 'man jasper'),
  ]),
  oneLiner('who', ["jasper, and you. it's quiet."]),
  oneLiner('uptime', ['since 2012. mostly.']),
  oneLiner('sudo', [
    'guest is not in the sudoers file.',
    muted('this incident will not be reported.'),
  ]),
  oneLiner('vim', ['no.'], { aliases: ['vi', 'emacs', 'nano'] }),
  oneLiner(':q', ["you're free."]),
  oneLiner(
    'exit',
    ["you can't leave. there's no door.", muted('(there is a ☰ though.)')],
    {
      aliases: ['quit', 'logout'],
    },
  ),
  oneLiner('ping', ['pong. (minutephysics)']),
  oneLiner('curl', ['inspiration. go.'], { aliases: ['wget'] }),
]

const date: SiteCommand = {
  name: 'date',
  tier: 'hidden',
  run: () => text(new Date().toString(), muted('you have time.')),
}

const echo: SiteCommand = {
  name: 'echo',
  tier: 'hidden',
  run: (args) => text(args.join(' ')),
}

const fortune: SiteCommand = {
  name: 'fortune',
  tier: 'hidden',
  run: (_, { ctx }) => {
    const pool = [
      ...itemsIn(ctx.index, 'archive'),
      ...itemsIn(ctx.index, 'thoughts'),
    ]
    const pick = pool[Math.floor(Math.random() * pool.length)]
    if (!pick) return text(muted('the cookie was empty.'))
    return text(
      `"${pick.title}"`,
      muted(`— ${pick.year}. open it?`, openCmd(pick)),
    )
  },
}

const rm: SiteCommand = {
  name: 'rm',
  tier: 'hidden',
  run: (args, { ctx }) => {
    if (args.join(' ') === '-rf /') {
      ctx.breakEverything()
      return null
    }
    return text(muted('rm: refusing. this is a website.'))
  },
}

const git: SiteCommand = {
  name: 'git',
  tier: 'hidden',
  run: (args) => {
    if (args[0] === 'log') {
      return text(
        muted('a1b2c3d retired, fondly.'),
        muted('e4f5a6b made it faster'),
        muted('0c0ffee initial commit (2013)'),
      )
    }
    return text(
      muted(
        `git: '${args[0] ?? ''}' is not a git command. neither is this a repo.`,
      ),
    )
  },
}

export const hiddenCommands: SiteCommand[] = [
  ...oneLiners,
  date,
  echo,
  fortune,
  rm,
  git,
]
