// Hidden commands whose whole behaviour is a fixed reply. They share a file
// because each one is a line of data, not a command with logic.
import type { TextLine } from '../../lib/shell'
import { muted, type SiteCommand, text } from './util'

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

export const oneLiners: SiteCommand[] = [
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
    { aliases: ['quit', 'logout'] },
  ),
  oneLiner('ping', ['pong. (minutephysics)']),
  oneLiner('curl', ['inspiration. go.'], { aliases: ['wget'] }),
]
