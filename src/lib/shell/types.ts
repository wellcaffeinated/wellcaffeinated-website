// The contract between commands and whatever draws their output.
// Commands never touch the DOM: they return one of these descriptors and any
// renderer (this site's, a test, a future framework view) can draw it.

export type Tier = 'shown' | 'hinted' | 'hidden'

export type Tone = 'muted' | 'ok' | 'warn' | 'accent'

export interface TextLine {
  text: string
  tone?: Tone
  /** Makes the line a link that runs this command. */
  cmd?: string
}

export interface Card {
  title: string
  cmd: string
  meta?: string
  badge?: string
  /** Optional own colours; without them the card uses the panel colour. */
  color?: string
  ink?: string
}

export interface Row {
  title: string
  /** Left-hand key column, e.g. a year or an index. */
  k?: string
  meta?: string
  cmd?: string
  tone?: Tone
}

export interface HelpRow {
  cmd: string
  desc?: string
  tier: Tier
}

export interface Suggestion {
  label: string
  cmd: string
  primary?: boolean
}

export interface SearchHit {
  title: string
  cmd: string
  meta?: string
  before: string
  match: string
  after: string
}

export type Output =
  | { type: 'text'; lines: TextLine[] }
  | { type: 'cards'; items: Card[] }
  | { type: 'rows'; items: Row[] }
  | { type: 'help'; rows: HelpRow[]; footer?: string }
  | {
      type: 'error'
      message: string
      hint?: string
      suggestions?: Suggestion[]
      code?: number
    }
  | { type: 'search'; summary: string; items: SearchHit[] }
  /** Pre-rendered trusted markup (our own content, never user input). */
  | { type: 'html'; html: string }
  /** Leave the shell for a real page. */
  | { type: 'navigate'; href: string }

export type Flags = Record<string, true>

export interface CommandApi<Ctx> {
  ctx: Ctx
  shell: Shell<Ctx>
  /** The raw line as typed. */
  line: string
  /** `-la` → { l, a }, `--all` → { all }. Flags are also left in `args`. */
  flags: Flags
}

export interface Command<Ctx> {
  name: string
  aliases?: string[]
  tier: Tier
  /** Shown in `help` instead of the bare name, e.g. "ls <dir>". */
  usage?: string
  desc?: string
  run(
    args: string[],
    api: CommandApi<Ctx>,
  ): Output | null | Promise<Output | null>
  /** Completions for the argument currently being typed. */
  complete?(partial: string, api: CommandApi<Ctx>): string[]
}

export interface Shell<Ctx> {
  register(def: Command<Ctx>): Command<Ctx>
  resolve(name: string): Command<Ctx> | undefined
  run(line: string): Promise<Output | null>
  complete(partial: string): string[]
  list(tiers?: Tier | Tier[]): Command<Ctx>[]
}
