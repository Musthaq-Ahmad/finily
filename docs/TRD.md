# Technical Requirements Document — Expense Report PWA (MVP)

Status: Draft v1
Owner: Musthaq Ahmad
Date: 2026-09-25

## 1. Purpose

A Progressive Web App that lets an employee on a business trip capture receipts, have an AI model extract the expense data automatically, and produce a submittable expense report. This document scopes the **first MVP only** — the smallest version that proves the capture → AI-extract → edit → export loop works.

## 2. Scope

### In scope (MVP)
- Create a **trip** (name, start date, end date).
- Add an **expense** to a trip via:
  - Photo of a receipt (camera or file upload) → AI-extracted fields.
  - Manual entry (fallback for cases with no receipt, e.g. mileage, cash tips).
- User reviews/edits AI-extracted fields before saving (never auto-saves unverified AI output).
- View expense list per trip, grouped by category, with running total.
- Export a trip's expenses as CSV.
- Works offline for capture/entry; syncs to backend when back online.
- Single user per account (simple auth), no approval workflow.

### Explicitly out of scope (future versions)
- Multi-user roles, manager approval workflow, notifications.
- Policy/spend-limit enforcement, flagging violations.
- Per diem and mileage rate calculators.
- Multi-currency conversion (MVP stores the currency printed on the receipt as-is).
- Duplicate receipt detection.
- PDF report generation (CSV only for MVP).
- Native mobile app (PWA only).

## 3. User Flow (MVP)

1. User opens PWA, logs in.
2. User creates a trip ("SF Client Visit", Oct 3–5).
3. User taps "Add Expense" → chooses "Scan Receipt" or "Manual Entry".
4. **Scan Receipt path:**
   a. Camera opens (or file picker on desktop).
   b. Photo is stored locally immediately (IndexedDB), queued for processing.
   c. If online, photo is sent to backend → Claude vision API → structured JSON returned.
   d. Extracted fields (vendor, date, amount, currency, category, notes) pre-fill an edit form.
   e. User confirms or corrects, taps Save.
   f. If AI extraction fails or confidence is low, form opens empty with the photo attached for manual entry — user is never blocked by an AI failure.
5. **Manual Entry path:** user fills the same form fields directly.
6. Expense appears in the trip's list immediately (optimistic local write).
7. When offline, all of the above works against local storage only; a sync badge shows pending items.
8. User exports trip as CSV when ready to submit.

## 4. System Architecture

```
┌─────────────────────────────┐
│         PWA (client)        │
│  React + TS + Vite           │
│  Service Worker (offline)    │
│  IndexedDB (local-first store)│
└───────────────┬──────────────┘
                │ HTTPS (JSON, multipart for images)
┌───────────────▼──────────────┐
│        Backend API           │
│  Node.js + Express + TS      │
│  - Auth                      │
│  - Trips/Expenses CRUD       │
│  - Receipt extraction proxy  │
│  - Image storage handoff     │
└───────┬───────────────┬──────┘
        │               │
┌───────▼──────┐ ┌──────▼─────────┐
│  SQLite DB    │ │ Claude API      │
│ (trips,       │ │ (vision model,  │
│  expenses,    │ │  structured     │
│  users)       │ │  extraction)    │
└───────────────┘ └────────────────┘
        │
┌───────▼──────────┐
│ Object storage    │
│ (receipt images)  │
│ MVP: local disk /  │
│ single bucket      │
└────────────────────┘
```

Key architectural decision: **the browser never calls the Claude API directly.** The API key must stay server-side. The backend is a thin proxy + persistence layer; it does no business logic beyond validating/normalizing what the AI returns.

## 5. Data Model

### `users`
| field | type | notes |
|---|---|---|
| id | uuid | pk |
| email | text | unique |
| password_hash | text | |
| created_at | timestamp | |

### `trips`
| field | type | notes |
|---|---|---|
| id | uuid | pk |
| user_id | uuid | fk → users |
| name | text | |
| start_date | date | |
| end_date | date | |
| created_at | timestamp | |

### `expenses`
| field | type | notes |
|---|---|---|
| id | uuid | pk (client-generated, for offline-first writes) |
| trip_id | uuid | fk → trips |
| vendor | text | nullable until confirmed |
| expense_date | date | |
| amount | numeric(10,2) | |
| currency | text(3) | ISO 4217 code as printed on receipt |
| category | enum | `meals`, `lodging`, `transport`, `other` |
| notes | text | nullable |
| receipt_image_path | text | nullable (manual entries may have none) |
| source | enum | `ai_extracted`, `manual`, `ai_extracted_edited` |
| ai_confidence | float | nullable, 0–1, from extraction step |
| sync_status | enum | `pending`, `synced` — client-local field, not sent to server |
| created_at | timestamp | |
| updated_at | timestamp | |

