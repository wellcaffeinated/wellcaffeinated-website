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

### The design

The site is a **shell**: a terminal-shaped frame whose output is rich UI.
Commands are chips for people who don't type; typing is opt-in. The design
record (principles, vocabulary, backlog of un-built ideas) is
`docs/planning/ideas.md`; read it before changing the interaction. It came from
the Claude Design project "Interactive portfolio redesign", whose other files
(the prototype itself) are kept outside git at
`/workspace/redesign-previews/shell-prototype/`.

Rules worth repeating: the prompt user is `guest`, never `jasper`; the site is
written `wellcaffeinated`, never abbreviated; the writing section is
**Thoughts** (the old blog is the **archive**); no jokes in the ☰ menu or in
error recovery; two exits (☰ and ↺) in every mode.

## Commands

- `pnpm dev` — dev server (`localhost:4321`)
- `pnpm build` — production build to `dist/`
- `pnpm preview` — preview the build
- `pnpm check` — `astro check` (type-checks `.astro` + content)
- `pnpm lint` — Biome check
- `pnpm format` — Biome format (write)

## Structure

- `src/lib/shell/` — **the REPL library.** Command registry, tokenizer, tab
  completion, "did you mean", and the output-descriptor types. No DOM, no
  Astro, no site knowledge; meant to be liftable into its own package.
