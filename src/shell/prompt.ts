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
    hint.textContent = !value.trim()
      ? ''
      : matches.length
        ? 'tab ⇥ completes'
        : '↵ runs'
  }

  function renderCompletions() {
    completions.replaceChildren(
      ...matches.map((m) =>
        h('button', { type: 'button', role: 'option', 'data-fill': m }, m),
      ),
    )
    completions.hidden = matches.length === 0
  }

  function pushHistory(line: string) {
    history.push(line)
    if (history.length > HISTORY_MAX) history.shift()
    historyIndex = -1
  }

  function recall(step: -1 | 1) {
    if (!history.length) return
    if (historyIndex < 0) historyIndex = history.length
    historyIndex = Math.max(0, Math.min(history.length, historyIndex + step))
    set(history[historyIndex] ?? '')
  }

  function submit() {
    const line = input.value.trim()
    set('')
    if (line) on.submit(line)
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    submit()
  })
  input.addEventListener('input', () => set(input.value))
  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Tab':
        // a11y: only steal Tab when there is a partial word and something to
        // complete; otherwise focus moves on as usual.
        if (input.value.trim() && matches.length) {
          e.preventDefault()
          set(matches[0])
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        recall(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        recall(1)
        break
      case 'c':
        if (e.ctrlKey) {
          e.preventDefault()
          set('')
        }
        break
      case 'l':
        if (e.ctrlKey) {
          e.preventDefault()
          on.clearScreen()
        }
        break
    }
  })
  completions.addEventListener('click', (e) => {
    const fill = (e.target as HTMLElement).closest<HTMLElement>('[data-fill]')
      ?.dataset.fill
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
      let i = 0
      typing = setInterval(() => {
        i++
        set(cmd.slice(0, i))
        if (i < cmd.length) return
        clearInterval(typing)
        setTimeout(() => {
          submit()
          resolve()
        }, msPerChar * 3)
      }, msPerChar)
    })
  }

  return { set, focus: () => input.focus(), type, history, pushHistory }
}
