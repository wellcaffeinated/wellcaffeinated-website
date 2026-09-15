import { positional } from '../../lib/shell'
import { search } from '../search'
import { muted, openCmd, type SiteCommand, text } from './util'

const grep: SiteCommand = {
  name: 'grep',
  aliases: ['search', 'find'],
  tier: 'hinted',
  usage: 'grep <word>',
  desc: 'search everything',
  run: (args, { ctx }) => {
    const q = positional(args).join(' ')
    if (!q) return text(muted('grep what?'))
    const hits = search(ctx.index, q)
    return {
      type: 'search',
      summary: `${hits.length} match${hits.length === 1 ? '' : 'es'}`,
      items: hits.map((h) => ({
        title: h.item.title,
        meta: [h.item.year ?? h.item.years, h.item.section]
          .filter(Boolean)
          .join(' · '),
        before: h.before,
        match: h.match,
        after: h.after,
        cmd: openCmd(h.item),
      })),
    }
  },
}

export const searchCommands: SiteCommand[] = [grep]
