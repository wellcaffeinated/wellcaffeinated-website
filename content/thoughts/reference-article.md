---
title: 'Reference · writing a thought'
description: 'Every field a post can carry, what each one does, and the few tricks markdown has here. Dev only.'
pubDate: 2026-09-15
updatedDate: 2026-09-15
tags: ['reference']
status: 'reference'
---

This post is a reference. `status: 'reference'` keeps it in the repo and off
the live site, so it appears in `pnpm dev` and never in `pnpm build`. The
`✎ reference · dev only` tag in the bar above is how you can tell.

## Where it goes

One markdown file in `content/thoughts/`. **The filename is the URL** —
this file is `reference-article.md`, so the page is `/thoughts/reference-article/`.
No folder, no `index.md`; those are only for toys, which need somewhere to put
their code.

The old blog lives in `content/archive/` and takes the same fields plus one
more, `legacyPath`, which records the URL the post had on wellcaffeinated.net
so the redirect can be written at cutover.

## The frontmatter

```yaml
---
# required
title: 'Reference · writing a thought'
description: 'Shown in listings, in search and in <meta>.'
pubDate: 2026-09-15

# optional
updatedDate: 2026-09-15
tags: ['reference']
status: 'reference'   # or 'draft'; absent means published
---
```

That is the whole schema. It is enforced by Zod in `src/content.config.ts`, so
a typo fails `pnpm check` rather than shipping quietly.

Two things you do **not** write: the reading time, which is counted from the
body, and the slug, which is the filename.

## Links that run commands

A markdown link can run a shell command instead of going to a URL:

```markdown
[things I've made](cmd:ls+projects)
```

Spaces are written as `+`, because CommonMark link destinations cannot contain
spaces. Try them: [ls play](cmd:ls+play) ·
[open this toy](cmd:open+play/reference-toy) · [man jasper](cmd:man+jasper).

One caveat: a command link written in prose keeps its `cmd:` href in the HTML
and works because the shell intercepts the click, so it needs JavaScript. The
chips, cards and rows the shell builds itself are rendered as real URLs and
navigate without it. Use a command link for a flourish, not as the only way to
reach something.

Any command works — `ls`, `open`, `man`, `grep`, `theme`, `play`. `open` takes
`section/slug`, exactly as it appears in the URL.

## Figures

A live figure is a plain `<figure>` with a class the stylesheet knows about:

```html
<figure class="live-figure" aria-label="what it shows">
  <figcaption>The caption goes here.</figcaption>
</figure>
```

Markdown and HTML mix freely, so anything you can write in HTML you can drop in
mid-post. For something interactive that needs code, write a toy instead and
link to it — see [the toy reference](cmd:open+play/reference-toy).

## While you are writing it

Set `status: 'draft'`. It behaves exactly like this post: visible in dev,
absent from the build, tagged in every listing. When it is ready, delete the
line. Nothing else changes — the URL it had in dev is the URL it ships with.
