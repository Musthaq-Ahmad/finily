import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Expense, Trip, User } from '../types';

interface FinlyDBSchema extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-google-sub': string };
  };
  trips: {
    key: string;
    value: Trip;
    indexes: { 'by-user': string };
  };
  expenses: {
    key: string;
    value: Expense;
    indexes: { 'by-trip': string };
  };
  receiptImages: {
    key: string;
    value: { id: string; blob: Blob; created_at: string };
  };
}

const DB_NAME = 'finly-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<FinlyDBSchema>> | null = null;

export function getDb(): Promise<IDBPDatabase<FinlyDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<FinlyDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'id' });
          store.createIndex('by-google-sub', 'google_sub', { unique: true });
        } else if (oldVersion < 2) {
          // v1 -> v2: auth moved from email/password to Google sign-in only.
          // Cast away the schema-narrowed index-name typing: 'by-email' no
          // longer exists in FinlyDBSchema, but may still exist in a v1 db.
          const store = transaction.objectStore('users') as unknown as IDBObjectStore;
          if (store.indexNames.contains('by-email')) store.deleteIndex('by-email');
          if (!store.indexNames.contains('by-google-sub')) {
            store.createIndex('by-google-sub', 'google_sub', { unique: true });
          }
        }
        if (!db.objectStoreNames.contains('trips')) {
          const store = db.createObjectStore('trips', { keyPath: 'id' });
          store.createIndex('by-user', 'user_id');
        }
        if (!db.objectStoreNames.contains('expenses')) {
          const store = db.createObjectStore('expenses', { keyPath: 'id' });
          store.createIndex('by-trip', 'trip_id');
        }
        if (!db.objectStoreNames.contains('receiptImages')) {
          db.createObjectStore('receiptImages', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---- users ----

export async function dbGetUserByGoogleSub(googleSub: string): Promise<User | undefined> {
  const db = await getDb();
  return db.getFromIndex('users', 'by-google-sub', googleSub);
}

export async function dbPutUser(user: User): Promise<void> {
  const db = await getDb();
  await db.put('users', user);
}

// ---- trips ----

export async function dbListTrips(userId: string): Promise<Trip[]> {
  const db = await getDb();
  const trips = await db.getAllFromIndex('trips', 'by-user', userId);
  return trips.sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
}

export async function dbGetTrip(id: string): Promise<Trip | undefined> {
  const db = await getDb();
  return db.get('trips', id);
}

export async function dbPutTrip(trip: Trip): Promise<void> {
  const db = await getDb();
  await db.put('trips', trip);
}

export async function dbDeleteTrip(id: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['trips', 'expenses'], 'readwrite');
  await tx.objectStore('trips').delete(id);
  const expenseStore = tx.objectStore('expenses');
  const expenseIndex = expenseStore.index('by-trip');
  let cursor = await expenseIndex.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// ---- expenses ----

export async function dbListExpenses(tripId: string): Promise<Expense[]> {
  const db = await getDb();
  const expenses = await db.getAllFromIndex('expenses', 'by-trip', tripId);
  return expenses.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function dbGetExpense(id: string): Promise<Expense | undefined> {
  const db = await getDb();
  return db.get('expenses', id);
}

export async function dbPutExpense(expense: Expense): Promise<void> {
  const db = await getDb();
  await db.put('expenses', expense);
}

export async function dbDeleteExpense(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('expenses', id);
}

/** Simulates the background-sync sweep described in TRD §8 on reconnect. */
export async function dbMarkAllPendingSynced(): Promise<number> {
  const db = await getDb();
  const tx = db.transaction('expenses', 'readwrite');
  let cursor = await tx.store.openCursor();
  let count = 0;
  while (cursor) {
    if (cursor.value.sync_status === 'pending') {
      await cursor.update({ ...cursor.value, sync_status: 'synced' });
      count += 1;
    }
    cursor = await cursor.continue();
  }
  await tx.done;
  return count;
}

// ---- receipt images (stand-in for server-side object storage in this MVP) ----

export async function dbSaveReceiptImage(blob: Blob): Promise<string> {
  const db = await getDb();
  const id = newId();
  await db.put('receiptImages', { id, blob, created_at: new Date().toISOString() });
  return `local-blob://${id}`;
}

export async function dbGetReceiptImage(path: string | null): Promise<Blob | undefined> {
  if (!path) return undefined;
  const id = path.replace('local-blob://', '');
  const db = await getDb();
  const record = await db.get('receiptImages', id);
  return record?.blob;
}
