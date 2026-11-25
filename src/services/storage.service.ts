import type { SavedQR } from '../types/qr.types'

const DB_NAME = 'qr-studio'
const STORE = 'designs'
const VERSION = 1
const LS_FALLBACK = 'qr-studio:designs'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'))
      const req = indexedDB.open(DB_NAME, VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' })
          store.createIndex('updatedAt', 'updatedAt')
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    dbPromise.catch(() => {
      dbPromise = null
    })
  }
  return dbPromise
}

const tx = <T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> =>
  openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = fn(t.objectStore(STORE))
        t.oncomplete = () => resolve(req.result)
        t.onerror = () => reject(t.error)
        t.onabort = () => reject(t.error)
      }),
  )

// localStorage fallback (private browsing modes where IndexedDB is blocked)
const lsRead = (): SavedQR[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_FALLBACK) || '[]') as SavedQR[]
  } catch {
    return []
  }
}
const lsWrite = (items: SavedQR[]) => localStorage.setItem(LS_FALLBACK, JSON.stringify(items))

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export async function listDesigns(): Promise<SavedQR[]> {
  try {
    const all = await tx<SavedQR[]>('readonly', (s) => s.getAll())
    return all.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return lsRead().sort((a, b) => b.updatedAt - a.updatedAt)
  }
}

export async function putDesign(item: SavedQR): Promise<void> {
  try {
    await tx('readwrite', (s) => s.put(item))
  } catch {
    const items = lsRead().filter((i) => i.id !== item.id)
    items.push(item)
    lsWrite(items)
  }
}

export async function deleteDesign(id: string): Promise<void> {
  try {
    await tx('readwrite', (s) => s.delete(id))
  } catch {
    lsWrite(lsRead().filter((i) => i.id !== id))
  }
}

export async function clearDesigns(): Promise<void> {
  try {
    await tx('readwrite', (s) => s.clear())
  } catch {
    lsWrite([])
  }
}
