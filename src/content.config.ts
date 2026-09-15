// Everything written lives under ./content, outside src: the site discovers
// it through these loaders and never imports a specific file.
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const CONTENT_ROOT = './content'

const article = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
})

// New writing. The section is called "Thoughts" everywhere it is shown.
const thoughts = defineCollection({
  loader: glob({ base: `${CONTENT_ROOT}/thoughts`, pattern: '**/*.md' }),
  schema: article,
})

// The old blog, migrated by hand from the Jekyll site. Kept searchable but
// visually secondary.
const archive = defineCollection({
  loader: glob({ base: `${CONTENT_ROOT}/archive`, pattern: '**/*.md' }),
  schema: article.extend({
    // Path the post lived at on wellcaffeinated.net, for redirects at cutover.
    legacyPath: z.string().optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ base: `${CONTENT_ROOT}/projects`, pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.enum(['personal', 'professional']),
    years: z.string(),
    alive: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    role: z.string().optional(),
    stack: z.string().optional(),
    links: z
      .array(z.object({ label: z.string(), href: z.string() }))
      .default([]),
    // Lower sorts first. Ties fall back to title.
    order: z.number().default(100),
  }),
})

// Where a layout puts a block of chrome. Corners are meaningful in the stage
// layout, which positions absolutely; the layouts that flow honour only `none`.
const PLACE = z.enum([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'none',
])

// Toys. One folder each: index.md is the writeup and frontmatter, toy.ts (if
// present) is the code ToyFrame mounts. The folder name is the slug.
const play = defineCollection({
  loader: glob({
    base: `${CONTENT_ROOT}/play`,
    pattern: '*/index.md',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    // A toy paints in its own colours; these seed the card and the frame.
    color: z.string().optional(),
    ink: z.string().optional(),
    tilt: z.boolean().default(false),
    game: z.boolean().default(false),
    // How the page is arranged around the toy. A layout.astro in the toy's
    // own folder overrides this.
    layout: z.enum(['stage', 'article', 'scroll']).default('stage'),
    // Per-toy nudges to where the chrome sits. Each layout has its own
    // defaults; these override them.
    places: z
      .object({ notes: PLACE.optional(), constants: PLACE.optional() })
      .default({}),
    // Width : height of the toy's box in the layouts that give it one.
    aspect: z.number().positive().default(1.6),
    constants: z
      .array(
        z.object({
          name: z.string(),
          value: z.number(),
          unit: z.string().optional(),
        }),
      )
      .default([]),
    order: z.number().default(100),
  }),
})

// `man jasper`: the about page as a manual page. A single file.
const about = defineCollection({
  loader: glob({ base: CONTENT_ROOT, pattern: 'about.md' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    synopsis: z.string(),
    status: z.string(),
    bugs: z.string(),
    seeAlso: z.array(z.object({ label: z.string(), href: z.string() })),
  }),
})

// What `cat hello.md` prints on boot. A single file.
const hello = defineCollection({
  loader: glob({ base: CONTENT_ROOT, pattern: 'hello.md' }),
  schema: z.object({ title: z.string() }),
})

export const collections = { thoughts, archive, projects, play, about, hello }
