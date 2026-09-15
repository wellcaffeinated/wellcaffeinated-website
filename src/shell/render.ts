// Output descriptor → DOM. One function per output type; class names are
// styled in src/styles/shell.css. Anything runnable is an <a href data-cmd>
// so it works as a plain link too; the host intercepts the click.
import { fragment, h } from '../lib/dom'
import type { Output, TextLine, Tier, Tone } from '../lib/shell'

export interface RenderOptions {
  /** Real URL for a command, used as the link's href. */
  hrefFor(cmd: string): string
}

const TIER_TONE: Record<Tier, Tone> = {
  shown: 'accent',
  hinted: 'warn',
  hidden: 'ok',
}

export function renderOutput(
  out: Output,
  opts: RenderOptions,
): HTMLElement | null {
  const link = (
    cmd: string,
    label: string,
    attrs: Record<string, string | undefined> = {},
  ) => h('a', { href: opts.hrefFor(cmd), 'data-cmd': cmd, ...attrs }, label)

  switch (out.type) {
    case 'text':
      return h(
        'div',
        { class: 'out-text' },
        ...out.lines.map((l) => textLine(l, link)),
      )

    case 'html': {
      const el = h('div', { class: 'out-html prose' })
      el.innerHTML = out.html
      return el
    }

    case 'cards':
      return h(
        'div',
        { class: 'out-cards' },
        ...out.items.map((c) =>
          h(
            'a',
            {
              class: 'card',
              href: opts.hrefFor(c.cmd),
              'data-cmd': c.cmd,
              style: c.color
                ? `--card-bg:${c.color};--card-ink:${c.ink ?? 'inherit'}`
                : undefined,
            },
            h('span', { class: 'card-meta' }, c.meta ?? ''),
            h(
              'span',
              { class: 'card-title' },
              h('span', {}, c.title),
              c.badge && h('span', { class: 'card-badge' }, c.badge),
            ),
          ),
        ),
      )

    case 'rows':
      return h(
        'div',
        { class: 'out-rows' },
        ...out.items.flatMap((r) => [
          h('span', { class: 'row-k' }, r.k ?? ''),
          r.cmd
            ? link(r.cmd, r.title, { class: 'row-title', 'data-tone': r.tone })
            : h('span', { class: 'row-title', 'data-tone': r.tone }, r.title),
          h('span', { class: 'row-meta' }, r.meta ?? ''),
        ]),
      )

    case 'help':
      return h(
        'div',
        { class: 'out-help' },
        ...out.rows.flatMap((row) => [
          // Clicking a help row fills the prompt with the command's first word.
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
        ]),
        out.footer && h('span', { class: 'help-more' }, '…'),
        out.footer && h('span', { class: 'help-footer' }, out.footer),
      )

    case 'error':
      return h(
        'div',
        { class: 'out-error' },
        h('div', { class: 'error-message' }, out.message),
        out.hint && h('div', { class: 'error-hint' }, out.hint),
        out.suggestions?.length
          ? h(
              'div',
              { class: 'suggestions' },
              ...out.suggestions.map((s) =>
                link(s.cmd, s.label, {
                  class: 'suggestion',
                  'data-primary': s.primary ? '' : undefined,
                }),
              ),
            )
          : null,
      )

    case 'search':
      return h(
        'div',
        { class: 'out-search' },
        ...out.items.map((s) =>
          h(
            'div',
            { class: 'hit' },
            h(
              'div',
              { class: 'hit-head' },
              link(s.cmd, s.title, { class: 'hit-title' }),
              h('span', { class: 'hit-meta' }, s.meta ?? ''),
            ),
            h(
              'div',
              { class: 'hit-excerpt' },
              s.before,
              h('mark', {}, s.match),
              s.after,
            ),
          ),
        ),
        h('div', { class: 'search-summary' }, out.summary),
      )

    case 'navigate':
      return h(
        'div',
        { class: 'out-text' },
        h('span', { 'data-tone': 'muted' }, 'opened. esc returns here.'),
      )
  }
}

function textLine(
  l: TextLine,
  link: (
    cmd: string,
    label: string,
    attrs?: Record<string, string | undefined>,
  ) => HTMLElement,
) {
  if (l.cmd) return link(l.cmd, l.text, { 'data-tone': l.tone })
  return h('div', { 'data-tone': l.tone }, l.text)
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
