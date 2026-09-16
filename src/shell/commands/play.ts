import { positional } from '../../lib/shell'
import { findItem, itemsIn } from '../content'
import { toyCards } from '../listings'
import { notFound, type SiteCommand } from './util'

export const play: SiteCommand = {
  name: 'play',
  aliases: ['toys'],
  tier: 'hinted',
  usage: 'play <toy>',
  desc: 'shortcut for open play/<toy>',
  complete: (partial, { ctx }) =>
    itemsIn(ctx.index, 'play')
      .map((toy) => toy.slug)
      .filter((slug) => slug.startsWith(partial)),
  run: (args, { ctx }) => {
    const slug = positional(args)[0]
    if (!slug) {
      return { type: 'cards', items: toyCards(itemsIn(ctx.index, 'play')) }
    }
    const toy = findItem(ctx.index, `play/${slug}`)
    if (!toy) return notFound(ctx.index, `play/${slug}`)
    return { type: 'navigate', href: toy.href }
  },
}
