import type { APIRoute } from 'astro'
import { buildShellIndex } from '../../lib/content'

// The flat content index the browser shell uses for `ls`, `open`, `grep`
// and tab completion. See src/shell/content.ts for the shape.
export const GET: APIRoute = async () => {
  const items = await buildShellIndex()
  return new Response(JSON.stringify({ items }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
