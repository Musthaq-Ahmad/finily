import { useToast } from '../context/ToastContext';

const toneClasses: Record<'default' | 'success' | 'error', string> = {
  default: 'bg-finly-dark text-white',
  success: 'bg-finly-dark text-finly-lime',
  error: 'bg-finly-error text-white',
};

export function ToastHost() {
  const { toasts, dismissToast } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 max-w-[90vw] rounded-full pl-4 pr-2 py-2 text-sm font-semibold shadow-level3 ${toneClasses[t.tone]}`}
        >
          <button type="button" onClick={() => dismissToast(t.id)} className="truncate text-left">
            {t.message}
          </button>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action?.onClick();
                dismissToast(t.id);
              }}
              className="flex-shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide hover:bg-white/25 transition-colors"
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
