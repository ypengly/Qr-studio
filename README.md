# QR Studio

**A premium QR code generator and designer.** Paste a link, Wi-Fi details, a contact card or any other content, then style the code in real time and download crisp PNG, JPG or SVG files. Everything runs in the browser — no account, no backend, no uploads.

> QR Studio is built around one idea: a QR code should look as good as the brand it represents *and* scan every time.

## Screenshots

Add your own screenshots to `docs/` and reference them here:

| Editor | Library |
| --- | --- |
| `docs/editor.png` | `docs/library.png` |

## Features

**Content types** — Website, Wi-Fi (standard `WIFI:` payload with proper escaping), Text (multiline), Email, Phone, SMS, WhatsApp, Location, Contact (vCard 3.0) and Social (Facebook, Instagram, TikTok, YouTube, Telegram). Each has its own validated form.

**Design studio**
- 6 module patterns: square, rounded, dots, extra-rounded, classy, elegant
- Independent eye frame / eye centre styles (square, rounded, circular) and optional custom eye colours
- Solid, linear-gradient and radial-gradient code colours with up to 4 stops, plus professional palettes
- Solid, gradient, soft-pastel or transparent backgrounds
- Centre logo with drag-and-drop upload, size slider, white (or any colour) backing and rounded container
- Frame, border, "Scan me" / custom label, font choice, colours and sizes
- 10 one-click presets: Minimal Black, Midnight Blue, Luxury Gold, Soft Pastel, Ocean Blue, Neon Purple, Forest Green, Modern Gradient, Rose Pink, Elegant White
- Undo / redo (also `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`) and a one-click, undoable reset

**Export** — PNG at 1024 / 2048 / 4096 px (transparent, white or custom background), JPG with adjustable quality, and pure-vector SVG. Choose whether to include the title, description and frame. Exports are rendered fresh at the requested resolution; they are never screenshots of the preview.

**Library** — Save, rename, duplicate, delete, search and categorise designs. Edit any saved design to reopen it exactly as you left it.

**Scan safety** — A live checker warns about low contrast, inverted colours, low-contrast custom eyes and oversized logos.

## Technology stack

React 18 · TypeScript · Vite · Tailwind CSS · lucide-react · [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling) · [`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator) (module count for exact quiet zones) · `file-saver` · IndexedDB

## Installation

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

## Development commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run typecheck` | Type-check the whole project |
| `npm test` | Run the payload / validation sanity checks |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Production build

```bash
npm run build
npm run preview
```

The output in `dist/` is a fully static site and can be hosted anywhere.

## Deploying to Vercel

1. Push the project to GitHub, GitLab or Bitbucket.
2. In Vercel choose **Add New → Project** and import the repository.
3. Vercel detects Vite automatically. Confirm: **Build command** `npm run build`, **Output directory** `dist`.
4. Click **Deploy**.

Or with the CLI: `npm i -g vercel && vercel --prod`.

No environment variables are needed. The app uses hash-based navigation (`#/library`), so no rewrite rules are required.

## How scannability is protected

- **Quiet zone**: the exact module count is calculated for each payload and a 4-module margin is applied on every side, as the QR specification requires.
- **Error correction**: *Auto* uses level Q, and level H whenever a logo is present. You can override it.
- **Contrast** is measured (WCAG ratio) across every gradient stop; warnings appear below 3.5:1 and become errors below 2:1.
- **Logo size** is capped at 35% of the width with warnings above 25%.
- **Proportions**: the code is always rendered square at an integer pixel size and never stretched.
- **Preview = export**: the live preview and every download use the same renderer.

Always test a finished design with a couple of real phones before printing at scale — in particular for gradients, custom eye colours and logos.

## Project structure

```
qr-studio/
├── public/favicon.svg
├── scripts/check-payloads.ts      # payload + validation checks (npm test)
├── src/
│   ├── components/
│   │   ├── layout/    Header, Sidebar (category filter), MobileNavigation
│   │   ├── qr/        QRGenerator (workspace), QRPreview, pattern / eye / colour / logo / frame editors, QRExportDialog
│   │   ├── editor/    ContentTypeSelector, ContentForm, DesignPanel, PresetGallery
│   │   ├── library/   SavedQRCard, SavedQRLibrary
│   │   └── ui/        Toast, shared controls (Section, Segmented, Toggle, Slider, ColorField, Modal)
│   ├── hooks/         useQRDesign (history), useQRGenerator (live preview), useSavedQR
│   ├── services/      qr.service (rendering), export.service, storage.service (IndexedDB)
│   ├── utils/         qrContent (payloads), validation (+ scan warnings), colorPresets
│   ├── types/qr.types.ts
│   ├── pages/         HomePage, LibraryPage
│   ├── App.tsx · main.tsx · index.css
├── index.html · package.json · tsconfig.json · vite.config.ts · tailwind.config.js
```

## Browser storage

Saved designs are stored in **IndexedDB** (database `qr-studio`, object store `designs`) inside your browser. Each record holds the content you entered, the full design settings (including an uploaded logo as a data URL), the generated payload and a small preview thumbnail.

- Data never leaves your device and is not shared across browsers or devices.
- Clearing site data, or using a private window, removes saved designs.
- If IndexedDB is unavailable, QR Studio falls back to `localStorage` (smaller quota).
- Download the images you care about — they are your backup.

## Privacy

QR Studio has no backend, no analytics and no tracking. Your URLs, Wi-Fi passwords, contacts and logos are processed entirely in your browser and are never uploaded. The only network requests the page makes are for its own static files and the Google Fonts used for typography.

Note that a QR code is just encoded text: anyone who scans a Wi-Fi or contact code can read what is inside it.

## License

MIT
