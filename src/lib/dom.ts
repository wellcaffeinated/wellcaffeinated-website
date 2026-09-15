export type Child = Node | string | number | null | undefined | false
type Attrs = Record<string, string | number | boolean | null | undefined>

/** `h('a', { href, class: 'x' }, 'text')` — the smallest useful element builder. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue
    el.setAttribute(key, value === true ? '' : String(value))
  }
  el.append(...present(children))
  return el
}

export function fragment(...children: Child[]): DocumentFragment {
  const f = document.createDocumentFragment()
  f.append(...present(children))
  return f
}

function present(children: Child[]): (Node | string)[] {
  const out: (Node | string)[] = []
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue
    out.push(typeof c === 'number' ? String(c) : c)
  }
  return out
}
