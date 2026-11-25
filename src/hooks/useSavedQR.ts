import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EditorDoc, QRDesign, SavedQR } from '../types/qr.types'
import { makeThumbnail } from '../services/qr.service'
import { deleteDesign, listDesigns, newId, putDesign } from '../services/storage.service'
import { TYPE_LABELS } from '../utils/qrContent'

export const DEFAULT_CATEGORIES = ['General', 'Business', 'Personal', 'Events', 'Wi-Fi']

export function useSavedQR() {
  const [items, setItems] = useState<SavedQR[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setItems(await listDesigns())
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const save = useCallback(
    async (doc: EditorDoc, design: QRDesign, payload: string): Promise<SavedQR> => {
      const existing = doc.id ? items.find((i) => i.id === doc.id) : undefined
      const name = doc.name.trim() || `${TYPE_LABELS[doc.type]} QR`
      const now = Date.now()
      const record: SavedQR = {
        id: existing?.id ?? newId(),
        name,
        description: doc.description.trim(),
        category: doc.category.trim() || 'General',
        type: doc.type,
        content: structuredClone(doc.content),
        design: structuredClone(design),
        payload,
        thumbnail: await makeThumbnail(payload, design, { title: name, description: '' }),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      }
      await putDesign(record)
      await refresh()
      return record
    },
    [items, refresh],
  )

  const patch = useCallback(
    async (id: string, changes: Partial<Pick<SavedQR, 'name' | 'description' | 'category'>>) => {
      const cur = items.find((i) => i.id === id)
      if (!cur) return
      const next = { ...cur, ...changes, updatedAt: Date.now() }
      // thumbnail shows the title, so refresh it when the name changes
      if (changes.name !== undefined && changes.name !== cur.name) {
        next.thumbnail = await makeThumbnail(cur.payload, cur.design, { title: next.name, description: '' })
      }
      await putDesign(next)
      await refresh()
    },
    [items, refresh],
  )

  const duplicate = useCallback(
    async (id: string) => {
      const cur = items.find((i) => i.id === id)
      if (!cur) return
      const now = Date.now()
      await putDesign({ ...cur, id: newId(), name: `${cur.name} (copy)`, createdAt: now, updatedAt: now })
      await refresh()
    },
    [items, refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteDesign(id)
      await refresh()
    },
    [refresh],
  )

  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES)
    items.forEach((i) => set.add(i.category))
    return [...set]
  }, [items])

  return { items, loading, save, patch, duplicate, remove, categories }
}

export type SavedController = ReturnType<typeof useSavedQR>
