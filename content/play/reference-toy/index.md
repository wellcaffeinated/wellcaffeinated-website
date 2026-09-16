---
title: 'Reference · making a toy'
description: 'The folder, the contract, the constants and the layouts. Dev only.'
tags: ['reference']
color: '#101a22'
ink: '#cfe7e4'
layout: 'article'
aspect: 2.2
constants:
  - { name: 'dots', value: 7 }
  - { name: 'speed', value: 0.35, unit: 'turns/s' }
order: 999
status: 'reference'
---

The figure above is this folder's `toy.ts`, running. It is about sixty lines
and has no dependencies, so it is worth reading start to finish before you
write your own.

This page is also demonstrating itself: `layout: 'article'` is why you are
reading a column with the toy as a figure rather than a full-bleed sphere.

## The folder

A toy is a folder in `content/play/`. **The folder name is the URL** — this one
is `reference-toy/`, so the page is `/play/reference-toy/`.

```
content/play/reference-toy/
  index.md       required — the writeup and the frontmatter
  toy.ts         optional — the code
  package.json   optional — libraries this toy alone needs
  layout.astro   optional — its own arrangement of the page
```

Only `index.md` is required. Without a `toy.ts` the page is a labelled slot,
which is how a toy can exist as an idea before it exists as code.

Nothing in `src/` ever names a toy. Adding this folder touched no other file,
and deleting it cannot break the site.

## The contract

`toy.ts` exports one function:

```ts
import type { ToyModule } from '@lib/toy'

export const mount: ToyModule['mount'] = ({ el, constants, onResize }) => {
  // draw into el
  return () => {} // optional cleanup
}
```

- **`el`** is the box you paint in. It is *not* the viewport: a layout decides
  how big it is, so never measure `window`.
- **`constants`** are the frontmatter constants, by name, as numbers. Always
  supply a fallback — `constants.speed ?? DEFAULT_SPEED` — so the toy still
  runs if the frontmatter loses a line.
- **`onResize`** fires whenever `el` changes size, including once on mount.
  This is the only correct way to size a canvas, because a column can reflow
  without the window changing.
- The **returned function** stops anything that would outlive the page: an
  animation frame, an interval, a listener you added elsewhere.

`@lib/*` is the alias for `src/lib/`, and it is the only thing content may
import from the site. Those helpers depend on nothing, so they work no matter
which library versions a toy pins.

## Frontmatter

```yaml
# required
title: 'Reference · making a toy'
description: 'Shown in listings, in search and in <meta>.'

# optional
tags: ['reference']
color: '#101a22'      # the toy's background
ink: '#cfe7e4'        # the toy's foreground
layout: 'article'     # 'stage' (default), 'article' or 'scroll'
aspect: 2.2           # width : height, where a layout gives it a box
places:               # moves chrome between corners, or 'none' to hide
  notes: 'bottom-left'
  constants: 'top-right'
constants:            # each needs a name and a number; unit is optional
  - { name: 'dots', value: 7 }
  - { name: 'speed', value: 0.35, unit: 'turns/s' }
tilt: false           # says the toy uses device tilt
game: false           # marks it a game in listings
order: 999            # lower sorts first; ties fall back to title
status: 'reference'   # or 'draft'; absent means published
```

## Layouts

`layout` picks how the page is arranged around the toy:

- **`stage`** — the default. The toy owns everything between the bars and the
  writeup sits on top of it. [See one](cmd:open+play/bloch-sphere).
- **`article`** — this page. A reading column with the toy as a figure at
  `aspect`, and the page scrolls.
- **`scroll`** — the toy pinned in place while the writing scrolls past it.

If none of them fit, add a `layout.astro` to the folder and it wins over this
field. It is handed the same props a built-in layout gets, and owes back only
`data-toy-mount` on the element the toy should paint into and a `<slot />` for
the writeup. `content/play/bloch-sphere/` is the worked example: its layout
writes gate buttons and a readout, and its `toy.ts` drives them through
`data-*` attributes that nothing outside that folder reads.

Both files are compiled with the site, so a syntax error or an unresolvable
import in either fails `pnpm build` — and because that script runs
`astro check` first, so does a type error. What differs is *when the code
runs*: a `layout.astro` runs at build time, so a mistake in what it does stops
the build; `toy.ts` runs only in a browser, so a mistake in `mount` breaks this
page and nothing else. Nothing runs a toy headlessly, so its behaviour is still
only checked by opening the page.

## Libraries

A toy that needs libraries lists them in its own `package.json`:

```json
{
  "name": "@toys/reference-toy",
  "private": true,
  "type": "module",
  "dependencies": { "three": "^0.175.0" }
}
```

Then `pnpm install` at the root. Every `content/play/*` folder is a workspace
package, so each toy resolves its own copy: two toys can pin different versions
of the same library, and a new toy built against a newer release cannot break
an older one. Vite gives each toy its own lazy chunk, so a library downloads
only when its toy is opened.

## While you are building it

Set `status: 'draft'`. The toy is visible in dev, absent from the build, and
tagged in every listing. Delete the line when it is ready.

One caveat worth knowing: `status` hides the **page** and the search index, but
not the **code**. `toy.ts` is found by `import.meta.glob`, which enumerates at
build time and cannot see frontmatter, so a draft toy's compiled module is
still emitted into `dist/`, still named in the shipped loader, and still has to
type-check before `pnpm build` will pass. Nobody can navigate to it, but it is
deployed. That is fine for a sketch; if a draft pins something heavy, remember
it is riding along.

So `status` is the wrong tool for code that is not ready to compile. Put that
folder under a `_` name instead — `content/play/_scratch/`. A `_` segment means
"not part of the site" to the content loaders, to the globs that find `toy.ts`
and `layout.astro`, and to `tsconfig.json`, so nothing under it is loaded,
bundled or type-checked, and nothing under it can fail a build. Rename it when
it compiles.
