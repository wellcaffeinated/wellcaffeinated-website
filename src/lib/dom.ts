export type Child = Node | string | number | null | undefined | false
type Attrs = Record<string, string | number | boolean | null | undefined>

const isAbsent = (value: unknown): value is null | undefined | false =>
  value === null || value === undefined || value === false

/** `h('a', { href, class: 'x' }, 'text')` — the smallest useful element builder. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (isAbsent(value)) continue
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
  return children
    .filter((child): child is Node | string | number => !isAbsent(child))
    .map((child) => (typeof child === 'number' ? String(child) : child))
}
