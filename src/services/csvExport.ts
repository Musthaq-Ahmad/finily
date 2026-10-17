import type { Expense, Trip } from '../types';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildExpensesCsv(expenses: Expense[]): string {
  const header = ['Date', 'Vendor', 'Category', 'Amount', 'Currency', 'Notes', 'Source', 'Sync Status'];
  const rows = expenses.map((e) => [
    e.expense_date ?? '',
    e.vendor ?? '',
    e.category ?? '',
    e.amount != null ? e.amount.toFixed(2) : '',
    e.currency ?? '',
    e.notes ?? '',
    e.source,
    e.sync_status,
  ]);
  return [header, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(',')).join('\n');
}

export function downloadTripExpensesCsv(trip: Trip, expenses: Expense[]): { filename: string; count: number } {
  const csv = buildExpensesCsv(expenses);
  const safeName = trip.name.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'trip';
  const filename = `${safeName}.csv`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { filename, count: expenses.length };
}
