# wellcaffeinated.com

The 2026 redesign of wellcaffeinated.net — an [Astro](https://astro.build) site
deployed to Cloudflare Workers, being built at
[wellcaffeinated.com](https://wellcaffeinated.com).

This is a fresh rebuild with no shared history. The legacy Jekyll site is in a
separate repo,
[`wellcaffeinated.github.com`](https://github.com/wellcaffeinated/wellcaffeinated.github.com),
which still serves wellcaffeinated.net and is the source for content migration.

The site is a shell: a terminal-shaped frame whose output is rich UI. Chips run
commands for people who don't type; typing is opt-in; every command is a URL.

## Commands

| Command           | Action                                                     |
| ----------------- | ---------------------------------------------------------- |
| `pnpm dev`        | Start the dev server at `localhost:4321`                   |
| `pnpm build`      | Type-check, then build the production site to `dist/`      |
| `pnpm preview`    | Preview the build locally                                  |
| `pnpm check`      | Type-check `.astro`, `src/` and `content/` (`astro check`) |
| `pnpm lint`       | Lint with Biome                                            |
| `pnpm format`     | Format with Biome                                          |
| `pnpm run deploy` | Build and deploy to Cloudflare Workers                     |

## Deployment

Cloudflare Workers Builds deploys on push. Production is
[wellcaffeinated-website.wellcaffeinated.workers.dev](https://wellcaffeinated-website.wellcaffeinated.workers.dev);
other branches get preview URLs of the form
`<branch>-wellcaffeinated-website.wellcaffeinated.workers.dev`, plus a
per-commit URL using the version prefix instead of the branch name.

`pnpm run deploy` still publishes straight to production from a local build.

## Structure

- `src/lib/shell/` — the REPL library (registry, tokenizer, completion,
  output descriptors). No DOM, no Astro.
- `src/shell/` — this site's shell: commands, renderer, host, router, theme.
- `src/thoughts/`, `src/archive/`, `src/projects/`, `src/play/` — content
  collections (markdown), typed by `src/content.config.ts`.
- `src/components/shell/` — the chrome; `src/components/content/` — views.
- `src/layouts/ShellLayout.astro` — every page.
- `src/pages/` — routes, plus `/shell/index.json` (the content index).
- `src/styles/theme.css` — every colour, font and size, in one place.

See `CLAUDE.md` for how the pieces fit and the rules the design follows.
