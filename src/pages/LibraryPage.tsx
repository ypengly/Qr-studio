import type { SavedQR } from '../types/qr.types'
import type { SavedController } from '../hooks/useSavedQR'
import { SavedQRLibrary } from '../components/library/SavedQRLibrary'

export function LibraryPage({
  library,
  onEdit,
  onCreate,
}: {
  library: SavedController
  onEdit: (i: SavedQR) => void
  onCreate: () => void
}) {
  return <SavedQRLibrary library={library} onEdit={onEdit} onCreate={onCreate} />
}
