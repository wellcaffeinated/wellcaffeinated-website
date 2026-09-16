// The smallest toy that is still a real one: it reads its constants, sizes
// itself to whatever box the layout gives it, and cleans up after itself.
// Deliberately dependency-free — see index.md for how a toy brings libraries.
import type { ToyModule } from '@lib/toy'

const TWO_PI = Math.PI * 2
const MS_PER_S = 1000

const DEFAULT_DOTS = 7
const DEFAULT_SPEED = 0.35

/** Fraction of the box's short side used as the ring's radius. */
const RADIUS_FRACTION = 0.34

const readInk = (el: HTMLElement) =>
  getComputedStyle(el).getPropertyValue('--toy-ink').trim() || '#e8e8e8'

export const mount: ToyModule['mount'] = ({ el, constants, onResize }) => {
  const canvas = document.createElement('canvas')
  canvas.style.display = 'block'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  el.append(canvas)

  const context = canvas.getContext('2d')
  if (!context) return undefined

  // Constants come from the frontmatter, by name, and are numbers.
  const dots = Math.max(1, Math.round(constants.dots ?? DEFAULT_DOTS))
  const speed = constants.speed ?? DEFAULT_SPEED
  const ink = readInk(el)

  let box = { width: 0, height: 0 }

  // Never measure the window: the layout owns the box, and an article column
  // can resize when the window does not.
  onResize(({ width, height }) => {
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    box = { width, height }
  })

  const started = performance.now()
  let frame = 0

  // An arrow declared after the null check, so `context` stays narrowed.
  const draw = (now: number) => {
    const { width, height } = box
    const turn = ((now - started) / MS_PER_S) * speed * TWO_PI
    const radius = Math.min(width, height) * RADIUS_FRACTION

    context.clearRect(0, 0, width, height)
    context.fillStyle = ink

    for (let i = 0; i < dots; i += 1) {
      const angle = turn + (i / dots) * TWO_PI
      const x = width / 2 + Math.cos(angle) * radius
      const y = height / 2 + Math.sin(angle) * radius
      // The leading dot is the biggest; the rest taper off behind it.
      const size = 2 + 5 * (1 - i / dots)
      context.globalAlpha = 1 - (i / dots) * 0.75
      context.beginPath()
      context.arc(x, y, size, 0, TWO_PI)
      context.fill()
    }

    frame = requestAnimationFrame(draw)
  }

  frame = requestAnimationFrame(draw)

  // Returned cleanup: stop anything that would outlive the page.
  return () => cancelAnimationFrame(frame)
}
