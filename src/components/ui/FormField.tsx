import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  ai?: boolean;
  low?: boolean;
  caption?: string;
  children: ReactNode;
}

export function FormField({ label, ai = false, low = false, caption, children }: FormFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-xs font-semibold text-finly-dark">{label}</label>
        {ai && (
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-finly-cyan text-finly-dark">
            AI
          </span>
        )}
      </div>
      {children}
      {low && caption && <p className="text-[11px] text-finly-amber font-semibold mt-1">{caption}</p>}
    </div>
  );
}

export function fieldInputClass(low: boolean): string {
  return `w-full rounded-2xl border bg-finly-cardBg px-4 py-3 text-sm text-finly-dark focus:outline-none focus:ring-2 focus:ring-finly-lime ${
    low ? 'border-finly-amber ring-1 ring-finly-amber/40' : 'border-finly-hairline'
  }`;
}
