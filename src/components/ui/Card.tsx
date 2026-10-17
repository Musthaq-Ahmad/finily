import type { HTMLAttributes, ReactNode } from 'react';

type Tone = 'white' | 'lime' | 'cyan' | 'flat';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  children?: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  white: 'bg-finly-cardBg border border-finly-hairline shadow-tactile',
  lime: 'bg-finly-lime border border-lime-300 shadow-limeCard',
  cyan: 'bg-finly-cyan border border-cyan-200/60 shadow-level1',
  flat: 'bg-finly-pill',
};

export function Card({ tone = 'white', className = '', children, ...rest }: CardProps) {
  return (
    <div className={`rounded-3xl p-4 ${toneClasses[tone]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
