// The contract between the site and a toy. A toy is a folder under
// content/play/; if it has a toy.ts, ToyFrame loads it by slug and calls
// `mount`. Toys may import from src/lib via `@lib/*`; nothing in src ever
// imports a specific toy.

export type ToyConstants = Record<string, number>

export interface ToySize {
  width: number
  height: number
}

export interface ToyContext {
  /**
   * The box the toy paints in. Its size is the layout's business, not the
   * toy's: do not assume it fills the viewport, and do not assume it only
   * changes when the window does.
   */
  el: HTMLElement
  /** The `constants` from the toy's frontmatter, by name. */
  constants: ToyConstants
  /** Runs whenever `el` changes size, including once on mount. */
  onResize(callback: (size: ToySize) => void): void
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

/**
 * The context handed to `mount`. The size observer lives as long as the page,
 * which a takeover throws away on navigation.
 */
export function createToyContext(
  el: HTMLElement,
  constants: ToyConstants,
): ToyContext {
  const callbacks = new Set<(size: ToySize) => void>()
  const notify = () => {
    const size = { width: el.clientWidth, height: el.clientHeight }
    for (const callback of callbacks) {
      callback(size)
    }
  }
  const observer = new ResizeObserver(notify)
  observer.observe(el)

  return {
    el,
    constants,
    onResize(callback) {
      callbacks.add(callback)
    },
  }
}
