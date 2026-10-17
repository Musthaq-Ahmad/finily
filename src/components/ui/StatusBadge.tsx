export type StatusVariant = 'synced' | 'pending' | 'needs_review' | 'early_stage';

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

const config: Record<StatusVariant, { classes: string; icon: string; defaultLabel: string }> = {
  synced: {
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    icon: 'fa-solid fa-check',
    defaultLabel: 'Synced',
  },
  pending: {
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'fa-solid fa-arrows-rotate animate-spin',
    defaultLabel: 'Pending',
  },
  needs_review: {
    classes: 'bg-finly-amberBg text-finly-amber border-finly-amber/40',
    icon: 'fa-solid fa-triangle-exclamation',
    defaultLabel: 'Needs Review',
  },
  early_stage: {
    classes: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    icon: 'fa-regular fa-clock',
    defaultLabel: 'Early Stage',
  },
};

export function StatusBadge({ variant, label, className = '' }: StatusBadgeProps) {
  const c = config[variant];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${c.classes} ${className}`}
    >
      <i className={`${c.icon} text-[8px]`} aria-hidden="true" />
      {label ?? c.defaultLabel}
    </span>
  );
}
