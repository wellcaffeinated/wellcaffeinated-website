# wellcaffeinated.net

## Purpose

The 2026 redesign of wellcaffeinated.net, built with **Astro** and deployed to
**Cloudflare Workers** (static assets). This repo is a from-scratch rebuild on a
blank canvas — it shares no history with the old site.

The new site is being built at **wellcaffeinated.com**. The old site stays live
at **wellcaffeinated.net** until cutover, after which .net will 301 to .com.

### The old site lives in a separate repo

The legacy Jekyll site is **not in this repo**. It is at
[`wellcaffeinated/wellcaffeinated.github.com`](https://github.com/wellcaffeinated/wellcaffeinated.github.com),
on the `master` branch, still served by GitHub Pages at wellcaffeinated.net.
That repo is the source for **content migration** — old posts, pages, and assets
must be copied across by hand; there is no shared git history to merge from. It
will be archived once this site is live.

When you need old content, clone or read that repo directly rather than looking
for it here.

## Commands

- `pnpm dev` — dev server (`localhost:4321`)
- `pnpm build` — production build to `dist/`
- `pnpm preview` — preview the build
- `pnpm check` — `astro check` (type-checks `.astro` + content)
- `pnpm lint` — Biome check
- `pnpm format` — Biome format (write)

## Structure

Follows Astro's recommended layout:

- `src/blog/` — blog posts as markdown; schema in `src/content.config.ts`
- `src/components/` — reusable `.astro` components (see below)
- `src/layouts/` — shared `.astro` layouts
- `src/pages/` — file-based routes (the only Astro-reserved directory)
- `src/styles/` — global CSS
- `public/` — static, unprocessed assets

### Components (reference examples)

These are intentionally small and idiomatic — follow their patterns:

- `BaseHead.astro` — `<head>` contents; typed props with a default, canonical URL
- `Header.astro` / `HeaderLink.astro` — nav; `HeaderLink` shows active-route
  detection (`Astro.url`), `...rest` prop spreading, `class:list`, `<slot>`
- `Footer.astro` — trivial static component
- `FormattedDate.astro` — one job (render a `Date` as `<time>`), reused for
  consistency; formats in UTC so calendar dates don't shift by timezone
- `PostCard.astro` — typed with `CollectionEntry<'blog'>`, composes `FormattedDate`

## Conventions

- Package manager: **pnpm** — use `pnpm`, not `npm`/`yarn`/`bun`
- Content: **Astro content collections** — add posts under `src/blog/`;
  frontmatter is validated by the Zod schema in `src/content.config.ts`
- Lint + format: **Biome** (single `biome.json`). Biome handles `.ts`/`.js`;
  **`.astro` files are excluded** from Biome and formatted by the Astro VS Code
  extension / kept consistent by hand (2-space, single quotes, no semicolons).
- Type-check `.astro` and content with `pnpm check` (`astro check`), not `tsc`.

## Deployment

Cloudflare Workers static assets, configured in `wrangler.jsonc` (no Worker
script — `assets.directory` points at `dist/`). `pnpm run deploy` builds and
publishes; Cloudflare's Workers Builds can also deploy on push once the repo is
connected.

## Agent tooling

Cloudflare's official skills are vendored in `.claude/skills/` (`cloudflare`,
`wrangler`, `workers-best-practices`) — see the README there for provenance and
how to update them. `.mcp.json` wires up the Cloudflare and Astro docs MCP
servers; prefer retrieving from those over recalling API details.

Astro publishes no skill for building sites (the ones in `withastro/astro` are
for contributing to Astro itself), so the docs MCP server is its whole surface.

## Status

Phase 0 foundation. The blog posts in `src/blog/` are **throwaway
placeholders** that exercise the pipeline — replace them with real content
migrated from the old repo (see Purpose).
See the plan in the notebook project _Website Redesign_.
