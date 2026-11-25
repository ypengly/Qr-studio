import { useCallback, useReducer, useRef } from 'react'
import type { QRDesign } from '../types/qr.types'
import { defaultDesign } from '../utils/colorPresets'

interface History {
  past: QRDesign[]
  present: QRDesign
  future: QRDesign[]
}

export type UpdateDesign = (
  patch: Partial<QRDesign> | ((d: QRDesign) => QRDesign),
  /** consecutive updates with the same key within ~700ms share one undo step (colour drags, sliders) */
  coalesceKey?: string,
) => void

const LIMIT = 80

export function useQRDesign() {
  const ref = useRef<History>({ past: [], present: defaultDesign(), future: [] })
  const lastKey = useRef<string | null>(null)
  const lastTime = useRef(0)
  const [, force] = useReducer((n: number) => n + 1, 0)

  const commit = (h: History) => {
    ref.current = h
    force()
  }

  const update: UpdateDesign = useCallback((patch, coalesceKey) => {
    const h = ref.current
    const next = typeof patch === 'function' ? patch(h.present) : { ...h.present, ...patch }
    const now = Date.now()
    const coalesce = Boolean(coalesceKey) && lastKey.current === coalesceKey && now - lastTime.current < 700
    lastKey.current = coalesceKey ?? null
    lastTime.current = now
    commit({
      past: coalesce ? h.past : [...h.past.slice(-(LIMIT - 1)), h.present],
      present: next,
      future: [],
    })
  }, [])

  const undo = useCallback(() => {
    const h = ref.current
    if (!h.past.length) return
    lastKey.current = null
    commit({
      past: h.past.slice(0, -1),
      present: h.past[h.past.length - 1],
      future: [h.present, ...h.future],
    })
  }, [])

  const redo = useCallback(() => {
    const h = ref.current
    if (!h.future.length) return
    lastKey.current = null
    commit({
      past: [...h.past, h.present],
      present: h.future[0],
      future: h.future.slice(1),
    })
  }, [])

  /** Undoable reset to the default design. */
  const reset = useCallback(() => update(defaultDesign()), [update])

  /** Replace the design without keeping history (loading a saved QR). */
  const load = useCallback((d: QRDesign) => {
    lastKey.current = null
    commit({ past: [], present: d, future: [] })
  }, [])

  const h = ref.current
  return {
    design: h.present,
    update,
    undo,
    redo,
    reset,
    load,
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
  }
}

export type DesignController = ReturnType<typeof useQRDesign>
