import type { EditorDoc } from '../types/qr.types'
import type { DesignController } from '../hooks/useQRDesign'
import type { SavedController } from '../hooks/useSavedQR'
import { QRGenerator } from '../components/qr/QRGenerator'

interface Props {
  doc: EditorDoc
  setDoc: React.Dispatch<React.SetStateAction<EditorDoc>>
  design: DesignController
  library: SavedController
  onSaved: () => void
}

export function HomePage(props: Props) {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl animate-fade-up">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Design QR codes people <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">want to scan</span>
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
          Paste a link, Wi-Fi details or a contact card, then style it in real time. Everything runs privately in your
          browser.
        </p>
      </div>
      <QRGenerator {...props} />
    </div>
  )
}
