import type { ReactNode } from 'react';

interface BannerProps {
  tone?: 'amber' | 'error';
  icon?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

const toneClasses: Record<NonNullable<BannerProps['tone']>, { wrap: string; iconWrap: string; title: string; subtitle: string }> = {
  amber: {
    wrap: 'bg-finly-amberBg border-finly-amber/30',
    iconWrap: 'bg-finly-amber/20 text-finly-amber',
    title: 'text-amber-950',
    subtitle: 'text-amber-800/80',
  },
  error: {
    wrap: 'bg-finly-errorBg border-finly-error/30',
    iconWrap: 'bg-finly-error/15 text-finly-error',
    title: 'text-red-950',
    subtitle: 'text-red-800/80',
  },
};

export function Banner({ tone = 'amber', icon = 'fa-solid fa-triangle-exclamation', title, subtitle, action, className = '' }: BannerProps) {
  const c = toneClasses[tone];
  return (
    <div className={`flex items-center justify-between border rounded-2xl px-3.5 py-2.5 shadow-sm ${c.wrap} ${className}`} role="status">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${c.iconWrap}`}>
          <i className={`${icon} text-[13px]`} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-semibold leading-tight ${c.title}`}>{title}</p>
          {subtitle && <p className={`text-[11px] leading-tight mt-0.5 ${c.subtitle}`}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
