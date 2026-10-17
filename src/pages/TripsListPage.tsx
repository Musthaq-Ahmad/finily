import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateTripSheet } from '../components/CreateTripSheet';
import { OfflineBanner } from '../components/OfflineBanner';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useTripExpenses, useTrips } from '../data/hooks';
import type { Trip } from '../types';

function formatDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

function TripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate();
  const { expenses, total } = useTripExpenses(trip.id);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/trips/${trip.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/trips/${trip.id}`);
      }}
      className="cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-finly-dark truncate">{trip.name}</h3>
          <p className="text-xs text-finly-muted mt-0.5">{formatDateRange(trip.start_date, trip.end_date)}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-bold text-lg text-finly-dark tabular">₹{total.toFixed(2)}</p>
          <p className="text-[11px] text-finly-muted">
            {expenses.length} expense{expenses.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function TripsListPage() {
  const { trips, loading } = useTrips();
  const { logout } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-finly-surface pb-28">
      <header className="sticky top-0 z-30 bg-finly-surface/95 backdrop-blur-sm px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3 flex items-center justify-between max-w-[480px] mx-auto">
        <h1 className="text-xl font-bold font-display text-finly-dark">My Trips</h1>
        <Button variant="icon" size="sm" onClick={logout} aria-label="Log out">
          <i className="fa-solid fa-arrow-right-from-bracket text-sm" aria-hidden="true" />
        </Button>
      </header>

      <main className="max-w-[480px] mx-auto px-4">
        <OfflineBanner />

        {loading ? (
          <div className="space-y-3 mt-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-20 rounded-3xl bg-finly-pill animate-pulse" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            icon="fa-solid fa-suitcase-rolling"
            title="No trips yet"
            subtitle="Create your first trip to start capturing expenses."
            action={<Button onClick={() => setCreateOpen(true)}>Create your first trip</Button>}
          />
        ) : (
          <div className="space-y-3 mt-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </main>

      {trips.length > 0 && (
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label="New trip"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] right-6 w-14 h-14 rounded-full bg-finly-dark text-finly-lime shadow-dock flex items-center justify-center text-xl active:scale-95 transition-transform z-40"
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
        </button>
      )}

      <CreateTripSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
