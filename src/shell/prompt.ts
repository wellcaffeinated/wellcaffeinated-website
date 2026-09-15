// The input line: history (↑/↓), tab completion, ctrl-c, ctrl-l, and the
// visible completion chips. Knows nothing about what commands mean.
import { h } from '../lib/dom'
import { COMPLETIONS_MAX, HISTORY_MAX } from './config'

export interface PromptElements {
  form: HTMLFormElement
  input: HTMLInputElement
  hint: HTMLElement
  completions: HTMLElement
}

export interface PromptHandlers {
  complete(partial: string): string[]
  submit(line: string): void
  clearScreen(): void
}

export interface Prompt {
  set(value: string): void
  focus(): void
  /** Types `cmd` character by character, then submits it. */
  type(cmd: string, msPerChar: number): Promise<void>
  history: string[]
  pushHistory(line: string): void
}

/** After the last character is typed, wait this many characters' worth before submitting. */
const SUBMIT_PAUSE_CHARS = 3

function hintFor(value: string, matches: string[]): string {
  if (!value.trim()) return ''
  if (matches.length > 0) return 'tab ⇥ completes'
  return '↵ runs'
}

const completionChip = (match: string) =>
  h('button', { type: 'button', role: 'option', 'data-fill': match }, match)

export function createPrompt(
  els: PromptElements,
  on: PromptHandlers,
  initialHistory: string[] = [],
): Prompt {
  const { form, input, hint, completions } = els
  const history = initialHistory.slice(-HISTORY_MAX)
  let historyIndex = -1
  let matches: string[] = []
  let typing: ReturnType<typeof setInterval> | undefined

  function set(value: string) {
    input.value = value
    matches = value.trim() ? on.complete(value).slice(0, COMPLETIONS_MAX) : []
    renderCompletions()
    hint.textContent = hintFor(value, matches)
  }

  function renderCompletions() {
    completions.replaceChildren(...matches.map(completionChip))
    completions.hidden = matches.length === 0
  }

  function pushHistory(line: string) {
    history.push(line)
    if (history.length > HISTORY_MAX) history.shift()
    historyIndex = -1
  }

  function recall(step: -1 | 1) {
    if (history.length === 0) return
    const from = historyIndex < 0 ? history.length : historyIndex
    historyIndex = Math.max(0, Math.min(history.length, from + step))
    set(history[historyIndex] ?? '')
  }

  function submit() {
    const line = input.value.trim()
    set('')
    if (line) on.submit(line)
  }

  function completeFirst(e: KeyboardEvent) {
    // a11y: only steal Tab when there is a partial word and something to
    // complete; otherwise focus moves on as usual.
    if (!input.value.trim() || matches.length === 0) return
    e.preventDefault()
    set(matches[0])
  }

  const keyHandlers: Record<string, (e: KeyboardEvent) => void> = {
    Tab: completeFirst,
    ArrowUp: (e) => {
      e.preventDefault()
      recall(-1)
    },
    ArrowDown: (e) => {
      e.preventDefault()
      recall(1)
    },
    c: (e) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      set('')
    },
    l: (e) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      on.clearScreen()
    },
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    submit()
  })
  input.addEventListener('input', () => set(input.value))
  input.addEventListener('keydown', (e) => keyHandlers[e.key]?.(e))
  completions.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return
    const fill = e.target.closest<HTMLElement>('[data-fill]')?.dataset.fill
    if (fill === undefined) return
    set(fill)
    input.focus()
  })

  function type(cmd: string, msPerChar: number) {
    clearInterval(typing)
    set('')
    if (msPerChar <= 0) {
      set(cmd)
      submit()
      return Promise.resolve()
    }
    return new Promise<void>((resolve) => {
      let typed = 0
      typing = setInterval(() => {
        typed += 1
        set(cmd.slice(0, typed))
        if (typed < cmd.length) return
        clearInterval(typing)
        setTimeout(() => {
          submit()
          resolve()
        }, msPerChar * SUBMIT_PAUSE_CHARS)
      }, msPerChar)
    })
  }

  return { set, focus: () => input.focus(), type, history, pushHistory }
}
