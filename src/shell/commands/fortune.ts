import { itemsIn } from '../content'
import { muted, openCmd, type SiteCommand, text } from './util'

const randomOf = <T>(list: T[]): T | undefined =>
  list[Math.floor(Math.random() * list.length)]

export const fortune: SiteCommand = {
  name: 'fortune',
  tier: 'hidden',
  run: (_, { ctx }) => {
    const pick = randomOf([
      ...itemsIn(ctx.index, 'archive'),
      ...itemsIn(ctx.index, 'thoughts'),
    ])
    if (!pick) return text(muted('the cookie was empty.'))
    return text(
      `"${pick.title}"`,
      muted(`— ${pick.year}. open it?`, openCmd(pick)),
    )
  },
}
