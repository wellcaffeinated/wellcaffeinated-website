import { isTheme, THEMES } from '../theme'
import { muted, type SiteCommand, text } from './util'

/** Themes that exist in the CSS but are only reachable by discovery. */
const LOCKED_THEMES = ['crt', 'matrix']

const THEME_LIST = THEMES.join(', ')

export const theme: SiteCommand = {
  name: 'theme',
  tier: 'hinted',
  usage: `theme ${THEMES.join(' | ')} | ???`,
  desc: 'change the light',
  complete: (partial) => THEMES.filter((name) => name.startsWith(partial)),
  run: (args, { ctx }) => {
    const name = args[0]
    if (!name) {
      return text(`themes: ${THEME_LIST}`, muted('…and some you have to find.'))
    }
    if (isTheme(name)) {
      ctx.setTheme(name)
      return text(muted(`theme → ${name}`))
    }
    if (LOCKED_THEMES.includes(name)) {
      return text(muted(`theme ${name}: locked. keep poking.`))
    }
    return text(muted(`theme: ${name}: unknown. themes: ${THEME_LIST}`))
  },
}
