# ideas.md — design record for wellcaffeinated.net

Purpose: let an agent (or future me) understand how the redesign reached its current direction,
and keep a record of everything discussed but not yet prototyped. Companion to `README.md`
(architecture) and `Wellcaffeinated Redesign Concepts.dc.html` (visual explorations, turns 1–4).

## 1. The brief (Jasper, verbatim intent)

- Redesign wellcaffeinated.net. Deemphasize the blog. Fully open to removing stale UI artifacts.
- Purpose of the site: show off projects (personal and professional), write about ideas, have fun.
- "I am a developer of interactive simulations. My website itself should be an expression of this,
  not just a bland portfolio."
- Inspirations: acko.net, thewildernessdowntown.com, milk.co/forest.html,
  worrydream.com/MediaForThinkingTheUnthinkable (but not his later redesign).
- Restrictions: good UX on mobile; appropriate for non-technical visitors without dumbing down the
  fun for developers who "get it"; UI must not get in the way of content.
- Iterate slowly, exploration is key.

## 2. Jasper's initial concept ideas

1. **Planetary system** — the site as a 3D system; exploring content is exploring planets.
2. **Inversion of expectations / 4th wall** — the code is visible and central.
3. **Terminal UI** — but doesn't require typing if you don't want to.
4. **Easter eggs for developers.**

## 3. Decisions from the question rounds

