// What every toy layout is handed. A layout arranges these; it never mounts
// the toy or knows its slug — ToyFrame owns that.
import type { Toy } from '../../../lib/content'

export type Place =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'none'

export type Places = { notes?: Place; constants?: Place }

export interface ToyLayoutProps {
  toy: Toy
  /** The layout's own defaults, already merged with the toy's `places`. */
  places: Required<Places>
}
