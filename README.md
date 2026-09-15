# wellcaffeinated.com

The 2026 redesign of wellcaffeinated.net — an [Astro](https://astro.build) site
deployed to Cloudflare Workers, being built at
[wellcaffeinated.com](https://wellcaffeinated.com).

This is a fresh rebuild with no shared history. The legacy Jekyll site is in a
separate repo,
[`wellcaffeinated.github.com`](https://github.com/wellcaffeinated/wellcaffeinated.github.com),
which still serves wellcaffeinated.net and is the source for content migration.

## Commands

| Command         | Action                                      |
| --------------- | ------------------------------------------- |
| `pnpm dev`      | Start the dev server at `localhost:4321`    |
| `pnpm build`    | Build the production site to `dist/`        |
| `pnpm preview`  | Preview the build locally                   |
| `pnpm check`    | Type-check `.astro` files (`astro check`)   |
| `pnpm lint`     | Lint with Biome                             |
| `pnpm format`   | Format with Biome                           |
| `pnpm run deploy`   | Build and deploy to Cloudflare Workers      |

## Deployment

Cloudflare Workers Builds deploys on push. Production is
[wellcaffeinated-website.wellcaffeinated.workers.dev](https://wellcaffeinated-website.wellcaffeinated.workers.dev);
other branches get preview URLs of the form
`<branch>-wellcaffeinated-website.wellcaffeinated.workers.dev`, plus a
per-commit URL using the version prefix instead of the branch name.

`pnpm run deploy` still publishes straight to production from a local build.

## Structure

Follows Astro's recommended project layout:

- `src/blog/` — blog posts (markdown, typed by `src/content.config.ts`)
- `src/components/` — reusable components (small, idiomatic examples to follow)
- `src/layouts/` — shared layouts
- `src/pages/` — routes (`index.astro`, `blog/index.astro`, `blog/[...slug].astro`)
- `src/styles/` — global CSS
- `public/` — static assets served as-is

The current blog posts are throwaway placeholders that exercise the pipeline.
