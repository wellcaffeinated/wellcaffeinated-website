// The contract between the site and a toy. A toy is a folder under
// content/play/; if it has a toy.ts, ToyFrame loads it by slug and calls
// `mount`. Toys may import from src/lib via `@lib/*`; nothing in src ever
// imports a specific toy.

export type ToyConstants = Record<string, number>

export interface ToyContext {
  /** The frame the toy owns: everything between the bars. */
  el: HTMLElement
  /** The `constants` from the toy's frontmatter, by name. */
  constants: ToyConstants
}

export type Unmount = () => void

export interface ToyModule {
  mount(ctx: ToyContext): Unmount | undefined
}

const TOY_MODULES = import.meta.glob<ToyModule>('/content/play/*/toy.ts')

const toyModulePath = (slug: string) => `/content/play/${slug}/toy.ts`

/** The toy's module, or null when the folder has no toy.ts (a slot). */
export function loadToy(slug: string): Promise<ToyModule> | null {
  const load = TOY_MODULES[toyModulePath(slug)]
  return load ? load() : null
}
