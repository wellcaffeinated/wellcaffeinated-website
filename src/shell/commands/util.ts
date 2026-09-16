import type { Command, Output, Suggestion, TextLine } from '../../lib/shell'
import { CHIPS } from '../config'
import type { ShellIndex } from '../content'
import type { SiteCtx } from '../context'
import { openCmd } from '../listings'
import { searchWords } from '../search'

export type SiteCommand = Command<SiteCtx>

const toTextLine = (line: string | TextLine): TextLine =>
  typeof line === 'string' ? { text: line } : line

export const text = (...lines: (string | TextLine)[]): Output => ({
  type: 'text',
  lines: lines.map(toTextLine),
})

export const muted = (text: string, cmd?: string): TextLine => ({
  text,
  tone: 'muted',
  cmd,
})

export const SECTION_SUGGESTIONS: Suggestion[] = CHIPS.map((chip) => ({
  label: chip.label,
  cmd: chip.cmd,
}))

export { openCmd }

/** 404 as a failed command: honest line, fuzzy search of the path's words, the chips. */
export function notFound(index: ShellIndex, path: string): Output {
  const hits = searchWords(index, path)
  return {
    type: 'error',
    code: 404,
    message: `404: no such file: ${path}`,
    hint: hits.length
      ? 'searched everything for those words…'
      : 'nothing matched. from the top:',
    suggestions: [
      ...hits.map((hit) => ({
        label: hit.item.title,
        cmd: openCmd(hit.item),
        primary: true,
      })),
      ...SECTION_SUGGESTIONS,
    ],
  }
}
