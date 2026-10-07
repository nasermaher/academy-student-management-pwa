# Academy Student Management System - Project Instructions

## Tech Stack & Architecture
- **Core:** Vanilla HTML5, CSS3, JavaScript (ES6+). No external frameworks (e.g., React, Vue, Tailwind).
- **Architecture:** Single Page Application (SPA) architecture utilizing the module pattern.
- **State Management:** Custom `Store` object in `js/state.js` using `localStorage` for persistence and schema migrations. This is the app's only data store - there is no separate database layer.
- **PWA:** Designed as a Progressive Web Application with offline-first capabilities (Service Worker `sw.js` registered in `index.html`).
- **Localization (i18n):** Custom translation logic via `js/i18n.js` utilizing `data-i18n` attributes. Built-in support for LTR (English) and RTL (Arabic).

## Code Structure Guidelines

### HTML (`index.html`)
- All module UI containers must be placed inside the `<main id="app-content">`.
- Use `<section id="module-name" class="hidden">` for each new view.
- Ensure all static textual content uses `data-i18n="key"` attributes for localization.

### CSS (`css/style.css`)
- **Variables:** Stick to the defined CSS variables in `:root` (e.g., `--primary-color`, `--secondary-color`, `--background-color`).
- **RTL Support:** Ensure all directional CSS has an RTL counterpart using the `html[dir="rtl"] selector { ... }` pattern.
- **Responsive:** Use Flexbox and CSS Grid. Media queries are contextualized or placed at the bottom.
- **Utility Classes:** Use `.hidden` to toggle visibility. Utilize `.card`, `.btn`, `.form-group` for common components.

### JavaScript (`js/`)
- **App Initialization (`app.js`):** Handles navigation switching by toggling `.hidden` and `.active` classes, then calls the respective module's `init()` function (e.g., `SettingsModule.init()`).
- **State (`state.js`):** If modifying data structures, ensure defaults are updated in `Store.defaults` and handle backward compatibility in `Store.migrate()`.
- **Modules (`js/modules/`):** Each major feature should have its own module file (e.g., `StudentsModule`, `FinanceModule`). Follow a strict namespaced object pattern.
- **UI (`ui.js`):** Contains shared UI functions (e.g., toast notifications). Use `UI.showToast()` for user feedback instead of `alert()`.

## Best Practices
1. **Offline First:** Assume network might be unavailable. Rely on `localStorage` via `Store`.
2. **Modular Integrity:** Do not mix concerns. UI logic stays in specific modules, while data persistence strictly flows through `state.js`.
3. **i18n Completeness:** Whenever adding a new string to the UI, add it to both English and Arabic dictionaries within `i18n.js`.
4. **Error Handling:** Always use `try/catch` and reject Promises in data interactions. Provide user feedback via `UI.showToast()`.

## `mobile_index.html` (generated - do not hand-edit)
`mobile_index.html` is a single-file bundle of `index.html` + `css/style.css` + every `js/*.js` module, produced by `npm run build:legacy` (`scripts/build-legacy.mjs`; the old `build.ps1` is kept for Windows users). It exists so the app can be copied/opened as one file with no server. It is **generated**, not authored: never edit it directly, and never add features or fixes only there. After any change to `index.html`, `css/style.css`, or `js/**/*.js`, regenerate it:

```powershell
npm run build:legacy
```

The script derives its JS file list from `index.html`'s own `<script src="js/...">` tags (in order), so the bundle can't silently drift from the app shell the way it previously did.

## v2 (in development) - supersedes the constraints above for `app/`
The legacy v0 files at the repository root stay as-is (tag `v0-legacy`, MIT licensed, still published at the site root). New work lives in `app/` and is published under `/v2/`.
- ES Modules + Vite (no UI framework), IndexedDB as the primary store, optional cloud sync later; offline-first remains mandatory.
- Product requirements: `docs/PRD.md`. Tests: `npm test` (Vitest); characterisation tests of v0 behaviour are in `tests/legacy/`.
- Dev: `npm run dev` (localhost). Phone preview: run the **Pages** workflow on the branch (needs Pages source = GitHub Actions).
