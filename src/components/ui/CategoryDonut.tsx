import { CATEGORIES } from '../../types';
import type { Category } from '../../types';

// Deepened, chart-legible variants of the brand palette (the UI-chrome tokens
// are too light/washed-out for a thin stroke on a white card).
const CHART_COLORS: Record<Category, string> = {
  meals: '#E59218',
  lodging: '#3FB6BD',
  transport: '#A8C400',
  other: '#9094A6',
};

interface CategoryDonutProps {
  segments: { category: Category; amount: number }[];
  size?: number;
}

export function CategoryDonut({ segments, size = 128 }: CategoryDonutProps) {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.amount, 0);

  let offsetAccum = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Spend by category">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E9EAE5" strokeWidth={strokeWidth} />
          {total > 0 &&
            segments.map((segment) => {
              if (segment.amount <= 0) return null;
              const dash = (segment.amount / total) * circumference;
              const strokeDashoffset = -offsetAccum;
              offsetAccum += dash;
              return (
                <circle
                  key={segment.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={CHART_COLORS[segment.category]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
        </g>
      </svg>

      <div className="flex-1 min-w-0 space-y-1.5">
        {CATEGORIES.map((c) => {
          const amount = segments.find((s) => s.category === c.value)?.amount ?? 0;
          if (amount <= 0) return null;
          const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
          return (
            <div key={c.value} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CHART_COLORS[c.value] }}
                aria-hidden="true"
              />
              <span className="text-finly-dark font-semibold flex-1 truncate">{c.label}</span>
              <span className="text-finly-muted tabular flex-shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
