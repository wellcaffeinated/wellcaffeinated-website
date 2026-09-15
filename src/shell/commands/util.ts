import type { Command, Output, Suggestion, TextLine } from '../../lib/shell'
import { CHIPS } from '../config'
import type { ShellIndex } from '../content'
import type { SiteCtx } from '../context'
import { openCmd } from '../listings'
import { searchWords } from '../search'

export type SiteCommand = Command<SiteCtx>

export const text = (...lines: (string | TextLine)[]): Output => ({
  type: 'text',
  lines: lines.map((l) => (typeof l === 'string' ? { text: l } : l)),
})

export const muted = (text: string, cmd?: string): TextLine => ({
  text,
  tone: 'muted',
  cmd,
})

export const SECTION_SUGGESTIONS: Suggestion[] = CHIPS.map((c) => ({
  label: c.label,
  cmd: c.cmd,
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
      ...hits.map((h) => ({
        label: h.item.title,
        cmd: openCmd(h.item),
        primary: true,
      })),
      ...SECTION_SUGGESTIONS,
    ],
  }
}
