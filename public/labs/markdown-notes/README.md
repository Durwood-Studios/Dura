# Markdown Notes Lab 1.0.0

A complete, local browser note app: create/select/delete, immediate in-memory drafts, debounced localStorage persistence, live safe Markdown subset, composed search/tag filtering, validated import and JSON export. No runtime library or external service is required.

## Run

Node.js 22+ serves the downloaded files on a stable loopback origin. Keep the same port to access the same browser localStorage:

```sh
npm start
```

Open http://127.0.0.1:4311. Click **New note**, type a title and content, then wait for **Saved in this browser** before closing. Switching notes immediately is safe because input updates the named note before any delayed save. Browser storage belongs to this exact origin and profile. No account or cloud sync exists.

The page needs its static files to open again: keep the local server running. The already-open editor saves without internet, but this lab does not install a service worker or promise offline navigation. Browser storage can be cleared or evicted. Downloaded JSON exports are the independent backup. Notes are not encrypted and are accessible to scripts on the same origin and people with access to the browser profile.

## Test

Pure model/storage tests need only Node:

```sh
npm test
```

The browser suite uses the pinned development dependency, not app runtime code:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

It starts an ephemeral loopback server and a fresh Chromium profile. It tests actual controls, rapid edit/switch/reload, imported HTML/code rendering, quota failure with original storage retained, draft export, deletion persistence and 320px geometry. Model tests cover empty imported content, malformed/oversize archives, ID collision preservation, composed filters, stale-tab rejection and quota failures. The tests don't exercise every browser, storage eviction, inaccessible operating-system files or assistive-technology combinations.

## Data contract and failures

Version 1 JSON is `{ "version": 1, "notes": [...] }`. A note has `id`, `title`, `content`, `tags`, `createdAt`, and `updatedAt`. Limits are 100 notes, 20,000 content characters per note, 200 title characters, 20 tags of at most 40 characters, and 1 MB per archive. Imported collisions receive fresh IDs instead of overwriting existing notes. Empty notes remain valid. The whole archive is validated before mutation.

A failed write keeps the current draft in memory, displays **Not saved**, and leaves the previous storage value intact. Export includes unsaved drafts. If you exceed schema limits, correct the fields before trying to import that draft export elsewhere. Invalid startup storage is not replaced with an empty archive: editing is disabled and Export downloads the original unreadable value for recovery.

Saving requires the browser's Web Locks API (available in the tested Chromium). Each write takes one named origin lock and compares the previous serialized value. Another tab's changes cause a conflict, never silent overwrite; export the current draft and reload to see the other tab's version. This is a conflict refusal protocol, not automatic collaborative merging. A browser without Web Locks keeps drafts exportable and shows a save error instead of promising cross-tab safety.

## Markdown contract

`markdown.mjs` creates DOM nodes; it never assigns untrusted HTML. Supported subset: headings 1–3, paragraphs, simple bold/emphasis/inline code, fenced code, flat unordered lists, blockquotes, horizontal rules, and explicit absolute HTTP/HTTPS links. Raw HTML and unsupported destinations stay text. Code fences are literal. This is not CommonMark conformance: nested formatting, images, tables, reference links, nested lists and advanced escaping are not implemented.

## Keyboard shortcuts

Ctrl/Cmd+S saves, Ctrl/Cmd+/ focuses search, Ctrl/Cmd+Shift+N creates a note. Browser-reserved shortcuts may differ; every action also has a visible keyboard-accessible control. Deletion asks for confirmation. The small-screen layout stacks the list above the editor and uses 48px controls.
