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
import { createPrompt, type Prompt } from './prompt'
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

const BREAK_MS = 3200

async function main() {
  const root = document.querySelector<HTMLElement>('[data-shell]')
  if (!root) return

  const index = await loadIndex()
  const render: RenderOptions = { hrefFor: (cmd) => hrefFor(cmd, index) }

  const logEl = document.querySelector<HTMLElement>('[data-log]')
  const menuEl = document.querySelector<HTMLDialogElement>('[data-menu]')
  const menu = menuEl ? createMenu(menuEl) : null
  const brokenEl = document.querySelector<HTMLElement>('[data-broken]')

  // Server-rendered snippets (hello.md) are captured before the log is touched.
  const fragments = new Map<string, string>()
  for (const el of document.querySelectorAll<HTMLElement>('[data-fragment]')) {
    fragments.set(el.dataset.fragment ?? '', el.innerHTML)
  }

  let entries: Entry[] = []
  let nextId = 1
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

  function persist() {
    saveSession({ entries, history: prompt?.history ?? [] })
    menu?.setVisited(entries, render.hrefFor)
  }

  function append(entry: Entry) {
    entries.push(entry)
    if (!logEl) return
    logEl.append(renderEntry(entry, PROMPT_USER, render))
    requestAnimationFrame(() =>
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      }),
    )
  }

  function redraw() {
    if (!logEl) return
    logEl.replaceChildren(
      ...entries.map((e) => renderEntry(e, PROMPT_USER, render)),
    )
  }

  function bootEntries(): Entry[] {
    const hello = fragments.get('hello')
    return [
      { id: nextId++, cmd: '', out: { type: 'text', lines: [...BOOT_LINES] } },
      {
        id: nextId++,
        cmd: 'cat hello.md',
        out: hello ? { type: 'html', html: hello } : null,
      },
    ]
  }

  // Coming back from a page marks the entry that opened it.
  function settleOpened() {
    for (const e of entries) {
      if (e.opens && !e.done) {
        e.done = true
        e.doneNote =
          e.opens.startsWith('/thoughts/') || e.opens.startsWith('/archive/')
            ? 'read'
            : 'visited'
      }
    }
  }

  // ── running ──────────────────────────────────────────────────────────────

  interface RunOptions {
    /** Replaying from the URL: don't push another history entry. */
    replay?: boolean
  }

  async function run(line: string, opts: RunOptions = {}) {
    line = line.trim()
    if (!line) return
    const out = await shell.run(line)
    // On a content page there is no log: go straight to the target, or back
    // to the shell with the command in the hash so it runs (and logs) there.
    if (!onShellPage()) {
      if (out !== null) {
        location.href =
          out.type === 'navigate' ? out.href : SHELL_PATH + hashFor(line)
      }
      return
    }
    prompt?.pushHistory(line)
    if (out === null) {
      persist()
      return
    }
    const entry: Entry = { id: nextId++, cmd: line, out }
    if (out.type === 'navigate') entry.opens = out.href
    append(entry)
    trackUnknown(out)
    if (!opts.replay && out.type !== 'navigate')
      history.pushState(null, '', SHELL_PATH + hashFor(line))
    persist()
    if (out.type === 'navigate') location.href = out.href
  }

  // Never a bare error: a few unknowns in a row and the menu offers a way out.
  function trackUnknown(out: Output) {
    const unknown = out.type === 'error' && !out.code
    unknownStreak = unknown ? unknownStreak + 1 : 0
    if (unknownStreak >= UNKNOWN_STREAK_LIMIT) {
      unknownStreak = 0
      menu?.open()
    }
  }

  function typeAndRun(cmd: string) {
    menu?.close()
    if (!prompt || !onShellPage()) return run(cmd)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
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
  if (promptForm) {
    prompt = createPrompt(
      {
        form: promptForm,
        input: promptForm.querySelector('input') as HTMLInputElement,
        hint: promptForm.querySelector('[data-prompt-hint]') as HTMLElement,
        completions: root.querySelector('[data-completions]') as HTMLElement,
      },
      {
        complete: (p) => shell.complete(p),
        submit: (line) => run(line),
        clearScreen: restart,
      },
    )
  }

  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      'a[href], button, [data-cmd]',
    )
    if (!target || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey)
      return

    const href = target.getAttribute('href') ?? ''
    const cmd = commandFromHref(href) ?? target.dataset.cmd
    if (cmd !== undefined) {
      e.preventDefault()
      menu?.close()
      if ('type' in target.dataset) typeAndRun(cmd)
      else run(cmd)
      return
    }
    if (target.dataset.fill !== undefined) {
      e.preventDefault()
      menu?.close()
      if (prompt) {
        prompt.set(target.dataset.fill)
        prompt.focus()
      } else {
        location.href = render.hrefFor(target.dataset.fill.trim())
      }
      return
    }
    if ('menuToggle' in target.dataset) menu?.toggle()
    else if ('menuClose' in target.dataset) menu?.close()
    else if ('themeToggle' in target.dataset) toggleTheme()
    else if ('restart' in target.dataset) {
      e.preventDefault()
      restart()
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !onShellPage() && !menuEl?.open) {
      location.href = SHELL_PATH
      return
    }
    // Typing anywhere focuses the prompt. Never touches Tab or shortcuts.
    const tag = (e.target as HTMLElement).tagName
    const editing =
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      (e.target as HTMLElement).isContentEditable
    if (
      prompt &&
      !editing &&
      !menuEl?.open &&
      e.key.length === 1 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      prompt.focus()
    }
  })

  window.addEventListener('popstate', () => {
    if (!onShellPage()) return
    const cmd = commandFromHash(location.hash)
    if (cmd && cmd !== entries.at(-1)?.cmd) run(cmd, { replay: true })
  })

  // Back/forward cache restores the old DOM; the opened entry still needs its ✓.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return
    settleOpened()
    redraw()
    persist()
  })

  // ── boot ─────────────────────────────────────────────────────────────────

  const session = loadSession()
  if (logEl) {
    if (session) {
      entries = session.entries
      nextId = Math.max(0, ...entries.map((e) => e.id)) + 1
      settleOpened()
      redraw()
    } else {
      // Keep the server-rendered boot + hello as-is; just adopt them as entries.
      entries = bootEntries()
    }
    prompt?.history.push(...(session?.history ?? []))
    persist()

    const fromUrl = commandFromHash(location.hash)
    if (fromUrl && fromUrl !== entries.at(-1)?.cmd)
      await run(fromUrl, { replay: true })
    if (root.dataset.notFound !== undefined)
      await run(`open ${location.pathname}`, { replay: true })
  } else if (session) {
    menu?.setVisited(session.entries, render.hrefFor)
  }
}

main()
