import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-16 h-16 rounded-full bg-finly-pill flex items-center justify-center text-finly-dark text-2xl mb-4">
        <i className={icon} aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-finly-dark">{title}</h3>
      {subtitle && <p className="text-sm text-finly-muted mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
