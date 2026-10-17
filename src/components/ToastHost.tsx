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
        <button
          key={t.id}
          type="button"
          onClick={() => dismissToast(t.id)}
          className={`pointer-events-auto max-w-[90vw] truncate rounded-full px-4 py-2.5 text-sm font-semibold shadow-level3 ${toneClasses[t.tone]}`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
