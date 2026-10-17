import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../types';
import type { Category, Expense, Trip } from '../types';
import { useDataVersion } from './DataContext';
import {
  dbDeleteExpense,
  dbDeleteTrip,
  dbGetExpense,
  dbGetReceiptImage,
  dbGetTrip,
  dbListExpenses,
  dbListTrips,
  dbPutExpense,
  dbPutTrip,
  dbSaveReceiptImage,
  newId,
} from './db';

export const LOW_CONFIDENCE_THRESHOLD = 0.5;

export function useTrips() {
  const { session } = useAuth();
  const { version } = useDataVersion();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setTrips([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    dbListTrips(session.userId).then((result) => {
      if (!cancelled) {
        setTrips(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session, version]);

  return { trips, loading };
}

interface CrossTripSummary {
  total: number;
  tripCount: number;
  expenseCount: number;
  pendingCount: number;
  loading: boolean;
}

/** Aggregates spend across every trip the user has — for the trips-list overview card. */
export function useCrossTripSummary(): CrossTripSummary {
  const { trips, loading: tripsLoading } = useTrips();
  const { version } = useDataVersion();
  const [summary, setSummary] = useState({ total: 0, expenseCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripsLoading) return;
    if (trips.length === 0) {
      setSummary({ total: 0, expenseCount: 0, pendingCount: 0 });
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(trips.map((t) => dbListExpenses(t.id))).then((lists) => {
      if (cancelled) return;
      const all = lists.flat();
      setSummary({
        total: all.reduce((sum, e) => sum + (e.amount ?? 0), 0),
        expenseCount: all.length,
        pendingCount: all.filter((e) => e.sync_status === 'pending').length,
      });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [trips, tripsLoading, version]);

  return { ...summary, tripCount: trips.length, loading: loading || tripsLoading };
}

interface InsightsData {
  total: number;
  byCategory: { category: Category; amount: number }[];
  byMonth: { month: string; amount: number }[];
  topTrips: { trip: Trip; total: number }[];
  loading: boolean;
}

/** Cross-trip analytics — category mix, monthly trend, and biggest trips, across every trip the user has. */
export function useInsights(): InsightsData {
  const { trips, loading: tripsLoading } = useTrips();
  const { version } = useDataVersion();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripsLoading) return;
    if (trips.length === 0) {
      setAllExpenses([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(trips.map((t) => dbListExpenses(t.id))).then((lists) => {
      if (!cancelled) {
        setAllExpenses(lists.flat());
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [trips, tripsLoading, version]);

  const total = allExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const byCategory = CATEGORIES.map((c) => ({
    category: c.value,
    amount: allExpenses.filter((e) => e.category === c.value).reduce((sum, e) => sum + (e.amount ?? 0), 0),
  }));

  const monthTotals = new Map<string, number>();
  for (const e of allExpenses) {
    if (!e.expense_date) continue;
    const key = e.expense_date.slice(0, 7);
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + (e.amount ?? 0));
  }
  const byMonth = Array.from(monthTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({ month, amount }));

  const tripTotals = new Map<string, number>();
  for (const e of allExpenses) {
    tripTotals.set(e.trip_id, (tripTotals.get(e.trip_id) ?? 0) + (e.amount ?? 0));
  }
  const topTrips = trips
    .map((trip) => ({ trip, total: tripTotals.get(trip.id) ?? 0 }))
    .filter((t) => t.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return { total, byCategory, byMonth, topTrips, loading: loading || tripsLoading };
}

export function useTrip(tripId: string | undefined) {
  const { version } = useDataVersion();
  const [trip, setTrip] = useState<Trip | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    dbGetTrip(tripId).then((result) => {
      if (!cancelled) {
        setTrip(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tripId, version]);

  return { trip, loading };
}

export function useCreateTrip() {
  const { session } = useAuth();
  const { notifyChange } = useDataVersion();

  return useCallback(
    async (input: { name: string; start_date: string; end_date: string }): Promise<Trip> => {
      if (!session) throw new Error('Not logged in');
      const trip: Trip = {
        id: newId(),
        user_id: session.userId,
        name: input.name,
        start_date: input.start_date,
        end_date: input.end_date,
        created_at: new Date().toISOString(),
      };
      await dbPutTrip(trip);
      notifyChange();
      return trip;
    },
    [session, notifyChange],
  );
}

export function useDeleteTrip() {
  const { notifyChange } = useDataVersion();
  return useCallback(
    async (id: string) => {
      await dbDeleteTrip(id);
      notifyChange();
    },
    [notifyChange],
  );
}

export function useTripExpenses(tripId: string | undefined) {
  const { version } = useDataVersion();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    dbListExpenses(tripId).then((result) => {
      if (!cancelled) {
        setExpenses(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tripId, version]);

  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const pendingCount = expenses.filter((e) => e.sync_status === 'pending').length;

  return { expenses, loading, total, pendingCount };
}

export function useExpense(expenseId: string | undefined) {
  const { version } = useDataVersion();
  const [expense, setExpense] = useState<Expense | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!expenseId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    dbGetExpense(expenseId).then((result) => {
      if (!cancelled) {
        setExpense(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [expenseId, version]);

  return { expense, loading };
}

export function useSaveExpense() {
  const { notifyChange } = useDataVersion();

  return useCallback(
    async (
      input: Omit<Expense, 'created_at' | 'updated_at' | 'sync_status' | 'id'> & { id?: string; created_at?: string },
    ): Promise<Expense> => {
      const now = new Date().toISOString();
      const expense: Expense = {
        ...input,
        id: input.id ?? newId(),
        created_at: input.created_at ?? now,
        updated_at: now,
        sync_status: navigator.onLine ? 'synced' : 'pending',
      };
      await dbPutExpense(expense);
      notifyChange();
      return expense;
    },
    [notifyChange],
  );
}

export function useDeleteExpense() {
  const { notifyChange } = useDataVersion();
  return useCallback(
    async (id: string) => {
      await dbDeleteExpense(id);
      notifyChange();
    },
    [notifyChange],
  );
}

export function useSaveReceiptImage() {
  return useCallback(async (blob: Blob) => dbSaveReceiptImage(blob), []);
}

/** Resolves a `receipt_image_path` to a displayable object URL. Caller owns revoking it. */
export function useReceiptImageUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;
    dbGetReceiptImage(path).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return url;
}
