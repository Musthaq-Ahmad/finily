import type { Category, ExtractedReceipt, FieldName } from '../types';

// SEAM: this whole function stands in for `POST /api/receipts/extract` (TRD §7).
// A real backend swap replaces the body of this function with a fetch() call;
// the ExtractedReceipt return contract stays identical so callers don't change.
export function extractReceipt(_imageFile: File): Promise<ExtractedReceipt> {
  const delayMs = 900 + Math.random() * 900;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const roll = Math.random();

      if (roll < 0.15) {
        // Simulated failure: network error / timeout / model error.
        // TRD §7 is explicit — this must never block the user, only bounce
        // them to the manual-entry fallback with the photo still attached.
        reject(new Error('AI extraction failed — please enter the details manually.'));
        return;
      }

      const vendors = ['Blue Bottle Coffee', 'Marriott Downtown', 'Yellow Cab Co.', 'United Airlines', 'Mourad Restaurant', 'Shell Gas Station'];
      const categories: Category[] = ['meals', 'lodging', 'transport', 'other'];
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const amount = Math.round((10 + Math.random() * 490) * 100) / 100;
      const today = new Date();
      today.setDate(today.getDate() - Math.floor(Math.random() * 5));
      const date = today.toISOString().slice(0, 10);

      if (roll < 0.55) {
        // (a) high-confidence success — every field trusted.
        resolve({
          vendor,
          date,
          amount,
          currency: 'INR',
          category_guess: category,
          confidence: 0.85 + Math.random() * 0.14,
          low_confidence_fields: [],
        });
        return;
      }

      // (b) low-confidence / partial success — one or two fields flagged for
      // the reviewer, per UX_FLOW_AND_DESIGN_PROMPT.md §3 (point at the field,
      // not just a generic banner).
      const candidates: FieldName[] = ['amount', 'vendor', 'expense_date'];
      const flagCount = 1 + Math.floor(Math.random() * 2);
      const low_confidence_fields = candidates.slice(0, flagCount);

      resolve({
        vendor,
        date,
        amount,
        currency: 'INR',
        category_guess: category,
        confidence: 0.35 + Math.random() * 0.25,
        low_confidence_fields,
      });
    }, delayMs);
  });
}
