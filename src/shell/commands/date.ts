import { muted, type SiteCommand, text } from './util'

export const date: SiteCommand = {
  name: 'date',
  tier: 'hidden',
  run: () => text(new Date().toString(), muted('you have time.')),
}
