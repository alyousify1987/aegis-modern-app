# RFP Coverage Matrix (Snapshot)

- Offline-First PWA: Implemented (vite-plugin-pwa, runtime caching). Status: Done.
- IndexedDB (Dexie) schema: Implemented minimal schema in src/services/db/dexie.ts. Status: Partial (more tables/indices can be added as modules mature).
- Encryption (AES-GCM): Implemented (src/services/db/secure.ts). Status: Done.
- DuckDB-WASM in Worker with manualBundles and queued init: Implemented. Status: Done.
- Asynchronous integrity: Workers use request ids; DuckDB service queues init. Status: Done.
- On-device NLP (nlp.js): Scaffold with dynamic import and fallback regex. Status: Partial (no trained models yet).
- Rule Engine (json-rules-engine): Thin wrapper and demo rules. Status: Partial (extend rulesets per modules).
- OCR (Tesseract.js): Dynamic import wrapper. Status: Partial (language packs model download on demand).
- ONNX Runtime (onnxruntime-web): Wrapper for session/run. Status: Partial (no model packaged yet).
- Diagnostics: Added self-tests for DuckDB, NLP/Rules, Dexie, plus existing network/sync/logs. Status: Done.
- RTL/i18n EN/FR/AR: Implemented with direction-aware Emotion cache. Status: Partial (strings coverage to expand).
- One-Click Audit: Implemented with folder upload and offline queue. Status: Done (baseline).
- E2E tests: Playwright suite covers login, hubs, One-Click (directory upload), analytics demo, diagnostics. Status: Done (baseline).
- Reporting: CSV export exists; PDF/Docx/XLSX pending. Status: Pending.
- Non-Conformance & CAPA: Basic risk/actions present; NCR/CAPA dedicated hub pending. Status: Pending.
- External Auditor, MRM, Auditor Workspace, Conversational Assistant: Pending.

Next actions prioritized
- Expand Document Control hub (versioning, master list) and wire OCR/NLP classification.
- Add NCR/CAPA hub and event-driven linkage from audits.
- Reporting exports (PDF via pdfmake/jsPDF, XLSX via SheetJS).
- Add accessibility checks and CI tasks for lint/test/build.
