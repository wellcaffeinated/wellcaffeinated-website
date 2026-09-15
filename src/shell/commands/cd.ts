import { muted, type SiteCommand, text } from './util'

export const cd: SiteCommand = {
  name: 'cd',
  tier: 'hinted',
  desc: 'goes up. always.',
  run: (args) => {
    if (args[0] === '..') return text(muted('up we go. (nothing happened.)'))
    return text(muted("you're already home."))
  },
}
