// Commands about the shell itself: theme, history, restart, cd.
import { isTheme, THEMES } from '../theme'
import { muted, type SiteCommand, text } from './util'

const LOCKED_THEMES = ['crt', 'matrix']

const theme: SiteCommand = {
  name: 'theme',
  tier: 'hinted',
  usage: `theme ${THEMES.join(' | ')} | ???`,
  desc: 'change the light',
  complete: (p) => THEMES.filter((t) => t.startsWith(p)),
  run: (args, { ctx }) => {
    const t = args[0]
    if (!t)
      return text(
        `themes: ${THEMES.join(', ')}`,
        muted('…and some you have to find.'),
      )
    if (isTheme(t)) {
      ctx.setTheme(t)
      return text(muted(`theme → ${t}`))
    }
    if (LOCKED_THEMES.includes(t))
      return text(muted(`theme ${t}: locked. keep poking.`))
    return text(muted(`theme: ${t}: unknown. themes: ${THEMES.join(', ')}`))
  },
}

const history: SiteCommand = {
  name: 'history',
  tier: 'hinted',
  desc: 'where you have been',
  run: (_, { ctx }) => ({
    type: 'rows',
    items: ctx
      .history()
      .map((line, i) => ({ k: String(i + 1), title: line, cmd: line })),
  }),
}

const cd: SiteCommand = {
  name: 'cd',
  tier: 'hinted',
  desc: 'goes up. always.',
  run: (args) =>
    text(
      muted(
        args[0] === '..'
          ? 'up we go. (nothing happened.)'
          : "you're already home.",
      ),
    ),
}

const restart: SiteCommand = {
  name: 'restart',
  aliases: ['clear', 'reboot'],
  tier: 'hinted',
  desc: 'start over',
  run: (_, { ctx }) => {
    ctx.restart()
    return null
  },
}

export const systemCommands: SiteCommand[] = [theme, history, cd, restart]
