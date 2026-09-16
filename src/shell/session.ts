// The log and command history survive a trip to a content page and back.
// sessionStorage: per tab, gone when the tab closes, like a terminal window.
import type { Output } from '../lib/shell'
import { STORAGE_KEYS } from './config'

export interface Entry {
  id: number
  /** Empty for entries the shell printed on its own (boot). */
  cmd: string
  out: Output | null
  /** Set when the entry navigated away; marked done on return. */
  opens?: string
  done?: boolean
  doneNote?: string
}

export interface Session {
  entries: Entry[]
  history: string[]
}

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.session)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
  } catch {
    // storage full or unavailable; the log just won't survive navigation
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.session)
  } catch {
    // nothing to clear
  }
}
