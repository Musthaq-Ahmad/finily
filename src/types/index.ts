// Data model — field names mirror TRD.md §5 exactly so a real backend can be
// dropped in later without a client-side rewrite.

export type Category = 'meals' | 'lodging' | 'transport' | 'other';

export type ExpenseSource = 'ai_extracted' | 'manual' | 'ai_extracted_edited';

/** Client-local field only — never sent to the server (TRD §5). */
export type SyncStatus = 'pending' | 'synced';

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  /** Google account id ("sub" claim) — the stable identity key since auth is Google-only. */
  google_sub: string;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  created_at: string; // ISO timestamp
}

export interface Expense {
  id: string;
  trip_id: string;
  vendor: string | null;
  expense_date: string | null; // YYYY-MM-DD
  amount: number | null;
  currency: string; // ISO 4217 code as printed on receipt
  category: Category | null;
  notes: string | null;
  receipt_image_path: string | null; // local blob reference for MVP, e.g. "local-blob://<id>"
  source: ExpenseSource;
  ai_confidence: number | null; // 0-1, overall extraction confidence
  /**
   * Client-local, UI-only augmentation of the AI extraction contract (TRD §7's
   * JSON shape only defines one overall `confidence`). The UX flow doc asks for
   * highlighting on the *specific* low-confidence field(s), not just a banner,
   * so we keep the offending field names here. Never sent to a backend.
   */
  low_confidence_fields: FieldName[] | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}

export type FieldName = 'amount' | 'vendor' | 'expense_date' | 'category' | 'currency' | 'notes';

/**
 * TRD §7 output contract for POST /api/receipts/extract. This module's
 * `extractReceipt` mocks that endpoint end-to-end for this frontend-only
 * milestone.
 */
export interface ExtractedReceipt {
  vendor: string | null;
  date: string | null; // YYYY-MM-DD
  amount: number | null;
  currency: string | null;
  category_guess: Category | null;
  confidence: number; // 0-1
  low_confidence_fields: FieldName[];
}

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'meals', label: 'Meals', icon: 'fa-solid fa-utensils' },
  { value: 'lodging', label: 'Lodging', icon: 'fa-solid fa-hotel' },
  { value: 'transport', label: 'Transport', icon: 'fa-solid fa-car' },
  { value: 'other', label: 'Other', icon: 'fa-solid fa-shapes' },
];

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
};
