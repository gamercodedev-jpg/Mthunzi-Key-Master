# Mthunzi-Admin Key Generator (PWA)

Offline-first PWA that generates an 8-digit master key from a Device ID using SHA-256.

## How it generates the key

- Secret salt: `Mthunzi_Stephen_Zulu_2026_Secure`
- Hash input: `DeviceID + Salt` (DeviceID is trimmed, spaces removed, uppercased)
- SHA-256 → hex
- Take first 8 hex chars → convert to 8-digit code → format `XXXX-XXXX`

## Run locally

You need to serve it over HTTP (service workers don’t work from `file://`).

Option A (VS Code): use Live Server.

Option B (Python):

- `python -m http.server 5500`
- Open `http://localhost:5500/`

Option C (npm):

- `npm install`
- `npm run dev`

## Install on phone

1. Open the hosted page in Chrome/Edge.
2. Browser menu → **Add to Home screen**.
3. Open once online so it caches assets; after that it works offline.

## Using your logo as the app icon (the image you provided)

1. Save your logo image into: `icons/source.png`
2. Run: `powershell -ExecutionPolicy Bypass -File tools\\make-icons.ps1`
3. It will generate:
   - `icons/icon-192.png`
   - `icons/icon-512.png`
   - `icons/icon-maskable-512.png`

## Important note (privacy)

Because this is a client-side PWA, the salt is visible to anyone who can access the app files.
If the salt must remain truly secret, the generator must run on a backend you control.
