import { positional } from '../../lib/shell'
import type { Hit } from '../search'
import { search } from '../search'
import { muted, openCmd, type SiteCommand, text } from './util'

const toSearchHit = (hit: Hit) => ({
  title: hit.item.title,
  meta: [hit.item.year ?? hit.item.years, hit.item.section]
    .filter(Boolean)
    .join(' · '),
  before: hit.before,
  match: hit.match,
  after: hit.after,
  cmd: openCmd(hit.item),
})

const pluralMatches = (count: number) =>
  count === 1 ? '1 match' : `${count} matches`

export const grep: SiteCommand = {
  name: 'grep',
  aliases: ['search', 'find'],
  tier: 'hinted',
  usage: 'grep <word>',
  desc: 'search everything',
  run: (args, { ctx }) => {
    const query = positional(args).join(' ')
    if (!query) return text(muted('grep what?'))
    const hits = search(ctx.index, query)
    return {
      type: 'search',
      summary: pluralMatches(hits.length),
      items: hits.map(toSearchHit),
    }
  },
}
