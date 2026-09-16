// Output descriptor → DOM. One renderer per output type; class names are
// styled in src/styles/shell.css. Anything runnable is an <a href data-cmd>
// so it works as a plain link too; the host intercepts the click.
import { type Child, fragment, h } from '../lib/dom'
import type {
  Card,
  HelpRow,
  Output,
  Row,
  SearchHit,
  Suggestion,
  TextLine,
  Tier,
  Tone,
} from '../lib/shell'

export interface RenderOptions {
  /** Real URL for a command, used as the link's href. */
  hrefFor(cmd: string): string
}

type LinkAttrs = Record<string, string | undefined>
/** An <a href data-cmd> that runs `cmd`; the host intercepts the click. */
type Link = (cmd: string, attrs: LinkAttrs, ...children: Child[]) => HTMLElement

type OutputOf<T extends Output['type']> = Extract<Output, { type: T }>
type Renderer<T extends Output['type']> = (
  out: OutputOf<T>,
  link: Link,
) => HTMLElement

const TIER_TONE: Record<Tier, Tone> = {
  shown: 'accent',
  hinted: 'warn',
  hidden: 'ok',
}

function textLine(line: TextLine, link: Link): HTMLElement {
  if (line.cmd) return link(line.cmd, { 'data-tone': line.tone }, line.text)
  return h('div', { 'data-tone': line.tone }, line.text)
}

const renderText: Renderer<'text'> = (out, link) =>
  h(
    'div',
    { class: 'out-text' },
    ...out.lines.map((line) => textLine(line, link)),
  )

const renderHtml: Renderer<'html'> = (out) => {
  const el = h('div', { class: 'out-html prose' })
  el.innerHTML = out.html
  return el
}

const cardStyle = (card: Card) =>
  card.color
    ? `--card-bg:${card.color};--card-ink:${card.ink ?? 'inherit'}`
    : undefined

const renderCard = (card: Card, link: Link) =>
  link(
    card.cmd,
    { class: 'card', style: cardStyle(card) },
    h('span', { class: 'card-meta' }, card.meta ?? ''),
    h(
      'span',
      { class: 'card-title' },
      h('span', {}, card.title),
      card.badge && h('span', { class: 'card-badge' }, card.badge),
    ),
  )

const renderCards: Renderer<'cards'> = (out, link) =>
  h(
    'div',
    { class: 'out-cards' },
    ...out.items.map((card) => renderCard(card, link)),
  )

function rowTitle(row: Row, link: Link): HTMLElement {
  if (row.cmd) {
    return link(
      row.cmd,
      { class: 'row-title', 'data-tone': row.tone },
      row.title,
    )
  }
  return h('span', { class: 'row-title', 'data-tone': row.tone }, row.title)
}

const renderRow = (row: Row, link: Link) => [
  h('span', { class: 'row-k' }, row.k ?? ''),
  rowTitle(row, link),
  h('span', { class: 'row-meta' }, row.meta ?? ''),
]

const renderRows: Renderer<'rows'> = (out, link) =>
  h(
    'div',
    { class: 'out-rows' },
    ...out.items.flatMap((row) => renderRow(row, link)),
  )

// Clicking a help row fills the prompt with the command's first word.
const renderHelpRow = (row: HelpRow) => [
  h(
    'button',
    {
      type: 'button',
      'data-fill': `${row.cmd.split(' ')[0]} `,
      'data-tone': TIER_TONE[row.tier],
    },
    row.cmd,
  ),
  h('span', { class: 'help-desc' }, row.desc ?? ''),
]

const renderHelp: Renderer<'help'> = (out) =>
  h(
    'div',
    { class: 'out-help' },
    ...out.rows.flatMap(renderHelpRow),
    out.footer && h('span', { class: 'help-more' }, '…'),
    out.footer && h('span', { class: 'help-footer' }, out.footer),
  )

const renderSuggestion = (suggestion: Suggestion, link: Link) =>
  link(
    suggestion.cmd,
    {
      class: 'suggestion',
      'data-primary': suggestion.primary ? '' : undefined,
    },
    suggestion.label,
  )

function renderSuggestions(
  suggestions: Suggestion[] | undefined,
  link: Link,
): HTMLElement | null {
  if (!suggestions?.length) return null
  return h(
    'div',
    { class: 'suggestions' },
    ...suggestions.map((suggestion) => renderSuggestion(suggestion, link)),
  )
}

const renderError: Renderer<'error'> = (out, link) =>
  h(
    'div',
    { class: 'out-error' },
    h('div', { class: 'error-message' }, out.message),
    out.hint && h('div', { class: 'error-hint' }, out.hint),
    renderSuggestions(out.suggestions, link),
  )

const renderHit = (hit: SearchHit, link: Link) =>
  h(
    'div',
    { class: 'hit' },
    h(
      'div',
      { class: 'hit-head' },
      link(hit.cmd, { class: 'hit-title' }, hit.title),
      h('span', { class: 'hit-meta' }, hit.meta ?? ''),
    ),
    h(
      'div',
      { class: 'hit-excerpt' },
      hit.before,
      h('mark', {}, hit.match),
      hit.after,
    ),
  )

const renderSearch: Renderer<'search'> = (out, link) =>
  h(
    'div',
    { class: 'out-search' },
    ...out.items.map((hit) => renderHit(hit, link)),
    h('div', { class: 'search-summary' }, out.summary),
  )

const renderNavigate: Renderer<'navigate'> = () =>
  h(
    'div',
    { class: 'out-text' },
    h('span', { 'data-tone': 'muted' }, 'opened. esc returns here.'),
  )

const RENDERERS: { [T in Output['type']]: Renderer<T> } = {
  text: renderText,
  html: renderHtml,
  cards: renderCards,
  rows: renderRows,
  help: renderHelp,
  error: renderError,
  search: renderSearch,
  navigate: renderNavigate,
}

export function renderOutput(out: Output, opts: RenderOptions): HTMLElement {
  const link: Link = (cmd, attrs, ...children) =>
    h('a', { href: opts.hrefFor(cmd), 'data-cmd': cmd, ...attrs }, ...children)
  // The mapped type above pairs each key with its own descriptor, but
  // TypeScript cannot correlate `out.type` with `RENDERERS[out.type]` and sees
  // a union of incompatible functions. Widening is safe here.
  const render = RENDERERS[out.type] as Renderer<Output['type']>
  return render(out, link)
}

/** A log entry: the prompt line (if there was a command) followed by its output. */
export function renderEntry(
  entry: { cmd: string; out: Output | null; done?: boolean; doneNote?: string },
  promptUser: string,
  opts: RenderOptions,
): HTMLElement {
  const el = h('div', { class: 'entry' })
  if (entry.cmd) {
    el.append(
      h(
        'div',
        { class: 'entry-cmd' },
        h('span', { class: 'prompt-user' }, `${promptUser} $`),
        h(
          'a',
          { href: opts.hrefFor(entry.cmd), 'data-cmd': entry.cmd },
          entry.cmd,
        ),
        h(
          'span',
          { class: 'entry-done', hidden: !entry.done },
          `✓ ${entry.doneNote ?? ''}`,
        ),
      ),
    )
  }
  if (entry.out) el.append(fragment(renderOutput(entry.out, opts)))
  return el
}
