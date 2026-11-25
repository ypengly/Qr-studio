import { AlertTriangle, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import type { Warning } from '../../types/qr.types'

interface Props {
  url: string | null
  busy: boolean
  error: string | null
  /** true while showing the sample code because the form is empty / invalid */
  isSample: boolean
  warnings: Warning[]
  transparent: boolean
}

export function QRPreview({ url, busy, error, isSample, warnings, transparent }: Props) {
  return (
    <div className="space-y-4">
      <div
        className={`relative overflow-hidden rounded-3xl border border-ink-100 p-5 shadow-soft sm:p-8 ${
          transparent ? 'checker' : 'bg-gradient-to-br from-white via-brand-50/40 to-ink-50'
        }`}
      >
        <div className="mx-auto grid min-h-[300px] max-w-[460px] place-items-center">
          {url ? (
            <img
              src={url}
              alt="Live QR code preview"
              className={`w-full animate-pop-in drop-shadow-[0_18px_30px_rgba(60,40,160,0.18)] transition ${
                isSample ? 'opacity-40 blur-[1.5px]' : ''
              } ${busy ? 'opacity-80' : ''}`}
              draggable={false}
            />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          )}
        </div>

        {isSample && url && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center p-6">
            <div className="rounded-2xl bg-white/90 px-5 py-3 text-center shadow-lift backdrop-blur">
              <p className="text-sm font-bold text-ink-900">Your QR code appears here</p>
              <p className="text-xs text-ink-500">Enter your content on the left to generate it.</p>
            </div>
          </div>
        )}
        {busy && url && !isSample && (
          <Loader2 className="absolute right-4 top-4 h-4 w-4 animate-spin text-brand-400" aria-label="Updating" />
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!isSample && warnings.length === 0 && !error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Great contrast and sizing — this design should scan reliably.
        </div>
      )}

      {warnings.map((w) => (
        <div
          key={w.message}
          role="alert"
          className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
            w.level === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong className="font-bold">{w.level === 'error' ? 'May not scan: ' : 'Scan warning: '}</strong>
            {w.message}
          </span>
        </div>
      ))}
    </div>
  )
}
