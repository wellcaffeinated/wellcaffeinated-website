// A qubit walking a closed loop of gates: H, four rz turns, H. The trail is
// the states it has visited. The demo toy for the one-package-per-toy setup.
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

export const mount: ToyModule['mount'] = ({ el, constants, onResize }) => {
  const stepMs = (constants.step ?? DEFAULT_STEP_S) * MS_PER_S
  const phase = (constants.phase ?? DEFAULT_PHASE_DEG) * DEGREES

  const sphere = createSphere(el)
  const qubit = new QubitDisplay(BlochVector.fromAngles(0, 0))
  qubit.color = QUBIT_COLOR
  const trail = new PathDisplay()
  trail.color = TRAIL_COLOR
  sphere.add(trail)
  sphere.add(qubit)

  let running = true

  async function walk() {
    let visited = [qubit.state.clone()]
    while (running) {
      for (const gate of loopOf(phase)) {
        if (!running) return
        const next = qubit.state.applyOperator(gate)
        await qubit.set(next, stepMs)
        visited = [...visited, next]
        trail.set(visited)
        await sleep(stepMs * HOLD_FRACTION)
      }
      visited = visited.slice(-1)
    }
  }

  // The box is the layout's to size, and it can change without the window
  // changing — an article column reflowing, say.
  onResize(({ width, height }) => sphere.resize(width, height))
  walk()

  return () => {
    running = false
    sphere.dispose()
  }
}
