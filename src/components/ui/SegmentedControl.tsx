interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, className = '' }: SegmentedControlProps<T>) {
  return (
    <nav className={`bg-finly-pill p-1 rounded-full flex items-center text-xs font-semibold ${className}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2.5 px-4 rounded-full text-[13px] transition-all text-center ${
              active ? 'bg-finly-dark text-white font-display shadow-sm' : 'text-neutral-600 hover:text-finly-dark'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </nav>
  );
}
