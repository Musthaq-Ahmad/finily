import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { OfflineBanner } from '../components/OfflineBanner';
import { AppBar } from '../components/ui/AppBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CategoryIcon } from '../components/ui/CategoryChip';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge, type StatusVariant } from '../components/ui/StatusBadge';
import { useToast } from '../context/ToastContext';
import { LOW_CONFIDENCE_THRESHOLD, useTrip, useTripExpenses } from '../data/hooks';
import { downloadTripExpensesCsv } from '../services/csvExport';
import { CATEGORIES } from '../types';
import type { Expense } from '../types';

function formatDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

function statusFor(expense: Expense): StatusVariant {
  if (expense.sync_status === 'pending') return 'pending';
  const lowConfidence = expense.ai_confidence != null && expense.ai_confidence < LOW_CONFIDENCE_THRESHOLD;
  const flaggedFields = (expense.low_confidence_fields?.length ?? 0) > 0;
  if (expense.source === 'ai_extracted' && (lowConfidence || flaggedFields)) {
    return 'needs_review';
  }
  return 'synced';
}

function ExpenseRow({ expense, tripId }: { expense: Expense; tripId: string }) {
  const navigate = useNavigate();
  return (
    <Card
      tone="flat"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/trips/${tripId}/expenses/${expense.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/trips/${tripId}/expenses/${expense.id}`);
      }}
      className="flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-finly-dark flex-shrink-0">
        <CategoryIcon category={expense.category} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-finly-dark truncate">{expense.vendor ?? 'Unnamed expense'}</p>
        <p className="text-[11px] text-finly-muted mt-0.5">{expense.expense_date ?? '—'}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-finly-dark tabular">
          {expense.amount != null ? `${expense.amount.toFixed(2)} ${expense.currency}` : '—'}
        </p>
        <StatusBadge variant={statusFor(expense)} className="mt-1" />
      </div>
    </Card>
  );
}

export function TripDetailPage() {
  const { tripId = '' } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { trip, loading: tripLoading } = useTrip(tripId);
  const { expenses, loading: expensesLoading, total, pendingCount } = useTripExpenses(tripId);
  const [addOpen, setAddOpen] = useState(false);

  const groups = useMemo(
    () =>
      CATEGORIES.map((c) => ({ category: c, items: expenses.filter((e) => e.category === c.value) })).filter(
        (g) => g.items.length > 0,
      ),
    [expenses],
  );
  const uncategorized = useMemo(() => expenses.filter((e) => e.category == null), [expenses]);

  if (!tripLoading && !trip) {
    return (
      <div className="min-h-screen bg-finly-surface flex items-center justify-center px-6">
        <EmptyState
          icon="fa-solid fa-triangle-exclamation"
          title="Trip not found"
          action={<Button onClick={() => navigate('/')}>Back to trips</Button>}
        />
      </div>
    );
  }

  const handleExport = () => {
    if (!trip) return;
    const { filename, count } = downloadTripExpensesCsv(trip, expenses);
    showToast(`Exported ${count} expense${count === 1 ? '' : 's'} — ${filename}`, 'success');
  };

  return (
    <div className="min-h-screen bg-finly-surface pb-32">
      <div className="max-w-[480px] mx-auto px-4">
        <AppBar
          title={trip?.name ?? 'Trip'}
          subtitle={trip ? formatDateRange(trip.start_date, trip.end_date) : undefined}
          onBack={() => navigate('/')}
          right={pendingCount > 0 ? <StatusBadge variant="pending" label={`${pendingCount} pending`} /> : undefined}
        />

        <OfflineBanner />

        <Card tone="lime" className="mb-5">
          <p className="text-xs font-semibold text-finly-dark/70 uppercase tracking-wide">Total spend</p>
          <p className="text-3xl font-bold font-display text-finly-dark tabular mt-1">₹{total.toFixed(2)}</p>
        </Card>

        {expensesLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-finly-pill animate-pulse" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon="fa-solid fa-receipt"
            title="No expenses yet"
            subtitle="Add your first one to start tracking this trip."
            action={<Button onClick={() => setAddOpen(true)}>Add expense</Button>}
          />
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.category.value}>
                <div className="flex items-center justify-between px-1 mb-2">
                  <h2 className="text-xs font-bold text-finly-muted uppercase tracking-wide">{group.category.label}</h2>
                  <span className="text-xs font-semibold text-finly-muted tabular">
                    ₹{group.items.reduce((s, e) => s + (e.amount ?? 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.items.map((expense) => (
                    <ExpenseRow key={expense.id} expense={expense} tripId={tripId} />
                  ))}
                </div>
              </section>
            ))}
            {uncategorized.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-finly-muted uppercase tracking-wide px-1 mb-2">Uncategorized</h2>
                <div className="space-y-2">
                  {uncategorized.map((expense) => (
                    <ExpenseRow key={expense.id} expense={expense} tripId={tripId} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-finly-cardBg border-t border-finly-hairline px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="max-w-[480px] mx-auto flex items-center gap-3">
          <Button fullWidth size="lg" onClick={() => setAddOpen(true)}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Add Expense
          </Button>
          <Button variant="icon" size="lg" onClick={handleExport} aria-label="Export CSV" disabled={expenses.length === 0}>
            <i className="fa-solid fa-file-export" aria-hidden="true" />
          </Button>
          <Button
            variant="icon"
            size="lg"
            onClick={() => navigate(`/trips/${tripId}/report`)}
            aria-label="Email Report"
            disabled={expenses.length === 0}
          >
            <i className="fa-solid fa-envelope" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <AddExpenseSheet open={addOpen} onClose={() => setAddOpen(false)} tripId={tripId} />
    </div>
  );
}
