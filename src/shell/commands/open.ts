import { positional } from '../../lib/shell'
import { findItem } from '../content'
import { muted, notFound, type SiteCommand, text } from './util'

export const open: SiteCommand = {
  name: 'open',
  aliases: ['cat'],
  tier: 'hinted',
  usage: 'open <name>',
  desc: 'open anything you see',
  complete: (partial, { ctx }) =>
    ctx.index.items
      .map((item) => `${item.section}/${item.slug}`)
      .filter(
        (path) =>
          path.startsWith(partial) || path.split('/')[1].startsWith(partial),
      ),
  run: (args, { ctx }) => {
    const path = positional(args)[0]
    if (!path) return text(muted('open what? try "ls".'))
    if (path === 'hello.md') {
      const html = ctx.fragment('hello')
      return html
        ? { type: 'html', html }
        : text(muted('hello.md: gone quiet.'))
    }
    if (path === '/dev/null') return text(muted("it's very quiet in here."))
    const item = findItem(ctx.index, path)
    if (!item) return notFound(ctx.index, path)
    return { type: 'navigate', href: item.href }
  },
}
