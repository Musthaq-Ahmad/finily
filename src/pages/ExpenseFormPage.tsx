import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppBar } from '../components/ui/AppBar';
import { Banner } from '../components/ui/Banner';
import { Button } from '../components/ui/Button';
import { CategoryChip } from '../components/ui/CategoryChip';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { fieldInputClass, FormField } from '../components/ui/FormField';
import { useToast } from '../context/ToastContext';
import { useDeleteExpense, useExpense, useReceiptImageUrl, useSaveExpense } from '../data/hooks';
import { extractReceipt } from '../services/receiptExtraction';
import { CATEGORIES, CURRENCIES, CURRENCY_SYMBOLS } from '../types';
import type { Category, Expense, FieldName } from '../types';

interface FormState {
  amount: string;
  vendor: string;
  expense_date: string;
  category: Category | null;
  currency: string;
  notes: string;
}

const EMPTY_FORM: FormState = { amount: '', vendor: '', expense_date: '', category: null, currency: 'INR', notes: '' };

interface ScanLocationState {
  mode?: 'scan' | 'manual';
  receiptImagePath?: string;
  offlineCapture?: boolean;
}

export function ExpenseFormPage() {
  const { tripId = '', expenseId } = useParams<{ tripId: string; expenseId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const saveExpense = useSaveExpense();
  const deleteExpense = useDeleteExpense();

  const isEdit = Boolean(expenseId);
  const { expense: existing, loading: existingLoading } = useExpense(expenseId);
  const locationState = (location.state ?? {}) as ScanLocationState;
  const scanMode = !isEdit && locationState.mode === 'scan';

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [receiptImagePath, setReceiptImagePath] = useState<string | null>(locationState.receiptImagePath ?? null);
  const [source, setSource] = useState<Expense['source']>('manual');
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [lowConfidenceFields, setLowConfidenceFields] = useState<FieldName[]>([]);
  const [extracting, setExtracting] = useState(scanMode);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialSnapshotRef = useRef<FormState>(EMPTY_FORM);
  const hasExtractedRef = useRef(false);
  const receiptUrl = useReceiptImageUrl(receiptImagePath);

  useEffect(() => {
    if (!isEdit || !existing) return;
    const next: FormState = {
      amount: existing.amount != null ? String(existing.amount) : '',
      vendor: existing.vendor ?? '',
      expense_date: existing.expense_date ?? '',
      category: existing.category,
      currency: existing.currency,
      notes: existing.notes ?? '',
    };
    setForm(next);
    initialSnapshotRef.current = next;
    setReceiptImagePath(existing.receipt_image_path);
    setSource(existing.source);
    setAiConfidence(existing.ai_confidence);
    setLowConfidenceFields(existing.low_confidence_fields ?? []);
  }, [isEdit, existing]);

  useEffect(() => {
    if (!scanMode || hasExtractedRef.current) return;
    hasExtractedRef.current = true;
    setExtracting(true);
    extractReceipt(new File([], 'receipt.jpg'))
      .then((result) => {
        const next: FormState = {
          amount: result.amount != null ? String(result.amount) : '',
          vendor: result.vendor ?? '',
          expense_date: result.date ?? '',
          category: result.category_guess,
          currency: result.currency ?? 'INR',
          notes: '',
        };
        setForm(next);
        initialSnapshotRef.current = next;
        setSource('ai_extracted');
        setAiConfidence(result.confidence);
        setLowConfidenceFields(result.low_confidence_fields);
      })
      .catch((err: unknown) => {
        setSource('manual');
        setExtractionError(err instanceof Error ? err.message : 'AI extraction failed — please enter the details manually.');
      })
      .finally(() => setExtracting(false));
  }, [scanMode]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isAiField = source !== 'manual' && !extracting;
  const isLowConfidence = (field: FieldName) => isAiField && lowConfidenceFields.includes(field);

  const canSave = Number(form.amount) > 0 && form.expense_date !== '' && form.category != null && !extracting && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const edited = JSON.stringify(form) !== JSON.stringify(initialSnapshotRef.current);
      const finalSource: Expense['source'] = source === 'manual' ? 'manual' : edited ? 'ai_extracted_edited' : 'ai_extracted';

      await saveExpense({
        id: existing?.id,
        created_at: existing?.created_at,
        trip_id: tripId,
        vendor: form.vendor.trim() || null,
        expense_date: form.expense_date || null,
        amount: form.amount ? Number(form.amount) : null,
        currency: form.currency,
        category: form.category,
        notes: form.notes.trim() || null,
        receipt_image_path: receiptImagePath,
        source: finalSource,
        ai_confidence: source === 'manual' ? null : aiConfidence,
        low_confidence_fields: source === 'manual' ? null : lowConfidenceFields.length ? lowConfidenceFields : null,
      });
      showToast(isEdit ? 'Expense updated' : 'Expense saved', 'success');
      navigate(`/trips/${tripId}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    await deleteExpense(existing.id);
    showToast('Expense deleted', 'success');
    navigate(`/trips/${tripId}`);
  };

  if (isEdit && existingLoading) {
    return <div className="min-h-screen bg-finly-surface" />;
  }

  return (
    <div className="min-h-screen bg-finly-surface pb-28">
      <div className="max-w-[480px] mx-auto px-4">
        <AppBar title={isEdit ? 'Edit Expense' : 'Add Expense'} onBack={() => navigate(-1)} />

        {extractionError && (
          <Banner tone="error" icon="fa-solid fa-robot" title="AI unavailable" subtitle={extractionError} className="mb-4" />
        )}
        {locationState.offlineCapture && (
          <Banner
            tone="amber"
            icon="fa-solid fa-wifi"
            title="Offline — enter details manually"
            subtitle="We'll auto-scan this receipt once you're back online."
            className="mb-4"
          />
        )}
        {!extracting && isAiField && lowConfidenceFields.length > 0 && (
          <Banner
            tone="amber"
            icon="fa-solid fa-wand-magic-sparkles"
            title="AI wasn't fully sure"
            subtitle="Please check the highlighted fields below."
            className="mb-4"
          />
        )}

        {receiptUrl && (
          <button type="button" onClick={() => setZoomed(true)} className="block w-full mb-4">
            <img src={receiptUrl} alt="Receipt" className="w-full h-40 object-cover rounded-3xl border border-finly-hairline" />
          </button>
        )}

        {extracting ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-finly-muted flex items-center gap-2">
              <i className="fa-solid fa-circle-notch animate-spin" aria-hidden="true" /> Reading receipt…
            </p>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-2xl bg-finly-pill animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <FormField
              label="Amount"
              ai={isAiField}
              low={isLowConfidence('amount')}
              caption="AI wasn't fully sure — please check"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-finly-dark">{CURRENCY_SYMBOLS[form.currency] ?? form.currency}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => updateField('amount', e.target.value)}
                  placeholder="0.00"
                  className={`${fieldInputClass(isLowConfidence('amount'))} text-3xl font-bold font-display py-2`}
                />
              </div>
            </FormField>

            <FormField label="Vendor" ai={isAiField} low={isLowConfidence('vendor')} caption="AI wasn't fully sure — please check">
              <input
                type="text"
                value={form.vendor}
                onChange={(e) => updateField('vendor', e.target.value)}
                placeholder="e.g. Blue Bottle Coffee"
                className={fieldInputClass(isLowConfidence('vendor'))}
              />
            </FormField>

            <FormField label="Date" ai={isAiField} low={isLowConfidence('expense_date')} caption="AI wasn't fully sure — please check">
              <input
                type="date"
                value={form.expense_date}
                onChange={(e) => updateField('expense_date', e.target.value)}
                className={fieldInputClass(isLowConfidence('expense_date'))}
              />
            </FormField>

            <FormField label="Category" ai={isAiField} low={isLowConfidence('category')} caption="AI wasn't fully sure — please check">
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <CategoryChip
                    key={c.value}
                    category={c.value}
                    selected={form.category === c.value}
                    onClick={() => updateField('category', c.value)}
                  />
                ))}
              </div>
            </FormField>

            <FormField label="Currency" ai={isAiField} low={isLowConfidence('currency')} caption="AI wasn't fully sure — please check">
              <select
                value={form.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                className={fieldInputClass(false)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Notes (optional)">
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={2}
                placeholder="Add a note…"
                className={`${fieldInputClass(false)} resize-none`}
              />
            </FormField>

            {isEdit && (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-2 text-finly-error text-sm font-semibold pt-2"
              >
                <i className="fa-solid fa-trash" aria-hidden="true" /> Delete expense
              </button>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-finly-cardBg border-t border-finly-hairline px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="max-w-[480px] mx-auto">
          <Button fullWidth size="lg" onClick={handleSave} disabled={!canSave}>
            {saving ? 'Saving…' : 'Save Expense'}
          </Button>
        </div>
      </div>

      {zoomed && receiptUrl && (
        <div
          className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img src={receiptUrl} alt="Receipt full size" className="max-h-full max-w-full object-contain rounded-xl" />
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this expense?"
        message="This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
