# Aegis App — Continuity & Handoff Guide

Purpose: rehydrate a fresh assistant or teammate quickly with context, architecture, and current status.

## TL;DR
- Frontend: React + Vite + MUI (TypeScript)
- Backend: Express file-DB server (server/simple-server.js)
- Auth: JWT (12h) issued on login; middleware verifies, legacy `token_*` still accepted
- Data: JSON at `server/data.json`
- Start: run `start-app.bat` (Windows) or start backend `node server/simple-server.js` and frontend `npm run dev`

## Key Files
- `AegisApp.code-workspace` — scoped VS Code workspace for aegis-app
- `server/simple-server.js` — API routes, file persistence, auth middleware
- `src/components/hubs/*Hub.tsx` — feature UIs
  - `RiskHub` — list, create, edit, delete
  - `ActionHub` — list, create, edit, delete
  - `KnowledgeHub` — list, create, edit, delete (category/tags arrays)
- `src/components/Login.tsx` — stores token in `localStorage.aegis_token`
- `server/data.json` — persisted state (users, audits, risks, actions, knowledge)

## APIs (selected)
- Auth: POST `/api/auth/login` -> `{ token }` (JWT)
- Risks: GET/POST `/api/risks`, GET/PUT/DELETE `/api/risks/:id`
- Actions: GET/POST `/api/actions`, GET/PUT/DELETE `/api/actions/:id`
- Knowledge: GET/POST `/api/knowledge`, GET/PUT/DELETE `/api/knowledge/:id`
- Analytics: GET `/api/analytics`, `/api/analytics/dashboard`

## Current Status
- CRUD live for Risks, Actions, Knowledge
- Edit dialogs implemented in all 3 hubs
- JWT auth enabled; frontend includes `Authorization: Bearer <token>`
- Analytics hub pulls summary; charts pending
- Compliance endpoints static but wired

## How to Run
- Windows one-click: `start-app.bat` opens backend (port 3001) then frontend (port 1420)
- Or manual:
  - Backend: `node server/simple-server.js`
  - Frontend: `npm run dev`
- Login: `admin@aegisaudit.com` / `admin123`

## Dev Notes
- JWT secret: env `JWT_SECRET` or fallback `aegis_dev_secret_change_me`
- Knowledge `category` and `tags` are arrays; forms accept comma-separated input and convert
- Data stored as plain JSON; no migrations needed

## Roadmap
- RBAC roles and route-level checks
- File uploads / evidence
- Persist scenarios; analytics charts

## Troubleshooting
- 401s: ensure token in localStorage and Authorization header present
- CORS: backend includes `cors()` by default
- Type mismatches: see `src/types/index.ts`

