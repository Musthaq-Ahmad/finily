import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon';
type Size = 'md' | 'lg' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-finly-dark text-white hover:bg-black shadow-tactile',
  secondary: 'bg-finly-lime text-finly-ink hover:bg-finly-limeHover shadow-sm',
  ghost: 'bg-finly-pill text-finly-dark hover:bg-finly-hairline',
  destructive: 'bg-finly-error text-white hover:bg-red-700 shadow-sm',
  icon: 'bg-white text-finly-dark shadow-pill hover:bg-finly-surface',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3.5 py-2 rounded-full gap-1.5',
  md: 'text-sm px-5 py-3 rounded-2xl gap-2',
  lg: 'text-base px-6 py-4 rounded-2xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isIconOnly = variant === 'icon';
  const shape = isIconOnly ? 'w-11 h-11 rounded-full flex items-center justify-center' : `flex items-center justify-center font-bold ${sizeClasses[size]}`;

  return (
    <button
      className={`${shape} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
