import type { Category } from '../../types';
import { CATEGORIES } from '../../types';

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function CategoryChip({ category, selected = false, onClick, size = 'md' }: CategoryChipProps) {
  const meta = CATEGORIES.find((c) => c.value === category);
  if (!meta) return null;

  const interactive = typeof onClick === 'function';
  const padding = size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs';

  return (
    <button
      type="button"
      role={interactive ? 'radio' : undefined}
      aria-checked={interactive ? selected : undefined}
      onClick={onClick}
      disabled={!interactive}
      className={`flex items-center gap-1.5 rounded-2xl font-bold flex-shrink-0 transition transform ${
        interactive ? 'active:scale-95' : ''
      } ${padding} ${
        selected
          ? 'bg-finly-dark text-finly-lime border-2 border-finly-dark shadow-sm'
          : 'bg-finly-surface text-finly-dark border-2 border-transparent hover:bg-finly-pill'
      } ${!interactive ? 'cursor-default' : ''}`}
    >
      <i className={meta.icon} aria-hidden="true" />
      <span>{meta.label}</span>
      {selected && <span className="w-1.5 h-1.5 rounded-full bg-finly-lime ml-0.5" />}
    </button>
  );
}

export function CategoryIcon({ category, className = '' }: { category: Category | null; className?: string }) {
  const meta = CATEGORIES.find((c) => c.value === category);
  return <i className={`${meta?.icon ?? 'fa-solid fa-receipt'} ${className}`} aria-hidden="true" />;
}
