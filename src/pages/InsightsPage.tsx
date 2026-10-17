import { useNavigate } from 'react-router-dom';
import { AccountMenu } from '../components/AccountMenu';
import { CategoryDonut } from '../components/ui/CategoryDonut';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LineArtBackdrop } from '../components/ui/LineArtBackdrop';
import { useInsights } from '../data/hooks';

function formatMonth(key: string): string {
  return new Date(`${key}-01T00:00:00`).toLocaleDateString(undefined, { month: 'short' });
}

function MonthlyTrend({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-3">
      {data.map((d) => {
        const heightPx = Math.max((d.amount / max) * 80, 4);
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full h-20 flex items-end">
              <div className="w-full rounded-t-lg bg-finly-lime" style={{ height: `${heightPx}px` }} />
            </div>
            <span className="text-[10px] text-finly-muted font-semibold">{formatMonth(d.month)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function InsightsPage() {
  const navigate = useNavigate();
  const { total, byCategory, byMonth, topTrips, loading } = useInsights();
  const hasAnyData = total > 0;

  return (
    <div className="relative isolate min-h-screen bg-finly-surface pb-32">
      <LineArtBackdrop />

      <header className="sticky top-0 z-30 bg-finly-surface/95 backdrop-blur-sm px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3 flex items-center justify-between max-w-[480px] mx-auto">
        <h1 className="text-xl font-bold font-display text-finly-dark">Insights</h1>
        <AccountMenu />
      </header>

      <main className="max-w-[480px] mx-auto px-4">
        {loading ? (
          <div className="space-y-5 mt-2">
            <div className="h-28 rounded-3xl bg-finly-pill animate-pulse" />
            <div className="h-48 rounded-3xl bg-finly-pill animate-pulse" />
          </div>
        ) : !hasAnyData ? (
          <EmptyState
            icon="fa-solid fa-chart-pie"
            title="No data yet"
            subtitle="Add a few expenses and your spending patterns will show up here."
          />
        ) : (
          <div className="space-y-5 mt-2">
            <Card tone="lime">
              <p className="text-xs font-semibold text-finly-dark/70 uppercase tracking-wide">All-time spend</p>
              <p className="text-3xl font-bold font-display text-finly-dark tabular mt-1">₹{total.toFixed(2)}</p>
            </Card>

            <Card>
              <p className="text-xs font-bold text-finly-muted uppercase tracking-wide mb-3">Spend by category</p>
              <CategoryDonut segments={byCategory} />
            </Card>

            {byMonth.length > 1 && (
              <Card>
                <p className="text-xs font-bold text-finly-muted uppercase tracking-wide mb-4">Last few months</p>
                <MonthlyTrend data={byMonth} />
              </Card>
            )}

            {topTrips.length > 0 && (
              <Card>
                <p className="text-xs font-bold text-finly-muted uppercase tracking-wide mb-3">Biggest trips</p>
                <div className="space-y-2">
                  {topTrips.map(({ trip, total: tripTotal }, i) => (
                    <button
                      key={trip.id}
                      type="button"
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="w-full flex items-center gap-3 rounded-2xl bg-finly-surface px-3 py-2.5 text-left hover:bg-finly-pill transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-finly-dark text-finly-lime text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0 text-sm font-semibold text-finly-dark truncate">{trip.name}</span>
                      <span className="text-sm font-bold text-finly-dark tabular flex-shrink-0">₹{tripTotal.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
