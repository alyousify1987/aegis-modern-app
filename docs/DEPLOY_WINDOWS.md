# Windows Production Build and Installer

This app supports a desktop build using Tauri 2. End users get a standard Windows installer (.msi) or signed .exe with no dev tools required.

## What users will see
- A single installer (MSI/EXE). Double‑click to install.
- A Start Menu shortcut and an uninstaller entry in "Apps & features".
- The app runs offline‑first; it talks to your backend when available.

## Prerequisites (build machine only)
- Windows 10/11 x64
- Node.js 18+
- Rust toolchain (stable) and Visual Studio Build Tools (Tauri requirement)
- Optional code signing certificate for a trusted installer

## Backend URL
Set the production API base URL so the desktop app talks to your server:

- Edit `.env.production` and set `VITE_API_BASE_URL` to your public API, e.g.

```
VITE_API_BASE_URL=https://api.yourdomain.com
```

Ensure the API is reachable from user machines and supports HTTPS.

## Build steps (packaging)
From the repo root:

```
npm ci
npm run build:desktop
```

Artifacts will be in `src-tauri/target/release/bundle/`:
- `msi/YourApp-x.y.z-x64.msi`
- `nsis/YourApp-x.y.z-setup.exe` (if NSIS is enabled)
- `updater/` files for auto‑updates (if configured)

## Code signing (recommended)
Configure Windows signing in `src-tauri/tauri.conf.json` under `bundle.windows`: provide your certificate or use Windows SignTool in your CI.

## Auto‑updates (optional)
Tauri supports updates. You can add an update server later; not required to ship an installer.

## Backend service
For a self‑contained desktop experience, you can:
- Point the app at a hosted API, or
- Bundle/start a local service on first run (advanced; out of scope here)

The current sample backend (`server/simple-server.js`) is for development. For production, deploy a proper API to a server/VM or container platform.

## Troubleshooting
- If the app can’t reach the API, the Diagnostics hub shows network status.
- If RTL/Arabic isn’t applied, check language settings inside the app.
- If Windows warns about an untrusted publisher, sign the installer.
