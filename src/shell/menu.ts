// The ☰ menu: a native <dialog>, so focus trapping and Escape come free.
import { h } from '../lib/dom'
import type { Entry } from './session'

export interface Menu {
  open(): void
  close(): void
  toggle(): void
  /** "Where you've been": the log reduced to the pages it opened. */
  setVisited(entries: Entry[], hrefFor: (cmd: string) => string): void
}

const VISITED_MAX = 5

export function createMenu(dialog: HTMLDialogElement): Menu {
  const visited = dialog.querySelector<HTMLElement>('[data-visited]')
  const visitedList = visited?.querySelector<HTMLElement>('[data-visited-list]')

  dialog.addEventListener('click', (e) => {
    // Clicks on the backdrop land on the dialog element itself.
    if (e.target === dialog) dialog.close()
  })

  return {
    open: () => {
      if (!dialog.open) dialog.showModal()
    },
    close: () => dialog.close(),
    toggle: () => (dialog.open ? dialog.close() : dialog.showModal()),
    setVisited(entries, hrefFor) {
      if (!visited || !visitedList) return
      const items = entries
        .filter((e) => e.opens)
        .reverse()
        .slice(0, VISITED_MAX)
      visitedList.replaceChildren(
        ...items.map((e) =>
          h(
            'a',
            { href: hrefFor(e.cmd), 'data-cmd': e.cmd },
            e.cmd.replace(/^(open|play)\s+/, '').replace(/^[a-z]+\//, ''),
          ),
        ),
      )
      visited.hidden = items.length === 0
    },
  }
}
