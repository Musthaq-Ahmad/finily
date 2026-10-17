import { jsPDF } from 'jspdf';
import { CATEGORIES } from '../types';
import type { Expense, Trip } from '../types';

function safeFileName(name: string): string {
  return name.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'trip';
}

/** Builds a one-page itemized PDF report for a trip, grouped by category. */
export function buildTripReportPdf(trip: Trip, expenses: Expense[]): { blob: Blob; filename: string } {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let y = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Expense Report', marginX, y);

  y += 22;
  doc.setFontSize(12);
  doc.text(trip.name, marginX, y);

  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(115, 118, 125);
  doc.text(`${trip.start_date} to ${trip.end_date}`, marginX, y);
  doc.setTextColor(20, 21, 23);

  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const currency = expenses[0]?.currency ?? 'INR';

  y += 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total spend', marginX, y);
  doc.setFontSize(16);
  doc.text(`${total.toFixed(2)} ${currency}`, marginX, y + 18);

  y += 44;
  doc.setDrawColor(230, 231, 227);
  doc.line(marginX, y, 595 - marginX, y);
  y += 20;

  const columns = [
    { label: 'Date', width: 70 },
    { label: 'Vendor', width: 170 },
    { label: 'Category', width: 90 },
    { label: 'Amount', width: 100 },
  ];

  const drawHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(115, 118, 125);
    let x = marginX;
    for (const col of columns) {
      doc.text(col.label.toUpperCase(), x, y);
      x += col.width;
    }
    doc.setTextColor(20, 21, 23);
    y += 12;
    doc.setDrawColor(230, 231, 227);
    doc.line(marginX, y, 595 - marginX, y);
    y += 16;
  };

  drawHeader();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  for (const category of CATEGORIES) {
    const items = expenses.filter((e) => e.category === category.value);
    if (items.length === 0) continue;

    if (y > 760) {
      doc.addPage();
      y = 56;
      drawHeader();
    }

    doc.setFont('helvetica', 'bold');
    doc.text(category.label, marginX, y);
    const subtotal = items.reduce((sum, e) => sum + (e.amount ?? 0), 0);
    doc.text(`${subtotal.toFixed(2)} ${currency}`, marginX + columns[0].width + columns[1].width + columns[2].width, y);
    doc.setFont('helvetica', 'normal');
    y += 16;

    for (const expense of items) {
      if (y > 780) {
        doc.addPage();
        y = 56;
        drawHeader();
      }
      let x = marginX;
      doc.text(expense.expense_date ?? '—', x, y);
      x += columns[0].width;
      doc.text(expense.vendor ?? 'Unnamed expense', x, y, { maxWidth: columns[1].width - 8 });
      x += columns[1].width;
      doc.text(category.label, x, y);
      x += columns[2].width;
      doc.text(expense.amount != null ? `${expense.amount.toFixed(2)} ${expense.currency}` : '—', x, y);
      y += 16;
    }
    y += 8;
  }

  const uncategorized = expenses.filter((e) => e.category == null);
  if (uncategorized.length > 0) {
    if (y > 760) {
      doc.addPage();
      y = 56;
      drawHeader();
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Uncategorized', marginX, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    for (const expense of uncategorized) {
      let x = marginX;
      doc.text(expense.expense_date ?? '—', x, y);
      x += columns[0].width;
      doc.text(expense.vendor ?? 'Unnamed expense', x, y, { maxWidth: columns[1].width - 8 });
      x += columns[1].width + columns[2].width;
      doc.text(expense.amount != null ? `${expense.amount.toFixed(2)} ${expense.currency}` : '—', x, y);
      y += 16;
    }
  }

  const blob = doc.output('blob');
  const filename = `${safeFileName(trip.name)}_expense_report.pdf`;
  return { blob, filename };
}