## 6. API Endpoints (MVP)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Email/password login, returns JWT |
| POST | `/api/auth/register` | Create account (MVP: open or invite-only, TBD in design) |
| GET | `/api/trips` | List current user's trips |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips/:id/expenses` | List expenses for a trip |
| POST | `/api/trips/:id/expenses` | Create expense (manual or AI-confirmed) |
| PATCH | `/api/expenses/:id` | Edit expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| POST | `/api/receipts/extract` | Upload receipt image, returns extracted JSON (does not persist the expense) |
| GET | `/api/trips/:id/export.csv` | Download CSV of trip's expenses |

All endpoints (except auth) require a valid JWT.

## 7. AI Extraction Detail

- **Model**: Claude with vision support (e.g. `claude-sonnet-5`).
- **Input**: receipt image (JPEG/PNG, client-side resized/compressed to a reasonable max dimension before upload to control latency and cost).
- **Output contract**: the backend requests a fixed JSON shape from the model:
  ```json
  {
    "vendor": "string | null",
    "date": "YYYY-MM-DD | null",
    "amount": "number | null",
    "currency": "string (ISO 4217) | null",
    "category_guess": "meals | lodging | transport | other | null",
    "confidence": "number 0-1"
  }
  ```
- **Validation**: backend validates the shape and value ranges (e.g. amount > 0, valid date, valid currency code) before returning to the client. Malformed or missing fields are returned as `null`, not guessed further.
- **Failure handling**: network error, timeout, or low confidence (< a threshold, e.g. 0.5) → client falls back to an empty manual-entry form with the photo still attached. This is a hard requirement: the user must never be blocked from logging an expense because the AI call failed.
- **Cost/latency guardrail**: one extraction call per receipt photo, not re-run automatically on edit.

## 8. Offline & Sync Strategy

- All writes go to IndexedDB first (trips, expenses, pending receipt photos). UI reads only from IndexedDB.
- A background sync process (triggered on reconnect, or periodically via Service Worker) pushes `pending` items to the backend and marks them `synced`.
- Receipt photos queued while offline are sent for AI extraction only once connectivity returns; until then the expense can be saved as a manual/placeholder entry.
- Conflict handling for MVP: last-write-wins (single-user scope makes real conflicts unlikely; revisit if multi-device same-account editing becomes common).

## 9. Non-Functional Requirements

- **Security**: JWT auth; Claude API key stored server-side only (env var); receipt images stored in a location not publicly listable; HTTPS everywhere.
- **Privacy**: receipt images may contain personal card numbers — do not log raw image bytes or extracted card numbers; retain images only as long as needed for the report cycle (retention policy TBD in design).
- **Performance**: extraction round-trip target < 5s on a typical mobile connection for a compressed receipt photo.
- **Browser support**: latest Chrome/Edge/Safari (mobile + desktop), installable PWA via manifest + service worker.
- **Availability**: single-region deployment acceptable for MVP; no HA requirement yet.

## 10. Tech Stack Summary

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React + TypeScript + Vite + `vite-plugin-pwa` | Fast setup, mature PWA tooling, large ecosystem |
| Local storage | IndexedDB (via `idb` or Dexie) | Offline-first requirement |
| Backend | Node.js + Express + TypeScript | Thin proxy, same language as frontend |
| Database | SQLite (MVP), designed to migrate to Postgres later | Zero-ops for MVP; schema kept portable |
| AI | Claude API (vision-capable model) | Structured extraction from images |
| Image storage | Local disk / single bucket (MVP) | Swap for S3-compatible storage later without API changes |
| Auth | JWT, email/password | Simplest that satisfies single-user MVP |

## 11. MVP Acceptance Criteria

- [ ] User can install the PWA on a mobile device.
- [ ] User can create a trip and see it persist across app restarts.
- [ ] User can photograph a receipt and, within ~5s online, see AI-prefilled fields they can edit and save.
- [ ] User can add a manual expense with no photo.
- [ ] Expense list shows correct running total per trip.
- [ ] Turning off network, adding an expense, and turning network back on results in the expense syncing without duplication or loss.
- [ ] User can export a trip's expenses as a CSV that opens correctly in Excel/Sheets.
- [ ] An intentionally bad/blurry receipt photo does not crash the flow — it falls back to manual entry.

## 12. Open Questions for Design Phase

1. Registration: open self-serve, or invite-only for company employees?
2. Where do receipt images ultimately live long-term (retention/compliance requirement from finance)?
3. Category list — is `meals/lodging/transport/other` sufficient, or does finance require a specific chart-of-accounts mapping already?
4. Any existing company expense system (e.g. Concur, NetSuite) this should eventually export/integrate with, even if out of scope for MVP?
