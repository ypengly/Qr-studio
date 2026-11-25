import { useCallback, useEffect, useState } from 'react'
import type { EditorDoc, SavedQR } from './types/qr.types'
import { Header, type View } from './components/layout/Header'
import { MobileNavigation } from './components/layout/MobileNavigation'
import { useToast } from './components/ui/Toast'
import { useQRDesign } from './hooks/useQRDesign'
import { useSavedQR } from './hooks/useSavedQR'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { defaultContent } from './utils/qrContent'

const blankDoc = (): EditorDoc => ({
  id: null,
  name: '',
  description: '',
  category: 'General',
  type: 'url',
  content: defaultContent(),
})

const viewFromHash = (): View => (window.location.hash === '#/library' ? 'library' : 'create')

export default function App() {
  const toast = useToast()
  const [view, setView] = useState<View>(viewFromHash)
  const [doc, setDoc] = useState<EditorDoc>(blankDoc)
  const design = useQRDesign()
  const library = useSavedQR()

  const go = useCallback((v: View) => {
    setView(v)
    window.history.replaceState(null, '', v === 'library' ? '#/library' : '#/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onHash = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Keyboard shortcuts: Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z (outside text fields).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return
      e.preventDefault()
      if (e.shiftKey) design.redo()
      else design.undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [design])

  const newQR = () => {
    setDoc(blankDoc())
    design.reset()
    go('create')
  }

  const edit = (item: SavedQR) => {
    setDoc({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      type: item.type,
      content: structuredClone(item.content),
    })
    design.load(structuredClone(item.design))
    go('create')
    toast.info(`Editing “${item.name}”.`)
  }

  return (
    <div className="min-h-screen">
      <Header view={view} onView={go} count={library.items.length} onNew={newQR} />
      <main className="mx-auto max-w-[1400px] px-4 py-8 pb-28 sm:px-6 md:pb-12 lg:px-8">
        {view === 'create' ? (
          <HomePage doc={doc} setDoc={setDoc} design={design} library={library} onSaved={() => undefined} />
        ) : (
          <LibraryPage library={library} onEdit={edit} onCreate={newQR} />
        )}
      </main>
      <footer className="mx-auto hidden max-w-[1400px] px-8 pb-10 pt-6 text-center text-xs text-ink-400 md:block">
          <p>
            © {new Date().getFullYear()} QR Studio. All rights reserved.
          </p>
          <p className="mt-2">
            Free to use · No account required · No data stored on our servers
          </p>
          <p className="mt-2 text-ink-500">
            Designed & developed by <span className="font-medium text-ink-300">Y Pengly</span>
          </p>
        </footer>
      <MobileNavigation view={view} onView={go} count={library.items.length} />
    </div>
  )
}
