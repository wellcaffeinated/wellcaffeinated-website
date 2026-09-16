---
title: 'Reference · adding a project'
description: 'What a project entry carries and how it is sorted. Dev only.'
kind: personal
years: '2026–'
alive: true
tags: ['reference']
role: 'author'
stack: 'astro, typescript'
links:
  - { label: 'github', href: 'https://github.com/wellcaffeinated' }
order: 999
status: 'reference'
---

One markdown file in `content/projects/`. **The filename is the URL** — this
is `reference-project.md`, so the page is `/projects/reference-project/`.

## The frontmatter

```yaml
# required
title: 'Reference · adding a project'
description: 'Shown in listings, in search and in <meta>.'
kind: personal        # 'personal' or 'professional'
years: '2026–'        # free text

# optional
alive: true           # badge: '● alive' when true, 'retired' when false
tags: ['reference']
role: 'author'
stack: 'astro, typescript'
links:                # each needs a label and an href
  - { label: 'github', href: 'https://github.com/wellcaffeinated' }
order: 999            # lower sorts first; ties fall back to title
status: 'reference'   # or 'draft'; absent means published
```

Projects sort by `order`, not by date — the list is a judgement about what
matters, not a timeline. Leave `order` off and it defaults to 100, which puts
the entry after anything deliberately ranked and before anything deliberately
buried.

`alive` is the only field that changes what a card says on its own: it is the
badge in `ls projects`. When a project dies, set it to `false` rather than
deleting the entry — [PhysicsJS](cmd:open+projects/physicsjs) is the example.

## The body

Plain markdown, and the same [command links](cmd:ls+projects) that work
everywhere else. If a project has an announcement post in the archive, link to
it with `open`:

```markdown
[the announcement](cmd:open+archive/<slug>)
```

## While you are writing it

`status: 'draft'` keeps it in dev and out of the build. See
[the article reference](cmd:open+thoughts/reference-article) for the rest of
how that works, and [the toy reference](cmd:open+play/reference-toy) for
anything that needs code.
