import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

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
  loader: glob({ base: './src/thoughts', pattern: '**/*.md' }),
  schema: article,
})

// The old blog, migrated by hand from the Jekyll site. Kept searchable but
// visually secondary.
const archive = defineCollection({
  loader: glob({ base: './src/archive', pattern: '**/*.md' }),
  schema: article.extend({
    // Path the post lived at on wellcaffeinated.net, for redirects at cutover.
    legacyPath: z.string().optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ base: './src/projects', pattern: '**/*.md' }),
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

// Toys. Each one will eventually mount its own module into the play frame;
// for now the frontmatter describes the slot.
const play = defineCollection({
  loader: glob({ base: './src/play', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    // A toy paints in its own colours; these seed the card and the frame.
    color: z.string().optional(),
    ink: z.string().optional(),
    tilt: z.boolean().default(false),
    game: z.boolean().default(false),
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

export const collections = { thoughts, archive, projects, play }
