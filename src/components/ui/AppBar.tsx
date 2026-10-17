import type { ReactNode } from 'react';
import { Button } from './Button';

interface AppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function AppBar({ title, subtitle, onBack, right }: AppBarProps) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 bg-finly-surface/95 backdrop-blur-sm px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3 flex items-center gap-3">
      {onBack && (
        <Button variant="icon" size="sm" onClick={onBack} aria-label="Back">
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </Button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold font-display text-finly-dark truncate">{title}</h1>
        {subtitle && <p className="text-xs text-finly-muted truncate mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
