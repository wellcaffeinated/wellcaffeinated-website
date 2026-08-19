# Vendored agent skills

These are copied from upstream, not installed via `claude plugin install`, so
they are versioned with the repo and available to anyone who clones it.

| Skill | Source | Pinned commit |
|---|---|---|
| `cloudflare` | [cloudflare/skills](https://github.com/cloudflare/skills) `skills/cloudflare` | `f96bff7` (2026-08-07) |
| `wrangler` | [cloudflare/skills](https://github.com/cloudflare/skills) `skills/wrangler` | `f96bff7` (2026-08-07) |
| `workers-best-practices` | [cloudflare/skills](https://github.com/cloudflare/skills) `skills/workers-best-practices` | `f96bff7` (2026-08-07) |

The rest of the Cloudflare plugin (`agents-sdk`, `durable-objects`, `sandbox-*`,
`turnstile-spin`, `cloudflare-email-service`, `cloudflare-one*`) is omitted — none
of it applies to a static-assets site. `web-perf` and `agents-sdk` are already
installed at user scope.

Astro ships no skill for *building* sites; the eight skills in `withastro/astro`
are for contributing to the Astro monorepo. Astro's official agent surface is the
docs MCP server, wired up in `.mcp.json` alongside Cloudflare's.

## Updating

```sh
git clone --depth 1 https://github.com/cloudflare/skills.git /tmp/cf-skills
for s in cloudflare wrangler workers-best-practices; do
  rm -rf ".claude/skills/$s" && cp -r "/tmp/cf-skills/skills/$s" .claude/skills/
done
```

Then update the commit column above.
