// Site-level knobs for the shell. Safe to import from both Astro components
// (server) and browser code: constants only.

export const SITE_NAME = 'wellcaffeinated'

/** Prompt user. Always `guest`, never `jasper`. */
export const PROMPT_USER = 'guest'

/** The primary navigation: shown as chips in the dock and as the menu grid. */
export const CHIPS = [
  { label: 'Projects', cmd: 'ls projects' },
  { label: 'Thoughts', cmd: 'ls thoughts' },
  { label: 'Play', cmd: 'ls play' },
  { label: 'About', cmd: 'man jasper' },
] as const

/** Printed on boot. Also the tagline. */
export const BOOT_LINES = [
  { text: 'booting wellcaffeinated…', tone: 'muted' },
  { text: '✓ coffee', tone: 'ok' },
  { text: '✓ physics', tone: 'ok' },
  { text: '~ blog (deprecated, kept warm)', tone: 'warn' },
] as const

export const STORAGE_KEYS = {
  theme: 'wellcaffeinated.theme',
  session: 'wellcaffeinated.shell.session',
} as const

/** Chips "type" their command before running it. Milliseconds per character. */
export const TYPING_MS = 40

export const HISTORY_MAX = 50

/** Unknown commands in a row before the menu opens on its own. */
export const UNKNOWN_STREAK_LIMIT = 3

/** Shown in the prompt's completion strip at most. */
export const COMPLETIONS_MAX = 6
