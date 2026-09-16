import type { Flags, Output } from '../../lib/shell'
import { positional } from '../../lib/shell'
import { itemsIn, type ShellIndex } from '../content'
import {
  archiveRows,
  projectCards,
  rootRows,
  thoughtRows,
  toyCards,
} from '../listings'
import { muted, SECTION_SUGGESTIONS, type SiteCommand, text } from './util'

type Listing = (index: ShellIndex, flags: Flags) => Output

const listArchive: Listing = (index) => ({
  type: 'rows',
  items: archiveRows(itemsIn(index, 'archive')),
})

const LISTINGS: Record<string, Listing> = {
  '': (index, flags) => rootRows(index, Boolean(flags.a)),
  projects: (index) => ({
    type: 'cards',
    items: projectCards(itemsIn(index, 'projects')),
  }),
  thoughts: (index) => ({
    type: 'rows',
    items: thoughtRows(itemsIn(index, 'thoughts'), itemsIn(index, 'archive')),
  }),
  'thoughts/archive': listArchive,
  archive: listArchive,
  play: (index) => ({ type: 'cards', items: toyCards(itemsIn(index, 'play')) }),
  '.secrets': () =>
    text(
      muted(
        'ls: .secrets: permission denied. (there is one real secret. keep poking.)',
      ),
    ),
}

const LISTABLE = ['projects', 'thoughts', 'thoughts/archive', 'play']

const stripDots = (path: string) => path.replace(/^\.\//, '')
const stripTrailingSlash = (path: string) => path.replace(/\/$/, '')

export const ls: SiteCommand = {
  name: 'ls',
  tier: 'shown',
  usage: 'ls projects | thoughts | play',
  desc: 'list things',
  complete: (partial) =>
    LISTABLE.filter((dir) => dir.startsWith(stripDots(partial))),
  run: (args, { ctx, flags }) => {
    const what = stripTrailingSlash(stripDots(positional(args)[0] ?? ''))
    const listing = LISTINGS[what]
    if (!listing) {
      return {
        type: 'error',
        message: `ls: ${what}: no such directory`,
        hint: 'try one of these:',
        suggestions: SECTION_SUGGESTIONS,
      }
    }
    return listing(ctx.index, flags)
  },
}
