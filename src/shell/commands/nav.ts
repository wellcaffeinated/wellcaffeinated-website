// The commands that move you around: help, ls, open, man, play.
import { positional } from '../../lib/shell'
import { findItem, itemsIn } from '../content'
import {
  archiveRows,
  projectCards,
  rootRows,
  thoughtRows,
  toyCards,
} from '../listings'
import { ABOUT_HREF } from '../paths'
import {
  muted,
  notFound,
  SECTION_SUGGESTIONS,
  type SiteCommand,
  text,
} from './util'

const LISTABLE = ['projects', 'thoughts', 'thoughts/archive', 'play']

const help: SiteCommand = {
  name: 'help',
  tier: 'shown',
  desc: 'this list',
  run: (_, { shell }) => ({
    type: 'help',
    rows: [...shell.list('shown'), ...shell.list('hinted')].map((c) => ({
      cmd: c.usage ?? c.name,
      desc: c.desc,
      tier: c.tier,
    })),
    footer: 'there are others. you know how terminals work.',
  }),
}

const ls: SiteCommand = {
  name: 'ls',
  tier: 'shown',
  usage: 'ls projects | thoughts | play',
  desc: 'list things',
  complete: (p) => LISTABLE.filter((s) => s.startsWith(p.replace(/^\.\//, ''))),
  run: (args, { ctx, flags }) => {
    const { index } = ctx
    const what = (positional(args)[0] ?? '')
      .replace(/^\.\//, '')
      .replace(/\/$/, '')
    switch (what) {
      case '':
        return rootRows(index, Boolean(flags.a))
      case 'projects':
        return {
          type: 'cards',
          items: projectCards(itemsIn(index, 'projects')),
        }
      case 'thoughts':
        return {
          type: 'rows',
          items: thoughtRows(
            itemsIn(index, 'thoughts'),
            itemsIn(index, 'archive'),
          ),
        }
      case 'thoughts/archive':
      case 'archive':
        return { type: 'rows', items: archiveRows(itemsIn(index, 'archive')) }
      case 'play':
        return { type: 'cards', items: toyCards(itemsIn(index, 'play')) }
      case '.secrets':
        return text(
          muted(
            'ls: .secrets: permission denied. (there is one real secret. keep poking.)',
          ),
        )
      default:
        return {
          type: 'error',
          message: `ls: ${what}: no such directory`,
          hint: 'try one of these:',
          suggestions: SECTION_SUGGESTIONS,
        }
    }
  },
}

const open: SiteCommand = {
  name: 'open',
  aliases: ['cat'],
  tier: 'hinted',
  usage: 'open <name>',
  desc: 'open anything you see',
  complete: (p, { ctx }) =>
    ctx.index.items
      .map((i) => `${i.section}/${i.slug}`)
      .filter((s) => s.startsWith(p) || s.split('/')[1].startsWith(p)),
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
    return item
      ? { type: 'navigate', href: item.href }
      : notFound(ctx.index, path)
  },
}

const man: SiteCommand = {
  name: 'man',
  tier: 'shown',
  usage: 'man jasper',
  desc: 'the manual. mostly accurate.',
  complete: (p) => ['jasper'].filter((s) => s.startsWith(p)),
  run: (args) => {
    const who = args[0] ?? 'jasper'
    if (who !== 'jasper')
      return text(
        `No manual entry for ${who}.`,
        muted('try: man jasper', 'man jasper'),
      )
    return { type: 'navigate', href: ABOUT_HREF }
  },
}

const play: SiteCommand = {
  name: 'play',
  aliases: ['toys'],
  tier: 'hinted',
  usage: 'play <toy>',
  desc: 'shortcut for open play/<toy>',
  complete: (p, { ctx }) =>
    itemsIn(ctx.index, 'play')
      .map((t) => t.slug)
      .filter((s) => s.startsWith(p)),
  run: (args, { ctx }) => {
    const slug = positional(args)[0]
    if (!slug)
      return { type: 'cards', items: toyCards(itemsIn(ctx.index, 'play')) }
    const toy = findItem(ctx.index, `play/${slug}`)
    return toy
      ? { type: 'navigate', href: toy.href }
      : notFound(ctx.index, `play/${slug}`)
  },
}

export const navCommands: SiteCommand[] = [help, ls, open, man, play]
