import { muted, type SiteCommand, text } from './util'

export const rm: SiteCommand = {
  name: 'rm',
  tier: 'hidden',
  run: (args, { ctx }) => {
    if (args.join(' ') === '-rf /') {
      ctx.breakEverything()
      return null
    }
    return text(muted('rm: refusing. this is a website.'))
  },
}
