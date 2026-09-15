// Themes are CSS variable sets in src/styles/theme.css, selected by
// `data-theme` on <html>. This module only flips that attribute and remembers
// the choice; add a theme by adding a block to theme.css and a name here.
import { STORAGE_KEYS } from './config'

export const THEMES = ['dark', 'paper'] as const
export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'dark'

export function isTheme(t: string | null | undefined): t is Theme {
  return (THEMES as readonly string[]).includes(t ?? '')
}

export function getTheme(): Theme {
  const t = document.documentElement.dataset.theme
  return isTheme(t) ? t : DEFAULT_THEME
}

export function setTheme(t: Theme): void {
  document.documentElement.dataset.theme = t
  try {
    localStorage.setItem(STORAGE_KEYS.theme, t)
  } catch {
    // private mode; the theme just won't stick
  }
}

export function toggleTheme(): Theme {
  const next = THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length]
  setTheme(next)
  return next
}
