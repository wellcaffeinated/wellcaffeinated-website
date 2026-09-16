// Wires the shell core to the page. Two kinds of page share this script:
//   - the shell page (`/`): has a log and a prompt; commands append to the log
//   - content pages: only the bars; any command sends you back to the shell
// State lives in sessionStorage so the log survives the round trip.
import { createShell, type Output } from '../lib/shell'
import { registerCommands } from './commands'
import {
  BOOT_LINES,
  PROMPT_USER,
  TYPING_MS,
  UNKNOWN_STREAK_LIMIT,
} from './config'
import { loadIndex } from './content'
import type { SiteCtx } from './context'
import { createMenu } from './menu'
import { createPrompt, type Prompt, type PromptElements } from './prompt'
import { type RenderOptions, renderEntry } from './render'
import {
  commandFromHash,
  commandFromHref,
  hashFor,
  hrefFor,
  onShellPage,
  SHELL_PATH,
} from './router'
import { clearSession, type Entry, loadSession, saveSession } from './session'
import { setTheme, toggleTheme } from './theme'

/** How long the `rm -rf /` overlay stays up before the restart. */
const BREAK_MS = 3200

/** Opening one of these earns a ✓ read; anything else is ✓ visited. */
const READ_PREFIXES = ['/thoughts/', '/archive/']

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const CLICKABLE = 'a[href], button, [data-cmd]'

const doneNoteFor = (href: string) =>
  READ_PREFIXES.some((prefix) => href.startsWith(prefix)) ? 'read' : 'visited'

/** Coming back from a page marks the entry that opened it. */
function settleOpened(entry: Entry): Entry {
  if (!entry.opens || entry.done) return entry
  return { ...entry, done: true, doneNote: doneNoteFor(entry.opens) }
}

const isUnknownCommand = (out: Output) => out.type === 'error' && !out.code

/** Server-rendered snippets (hello.md), captured before the log is touched. */
function readFragments(): Map<string, string> {
  const els = document.querySelectorAll<HTMLElement>('[data-fragment]')
  return new Map(
    [...els].map((el) => [el.dataset.fragment ?? '', el.innerHTML]),
  )
}

function isEditing(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement) return true
  if (target instanceof HTMLTextAreaElement) return true
  return target instanceof HTMLElement && target.isContentEditable
}

/** A single printable character with no modifier: what a prompt would want. */
const isPlainCharacter = (e: KeyboardEvent) =>
  e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey

/** The clickable ancestor of a plain left click, or null to let the browser handle it. */
function clickTarget(e: MouseEvent): HTMLElement | null {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return null
  if (!(e.target instanceof Element)) return null
  return e.target.closest<HTMLElement>(CLICKABLE)
}

function promptElements(
  root: HTMLElement,
  form: HTMLFormElement,
): PromptElements | null {
  const input = form.querySelector('input')
  const hint = form.querySelector<HTMLElement>('[data-prompt-hint]')
  const completions = root.querySelector<HTMLElement>('[data-completions]')
  if (!input || !hint || !completions) return null
  return { form, input, hint, completions }
}

function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
  requestAnimationFrame(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior,
    }),
  )
}