- Explore: planetary, visible code, terminal, and a quiet text-first option (not the "content
  floating in a physics world" option).
- Featured projects: MinuteLabs.io, docs.twine.world; treat as placeholders since the list will
  change over the years. (Old portfolio: PhysicsJS, Sheep Bounce, Corner Reflectors, YouTube
  Subtitle Explorer.)
- Sections: Projects, Ideas/writing, Play/experiments, About. Old blog buried as an archive.
- Scope of round one: homepage only. Mobile: decide per concept. Fidelity: rough, many. Tone: playful.
- Landing: full experience (the concept dominates the first two seconds). Motion: always alive.
  Palette: show both dark and light.
- Easter-egg flavors wanted: hidden console commands, tweakable physics constants,
  "something breaks on purpose", surprise me.
- "You don't need to create a physics simulation library for just this sketch. I just want big
  ideas. Think storyboard."

## 4. Concept round (turn 1) — what was shown, what was picked

- **1a Orbits** (dark): star = about, planets = sections, moons = projects; click flies in, content
  is a plain column over the planet; fling a planet past escape velocity → nav degrades to a
  boring list. Archive is a distant frozen rock.
- **1b Source** (light): half code / half rendered output; highlighted literals are live controls
  (`coffee = 6` makes headings jitter); deleting `render(...)` "crashes" into a stack trace that
  is the bio.
- **1c Shell** (dark): terminal whose output is rich UI, commands are chips; `rm -rf /` collapses
  the page under gravity then reboots.
- **1d Quiet** (light): essay-like page where the paper is a particle field that avoids the text;
  press-and-hold the name and letters fall.
- **Picked: 1c.** "I love the inside jokes. And we could hide more."
  Suggested pairing kept in mind: 1d as the inner reading-page feel inside 1c's frame.

## 5. Shell direction — principles agreed (turns 2–4)

- **The shell is a frame, not a skin.** Commands produce whatever the content wants to be (cards,
  essays, WebGL toys). Only the prompt, log and chrome are "terminal".
- **Always two exits.** ☰ menu (plain, no jokes, big targets) and ↺ restart in the top bar in every
  mode. `esc` always closes what's open. Every command is a URL (back/forward works).
- **Chips + thumbnails are the primary navigation** for non-technical visitors. Tapping a chip
  visibly types the command so visitors learn the language by watching. Typing is opt-in.
- **Three command tiers.** Shown (chips) · Hinted (listed in `help` with vague descriptions) ·
  Hidden (never listed, never tab-completed; discovered by poking). `help` should feel like a REPL
  and be intentionally secretive about some commands.
- **Two modes.** Shell (scrolling log, everything appends; history is scrollable like a real
  terminal) and Takeover (articles, project pages, toys, about replace the shell view; the bar
  stays; returning collapses the visit to one ✓ line in the log).
- **Never a bare error.** Unknown command → honest line + did-you-mean + chips. Three unknowns in a
  row auto-opens ☰. 404 is treated exactly like a failed command, with a fuzzy search of the URL's
  words and a one-tap "open" on the best match.
- **Vocabulary.** Prompt user is `guest` (never `jasper`). Never abbreviate the site to "WC"
  (bathroom in Europe). Section is **Thoughts**, not Ideas/Blog. Commands: `help` not `/help`.
  Visiting anything always starts with `open` (`open thoughts/…`, `open projects/…`,
  `open play/…`). Listing is `ls` (`ls projects`, `ls thoughts`, `ls play`). About is `man jasper`.
- **Tab completion must be assessed for accessibility.** Only intercept Tab when the prompt has a
  partial word and a completion exists; show completions as visible chips too; announce via
  `aria-live`; nothing is Tab-only.
- **Content pipeline.** `cat hello.md` renders real markdown; articles will be markdown with live
  figures. `cmd:` links in markdown run shell commands.

## 6. Ideas discussed, NOT yet prototyped (the backlog)

### Easter eggs / hidden commands
- **Idle white rabbit** (~90 s inactivity, desktop, once per session): screen dims, green text
  types "Wake up, guest… The simulation has you. Follow the white rabbit." A white rabbit hops to
  the prompt; clicking runs `cd ~/.rabbit-hole`, unlocks `theme matrix`, starts the ✦ counter.
  Any key/click cancels instantly.
- `rm -rf /` → every glyph on screen falls under real physics, then reboots ("just kidding").
  Currently a placeholder overlay.
- `sudo make coffee` → a cup fills, heading jitter ×3 for 60 s.
- `theme crt` (scanlines, curvature), `theme matrix` (unlocked by the rabbit), `theme paper`
  exists. Also `theme light|dark|paper|???` listing in help.
- `gravity 0.3` / `set G 6.674e-11` → site-wide tweakable constants that all toys inherit.
- `ls ~/.secrets` → "nice try" plus one real secret. `ls -la` shows drafts' titles and dotfiles.
- `exit` → fake tab close for 1 s, then "you can't leave." `vim` → "no." (`:q` works.)
- `cat /dev/coffee` → endless stream, ctrl-c stops. `date` → correct time, then "you have time."
- `ping henry` → "pong. (minutephysics)". `curl acko.net` → "inspiration. go."
- `pwd` → "Wherever you go, there you are." `whoami` → "guest. (you, presumably)". `who` →
  "jasper, and you. it's quiet." `uptime` → "since 2012. mostly." `cd ~` → "you're already home."
  `sudo` → "guest is not in the sudoers file. this incident will not be reported." `fortune` →
  a line from an old post. (Most of these one-liners are in the prototype already.)
- `grep -v` shows everything not matching. `cat thoughts/*` prints a word count and refuses.
- `git log projects/physicsjs` → changelog ending "retired, fondly."
- `open /dev/null` → "it's very quiet in here." Ten 404s in one session → the lost creature
  brings a friend.
- **✦ discovery counter**: finding a hidden command adds a mark in the bar / menu (e.g. 3/12),
  persisted in localStorage. Devs collect; nobody else sees it until they earn it.
- `mail jasper` opens a mailto with the subject prefilled from your last command ("re: rm -rf /").

### Games (need their own design pass)
- **orbit-lander** — Jasper's take on Lunar Lander with real orbital mechanics, trajectory
  preview for non-gamers, chips ◄ ► ▲ on mobile, `set g`/`set fuel` work mid-flight (cheating is
  logged), landing prints a receipt to the log.
- Alternatives floated: `snake` made of coffee beans; `2048` with physical constants instead of
  numbers; two-body `pong` where the ball orbits the paddles.

### Play / toys
- Toys own the whole area between the bars and paint in their own style; ⛶ true fullscreen with
  the prompt as a swipe-up. Toys declare `constants`; the shell renders a draggable readout and
  exposes them as `set <name> <value>`. Sound opt-in everywhere; tilt-enabled toys say so.

### Thoughts / archive navigation
- `ls thoughts` with tag chips, grouped by year, reading time, "fig" mark for live figures;
  archive as a single collapsed row.
- `grep <word>` searches essays, projects, toys with highlighted excerpts; typing after `grep`
  filters live. A "Search" chip for non-typers prefills `grep `.
- `ls thoughts --timeline` — bar-per-year histogram as navigation; the quiet years are part of
  the story.
- Archived posts render with a banner: `// archived 2014. the internet was different.` No Disqus,
  no share buttons. Old URLs get real redirects where possible; 404 fallback otherwise.

### Article / reading view
- Serif, wide measure, generous leading; figures are light "paper" panels that break the dark
  theme on purpose and can be anything (canvas, WebGL, Twine embed). Bret Victor-style live
  figures inline.
- Bottom bar: sleeping prompt with contextual suggestions (next, prev, related); reading progress
  as a tiny bar-graph glyph; `grep` while reading searches the site, not the page.

### About
- `man jasper` man page; "currently: available-ish" as a single editable availability field;
  `whoami` offers "did you mean man jasper?"

### Menu (☰)
- Full-screen sheet on mobile / anchored panel on desktop; four big rows with the command taught
  in the margin; Search, Help, Start over; theme / sound / rss footer; "Where you've been" (the
  log reduced to titles, with reading progress) — chosen variant 4b.

### Boot
- 1-second startup log that is also the tagline: `booting wellcaffeinated… ✓ coffee ✓ physics
  ~ blog (deprecated, kept warm)`. Skippable by any key/tap.

### Parked concepts (from turn 1, not pursued)
- Orbits / planetary system; Source / visible code with live literals; Quiet particle-paper page.
  The "crash-into-a-stack-trace bio" and "letters fall when you hold the title" gags could be
  ported into the shell as hidden commands if wanted.

## 7. My ideas (agent's own suggestions, not yet discussed)

- **`pipe` and `|` for real.** `ls thoughts | grep physics`, `ls projects | sort year`,
  `history | tail`. Cheap to implement over descriptor lists, and it's the single most
  "terminal person" thing to try.
- **Commands as shareable URLs, visibly.** `share` copies the current command's URL; the takeover
  bar shows it. Makes the "every command is a URL" rule legible to non-devs.
- **`man <toy>`** — every toy gets a man page auto-generated from its constants and controls, so
  the about-page format doubles as documentation for play.
- **Accidental-discovery hint.** After ~5 minutes of only chip use, one muted line appears once:
  `// you can also type. try "help".` The reverse onboarding: teach typing only to people who
  have shown they'll stay.
- **`ls` output shows mtime.** Dates as `Sep 14 2026` in the row meta, sorted newest first,
  so freshness is visible without a "Recent" section.
- **Reading-position memory.** Log entries for articles keep `read 23%`; reopening resumes there.
  Persist in localStorage keyed by slug.
- **Ambient motion that costs nothing.** "Always alive" without a sim: the cursor block breathes,
  the boot log's ✓ marks tick in, cards tilt 1° on hover. Save real physics for toys and the
  `rm -rf /` gag.
- **Guest can `alias`.** `alias p="ls projects"` persisted locally. Pointless, delightful, and
  a natural home for a ✦.
- **Print stylesheet as an easter egg.** Printing the site yields a real résumé (`man jasper`
  formatted as a one-pager). `lp` / `print` command hints at it.
- **A `--verbose` flag site-wide.** `ls projects --verbose` shows role/stack inline; `open …
  --verbose` shows the article's source markdown next to it — a small nod to the abandoned
  "visible code" concept.
- **Keep the light theme first-class.** Paper theme exists; make sure figures/toys pick their own
  ink so both themes stay readable. Consider following `prefers-color-scheme` on first visit.
- **Broken-on-purpose budget.** Limit "something breaks" gags to ones that are reversible in one
  tap (↺). Never break the ☰ menu.
