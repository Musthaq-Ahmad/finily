import type { Expense, Trip } from '../types';

export interface ReportDraft {
  subject: string;
  body: string;
}

// SEAM: stands in for a backend call that asks Claude to draft an email
// summarizing the trip's expenses (e.g. POST /api/trips/:id/report/draft).
// A real backend swap replaces the body of this function with a fetch();
// the { subject, body } contract stays identical so callers don't change.
export function generateTripReport(trip: Trip, expenses: Expense[]): Promise<ReportDraft> {
  const delayMs = 700 + Math.random() * 600;

  return new Promise((resolve) => {
    setTimeout(() => {
      const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
      const currency = expenses[0]?.currency ?? 'INR';
      const dateRange = `${trip.start_date} to ${trip.end_date}`;
      const subject = `Expense Report — ${trip.name} (${dateRange})`;

      const body = [
        'Hi,',
        '',
        `Here's a summary of expenses for ${trip.name} (${dateRange}).`,
        '',
        `Total spend: ${total.toFixed(2)} ${currency} across ${expenses.length} expense${expenses.length === 1 ? '' : 's'}.`,
        '',
        'A full itemized breakdown is attached as a PDF report.',
        '',
        'Best,',
      ].join('\n');

      resolve({ subject, body });
    }, delayMs);
  });
}

export interface SendReportInput {
  to: string[];
  subject: string;
  body: string;
  pdfBlob: Blob;
  pdfFilename: string;
}

/**
 * Sends the report through the local SMTP backend in `server/` (see
 * server/index.js and server/.env.example). Requires that server to be
 * running — `cd server && npm install && npm run dev` — with real SMTP
 * credentials configured, and relies on vite.config.ts's dev proxy to route
 * `/api/*` to it without CORS friction.
 */
export async function sendTripReportEmail(input: SendReportInput): Promise<void> {
  const formData = new FormData();
  formData.append('to', JSON.stringify(input.to));
  formData.append('subject', input.subject);
  formData.append('body', input.body);
  formData.append('pdf', input.pdfBlob, input.pdfFilename);

  let response: Response;
  try {
    response = await fetch('/api/reports/send', { method: 'POST', body: formData });
  } catch {
    throw new Error('Could not reach the mail server. Is it running (cd server && npm run dev)?');
  }

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const message = typeof data === 'object' && data !== null && 'error' in data ? String(data.error) : null;
    throw new Error(message ?? 'Failed to send the report email.');
  }
}