async function main() {
  const root = document.querySelector<HTMLElement>('[data-shell]')
  if (!root) return

  const index = await loadIndex()
  const render: RenderOptions = { hrefFor: (cmd) => hrefFor(cmd, index) }

  const logEl = document.querySelector<HTMLElement>('[data-log]')
  const menuEl = document.querySelector<HTMLDialogElement>('[data-menu]')
  const menu = menuEl ? createMenu(menuEl) : null
  const brokenEl = document.querySelector<HTMLElement>('[data-broken]')
  const fragments = readFragments()

  let entries: Entry[] = []
  let lastId = 0
  let unknownStreak = 0
  let prompt: Prompt | null = null

  const ctx: SiteCtx = {
    index,
    setTheme,
    restart,
    openMenu: () => menu?.open(),
    history: () => prompt?.history ?? [],
    breakEverything,
    fragment: (name) => fragments.get(name) ?? null,
  }
  const shell = createShell(ctx)
  registerCommands(shell)

  // ── log ──────────────────────────────────────────────────────────────────

  function newId() {
    lastId += 1
    return lastId
  }

  function persist() {
    saveSession({ entries, history: prompt?.history ?? [] })
    menu?.setVisited(entries, render.hrefFor)
  }

  function append(entry: Entry) {
    entries = [...entries, entry]
    if (!logEl) return
    logEl.append(renderEntry(entry, PROMPT_USER, render))
    scrollToBottom()
  }

  function redraw() {
    if (!logEl) return
    logEl.replaceChildren(
      ...entries.map((entry) => renderEntry(entry, PROMPT_USER, render)),
    )
  }

  function bootEntries(): Entry[] {
    const hello = fragments.get('hello')
    return [
      { id: newId(), cmd: '', out: { type: 'text', lines: [...BOOT_LINES] } },
      {
        id: newId(),
        cmd: 'cat hello.md',
        out: hello ? { type: 'html', html: hello } : null,
      },
    ]
  }

  // ── running ──────────────────────────────────────────────────────────────

  interface RunOptions {
    /** Replaying from the URL: don't push another history entry. */
    replay?: boolean
  }

  // On a content page there is no log: go straight to the target, or back
  // to the shell with the command in the hash so it runs (and logs) there.
  function leaveFor(line: string, out: Output | null) {
    if (out === null) return
    location.href =
      out.type === 'navigate' ? out.href : SHELL_PATH + hashFor(line)
  }

  async function run(rawLine: string, opts: RunOptions = {}) {
    const line = rawLine.trim()
    if (!line) return
    const out = await shell.run(line)
    if (!onShellPage()) {
      leaveFor(line, out)
      return
    }
    prompt?.pushHistory(line)
    if (out === null) {
      persist()
      return
    }
    const opens = out.type === 'navigate' ? out.href : undefined
    append({ id: newId(), cmd: line, out, opens })
    trackUnknown(out)
    if (!opts.replay && !opens) {
      history.pushState(null, '', SHELL_PATH + hashFor(line))
    }
    persist()
    if (opens) location.href = opens
  }

  // Never a bare error: a few unknowns in a row and the menu offers a way out.
  function trackUnknown(out: Output) {
    unknownStreak = isUnknownCommand(out) ? unknownStreak + 1 : 0
    if (unknownStreak < UNKNOWN_STREAK_LIMIT) return
    unknownStreak = 0
    menu?.open()
  }

  function typeAndRun(cmd: string) {
    menu?.close()
    if (!prompt || !onShellPage()) return run(cmd)
    const reduced = matchMedia(REDUCED_MOTION_QUERY).matches
    return prompt.type(cmd, reduced ? 0 : TYPING_MS)
  }

  function restart() {
    clearSession()
    if (!onShellPage()) {
      location.href = SHELL_PATH
      return
    }
    history.replaceState(null, '', SHELL_PATH)
    menu?.close()
    entries = bootEntries()
    prompt?.history.splice(0)
    prompt?.set('')
    unknownStreak = 0
    redraw()
    persist()
  }

  function breakEverything() {
    menu?.close()
    if (brokenEl) brokenEl.hidden = false
    setTimeout(() => {
      if (brokenEl) brokenEl.hidden = true
      restart()
    }, BREAK_MS)
  }

  // ── wiring ───────────────────────────────────────────────────────────────

  const promptForm = root.querySelector<HTMLFormElement>('[data-prompt]')
  const promptEls = promptForm && promptElements(root, promptForm)
  if (promptEls) {
    prompt = createPrompt(promptEls, {
      complete: shell.complete,
      submit: run,
      clearScreen: restart,
    })
  }

  function fillPrompt(value: string) {
    if (!prompt) {
      location.href = render.hrefFor(value.trim())
      return
    }
    prompt.set(value)
    prompt.focus()
  }

  /** Buttons and links identified by a `data-*` attribute rather than a command. */
  const datasetActions: Record<string, (e: MouseEvent) => void> = {
    menuToggle: () => menu?.toggle(),
    menuClose: () => menu?.close(),
    themeToggle: toggleTheme,
    restart: (e) => {
      e.preventDefault()
      restart()
    },
  }

  function onClick(e: MouseEvent) {
    const target = clickTarget(e)
    if (!target) return
    const href = target.getAttribute('href') ?? ''
    const cmd = commandFromHref(href) ?? target.dataset.cmd
    if (cmd !== undefined) {
      e.preventDefault()
      menu?.close()
      if ('type' in target.dataset) {
        typeAndRun(cmd)
      } else {
        run(cmd)
      }
      return
    }
    const fill = target.dataset.fill
    if (fill !== undefined) {
      e.preventDefault()
      menu?.close()
      fillPrompt(fill)
      return
    }
    const action = Object.keys(datasetActions).find(
      (key) => key in target.dataset,
    )
    if (action) datasetActions[action](e)
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !onShellPage() && !menuEl?.open) {
      location.href = SHELL_PATH
      return
    }
    // Typing anywhere focuses the prompt. Never touches Tab or shortcuts.
    if (!prompt || menuEl?.open || isEditing(e.target)) return
    if (isPlainCharacter(e)) prompt.focus()
  }

  function onPopstate() {
    if (!onShellPage()) return
    const cmd = commandFromHash(location.hash)
    if (cmd && cmd !== entries.at(-1)?.cmd) run(cmd, { replay: true })
  }

  // Back/forward cache restores the old DOM; the opened entry still needs its ✓.
  function onPageshow(e: PageTransitionEvent) {
    if (!e.persisted) return
    entries = entries.map(settleOpened)
    redraw()
    persist()
  }

  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('popstate', onPopstate)
  window.addEventListener('pageshow', onPageshow)

  // ── boot ─────────────────────────────────────────────────────────────────

  const session = loadSession()
  if (!logEl) {
    if (session) menu?.setVisited(session.entries, render.hrefFor)
    return
  }
  if (session) {
    entries = session.entries.map(settleOpened)
    lastId = Math.max(0, ...entries.map((entry) => entry.id))
    redraw()
    // Returning here (esc, a content page's exit) is a fresh navigation,
    // not browser back, so the page has no scroll position of its own to
    // restore. The natural return point is the bottom, where the restored
    // history is longest.
    scrollToBottom('instant')
  } else {
    // Keep the server-rendered boot + hello as-is; just adopt them as entries.
    entries = bootEntries()
  }
  prompt?.history.push(...(session?.history ?? []))
  persist()

  const fromUrl = commandFromHash(location.hash)
  if (fromUrl && fromUrl !== entries.at(-1)?.cmd) {
    await run(fromUrl, { replay: true })
  }
  if (root.dataset.notFound !== undefined) {
    await run(`open ${location.pathname}`, { replay: true })
  }
}

main()
