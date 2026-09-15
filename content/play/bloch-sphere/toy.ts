// A qubit on the Bloch sphere: it walks a closed loop of gates on its own, and
// the controls in layout.astro let you take over — apply a gate, step the loop,
// send it home. The trail is the states it has visited.
//
// The controls are optional. Everything below degrades to the autoplaying loop
// when there is no [data-lab] around the mount, which is what the built-in
// layouts give it.
import type { ToyModule } from '@lib/toy'
import {
  BlochSphere,
  BlochVector,
  gates,
  type Operator,
  PathDisplay,
  QubitDisplay,
} from '@qbead/bloch-sphere'
import { Color } from 'three'

const DEGREES = Math.PI / 180
const MS_PER_S = 1000

/** Gap between the end of one gate's animation and the start of the next. */
const HOLD_FRACTION = 0.4

const DEFAULT_STEP_S = 1.2
const DEFAULT_PHASE_DEG = 90

const QUBIT_COLOR = 0xe1b53e
const TRAIL_COLOR = 0xdcdee8

const ORIGIN = () => BlochVector.fromAngles(0, 0)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** The keys in layout.astro, by the name each one carries. */
const GATES: Record<string, (phase: number) => Operator> = {
  h: () => gates.hadamard(),
  x: () => gates.x(),
  y: () => gates.y(),
  z: () => gates.z(),
  s: (phase) => gates.rz(phase),
}

/** From |0⟩: onto the equator, four turns around it, and home again. */
const loopOf = (phase: number): Operator[] => [
  gates.hadamard(),
  gates.rz(phase),
  gates.rz(phase),
  gates.rz(phase),
  gates.rz(phase),
  gates.hadamard(),
]

/** The frame paints `--toy-bg`; the scene matches it so the canvas has no seam. */
function backgroundOf(el: HTMLElement): Color | undefined {
  const value = getComputedStyle(el).getPropertyValue('--toy-bg').trim()
  return value ? new Color(value) : undefined
}

function createSphere(el: HTMLElement): BlochSphere {
  const sphere = new BlochSphere({
    fontSize: 1,
    showGrid: true,
    backgroundColor: backgroundOf(el),
    cameraState: { theta: 70 * DEGREES, phi: 35 * DEGREES, zoom: 1.1 },
  })
  sphere.attach(el)
  return sphere
}

const degreesOf = (radians: number) => `${(radians / DEGREES).toFixed(1)}°`

export const mount: ToyModule['mount'] = ({ el, constants, onResize }) => {
  const stepMs = (constants.step ?? DEFAULT_STEP_S) * MS_PER_S
  const phase = (constants.phase ?? DEFAULT_PHASE_DEG) * DEGREES
  const loop = loopOf(phase)

  const sphere = createSphere(el)
  const qubit = new QubitDisplay(ORIGIN())
  qubit.color = QUBIT_COLOR
  const trail = new PathDisplay()
  trail.color = TRAIL_COLOR
  sphere.add(trail)
  sphere.add(qubit)

  const lab = el.closest<HTMLElement>('[data-lab]')
  const readouts = {
    theta: lab?.querySelector<HTMLElement>('[data-readout="theta"]'),
    phi: lab?.querySelector<HTMLElement>('[data-readout="phi"]'),
  }

  let visited = [qubit.state.clone()]
  let index = 0
  let busy = false
  let playing = true

  const setPlaying = (next: boolean) => {
    playing = next
    if (lab) {
      lab.dataset.playing = String(next)
    }
  }

  /** A tube needs two ends; one visited state draws nothing. */
  const showTrail = (states: BlochVector[]) => {
    if (states.length > 1) {
      trail.set(states)
    }
  }

  async function apply(gate: Operator) {
    if (busy) return
    busy = true
    const next = qubit.state.applyOperator(gate)
    await qubit.set(next, stepMs)
    visited = [...visited, next]
    showTrail(visited)
    busy = false
  }

  /** The next gate in the loop, trimming the trail each time it closes. */
  async function advance() {
    if (index === 0) {
      trail.clear()
      visited = visited.slice(-1)
    }
    await apply(loop[index])
    index = (index + 1) % loop.length
  }

  async function autoplay() {
    while (playing) {
      await advance()
      if (!playing) return
      await sleep(stepMs * HOLD_FRACTION)
    }
  }

  // Animating home cancels whatever was in flight, which a duration of 0
  // would not.
  async function reset() {
    setPlaying(false)
    index = 0
    trail.clear()
    busy = true
    await qubit.set(ORIGIN(), stepMs / 2)
    visited = [qubit.state.clone()]
    busy = false
  }

  const Actions: Record<string, () => void> = {
    play: () => {
      setPlaying(!playing)
      if (playing) autoplay()
    },
    step: () => {
      setPlaying(false)
      advance()
    },
    reset,
  }

  function onClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null
    const key = target?.closest<HTMLElement>('[data-gate], [data-action]')
    if (!key) return
    const { gate, action } = key.dataset
    if (gate && GATES[gate]) {
      setPlaying(false)
      apply(GATES[gate](phase))
      return
    }
    if (action && Actions[action]) {
      Actions[action]()
    }
  }

  const write = (node: HTMLElement | null | undefined, text: string) => {
    if (node && node.textContent !== text) {
      node.textContent = text
    }
  }

  let frame = 0
  function tick() {
    const [theta, phi] = qubit.state.angles()
    write(readouts.theta, degreesOf(theta))
    write(readouts.phi, degreesOf(phi))
    frame = requestAnimationFrame(tick)
  }

  // The box is the layout's to size, and it can change without the window
  // changing — an article column reflowing, say.
  onResize(({ width, height }) => sphere.resize(width, height))
  lab?.addEventListener('click', onClick)
  tick()
  autoplay()

  return () => {
    setPlaying(false)
    cancelAnimationFrame(frame)
    lab?.removeEventListener('click', onClick)
    sphere.dispose()
  }
}