- `src/shell/` — **this site's shell.** `commands/` (one file per command;
  `one-liners.ts` holds the fixed-reply gags, `util.ts` the shared helpers,
  `index.ts` the registration list), `render.ts` (descriptor → DOM),
  `host.ts` (wires the page: prompt, log, menu, routing, session),
  `content.ts` (the browser's content index), `router.ts` (command ⇄ URL),
  `theme.ts`, `config.ts` (chips, prompt user, boot lines, storage keys).
- `src/lib/content.ts` — server-side content helpers: sorted collections,
  reading time, and `toShellItem` (collection entry → index item).
- `content/` — **everything written**, outside `src/` on purpose.
  `thoughts/`, `archive/`, `projects/` hold markdown + frontmatter; `play/`
  holds one folder per toy (`index.md` is the writeup, an optional `toy.ts`
  is the code); `about.md` and `hello.md` are single-file collections.
  Schemas in `src/content.config.ts`, which is the only place `src/` names
  a content path.
- `src/lib/toy.ts` — the toy contract (`mount({ el, constants })`) and
  `loadToy(slug)`, which finds `content/play/<slug>/toy.ts` through
  `import.meta.glob`.
- `src/components/shell/` — the chrome: `TopBar`, `Dock` (chips + prompt),
  `Log`, `Menu`, `TakeoverBar`, `ThemeScript`, `BrokenOverlay`.
- `src/components/content/` — content views: `ArticleView`, `ProjectView`,
  `ToyFrame`, `ManPage`, and `CardGrid` / `RowList` / `Listing` (static twins of
  the log renderers for section pages).
- `src/layouts/ShellLayout.astro` — every page. `mode="shell"` (log + prompt) or
  `mode="takeover"` (content + bars).
- `src/pages/` — `/` (the shell), `/404`, `/about`, `/{thoughts,archive,
  projects,play}/` and `[slug]` pages, `/shell/index.json` (the content index).
- `src/styles/` — `theme.css` (all tokens), `global.css` (reset, prose),
  `shell.css` (log + descriptor classes; global because the renderer creates
  those nodes in the browser).

## The content boundary

`src/` is the foundation; `content/` is what Jasper writes. The direction
of dependency is one way: content may import site helpers via the `@lib/*`
alias (`tsconfig.json` → `src/lib/`), and `src/` discovers content only
through the collection loaders and `loadToy`. Nothing in `src/` imports a
specific piece of content, so deleting a toy folder cannot break the site
and adding one never touches `src/`.

A toy that needs code adds `toy.ts` next to its `index.md`:

```ts
import type { ToyModule } from '@lib/toy'
export const mount: ToyModule['mount'] = ({ el, constants }) => {
  // draw into el; constants come from the frontmatter, by name
  return () => {} // optional cleanup
}
```

If a toy ever needs a heavy dependency the rest of the site should not
carry, promote it to a pnpm workspace package; until then a folder is enough.

## How the shell works

- **Descriptors are the contract.** Commands return plain objects
  (`text`, `cards`, `rows`, `help`, `error`, `search`, `html`, `navigate`); see
  `src/lib/shell/types.ts`. `render.ts` has one renderer per type in its
  `RENDERERS` table. Adding an output shape = one type + one renderer.
  Commands never touch the DOM.
- **Side effects go through `ctx`** (`src/shell/context.ts`): theme, restart,
  menu, history, break, fragments. Add to it deliberately.
- **Tiers:** `shown` (chips) · `hinted` (listed in `help`) · `hidden` (never
  listed, never tab-completed).
- **URLs.** Commands with log output live in the hash of `/` (`/#ls+projects`);
  back/forward replays them. Content opens real pages (`/thoughts/<slug>/`).
  Everything runnable is rendered as a real `<a href>` (`router.ts` picks the
  href), so the site navigates without JavaScript.
- **Session.** The log and history are kept in `sessionStorage` across the
  trip to a content page and back; returning marks the opening entry ✓.
- **`cmd:` links.** Markdown can run commands: `[projects](cmd:ls+projects)`.
  Spaces are `+` because CommonMark link destinations cannot contain spaces.
- **Theme.** `data-theme` on `<html>`, tokens in `theme.css`, names in
  `theme.ts`. Add a theme by adding a CSS block and a name.

## Conventions

- Package manager: **pnpm** — use `pnpm`, not `npm`/`yarn`/`bun`
- Content: **Astro content collections** under `src/<section>/`; frontmatter is
  validated by the Zod schemas in `src/content.config.ts`
- Lint + format: **Biome** (single `biome.json`). Biome handles `.ts`/`.js`/`.css`;
  **`.astro` files are excluded** from Biome and formatted by the Astro VS Code
  extension / kept consistent by hand (2-space, single quotes, no semicolons).
- Type-check `.astro` and content with `pnpm check` (`astro check`), not `tsc`.
- Comments explain *why*, not what. Prefer a new command object to new UI.

## Code style

The full conventions are the "Coding Preferences" note in Jasper's notebook
(`03 Resources/Coding/Coding Preferences.md`); read it before writing code.
Biome enforces what a linter can (`===`, template literals, `for…of`, no
nested ternaries, no parameter reassignment, early returns over `else`,
naming, kebab-case filenames, no `console`). The rest is by hand:

- One file per command in `src/shell/commands/` unless that is genuinely
  awkward (`one-liners.ts` is the exception: fixed replies, no logic).
- Dispatch tables over `switch` / `if` chains when branching on a key.
- `+= 1`, never `++`. Braces on any `if` the formatter breaks across lines.
- Immutable by default: spread, `map` / `filter` / `flatMap`; no `push` into
  shared arrays. Pass named callbacks point-free.
- Module-level constants in `UPPER_SNAKE_CASE`, showing their derivation;
  locals stay `camelCase`. Name things so comments become unnecessary.
- Factories over classes; dependencies passed in, not imported at module scope.
- `satisfies` over `as`; `unknown` over `any`; let obvious types infer.
- An options object once a function needs more than 3–4 positional arguments.

## Deployment

Cloudflare Workers static assets, configured in `wrangler.jsonc` (no Worker
script — `assets.directory` points at `dist/`). `pnpm run deploy` builds and
publishes; Cloudflare's Workers Builds can also deploy on push once the repo is
connected.

## Agent tooling

Cloudflare's official skills are vendored in `.claude/skills/` (`cloudflare`,
`wrangler`, `workers-best-practices`) — see the README there for provenance and
how to update them. `.mcp.json` wires up the Cloudflare, Astro, and MDN docs
MCP servers; prefer retrieving from those over recalling API details.

MDN's server is experimental and Mozilla logs queries during that phase, so the
config sends `X-Moz-1st-Party-Data-Opt-Out: 1`. It may be withdrawn at any time.

Astro publishes no skill for building sites (the ones in `withastro/astro` are
for contributing to Astro itself), so the docs MCP server is its whole surface.

## Status

Shell foundation. The archive holds four real posts migrated from the old
site; thoughts, projects and toys are mostly **placeholders** marked as such in
their bodies. Toys are slots (`ToyFrame` mounts a `toy.ts` when a folder
has one; none do yet). Search is a
substring match over titles, tags and descriptions (`src/shell/search.ts`);
Pagefind is the intended swap. Not built yet, on purpose: games, the idle
white-rabbit sequence, `set` for toy constants, the ✦ discovery counter, real
physics for `rm -rf /`. See `docs/planning/ideas.md` for each.
