import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Portaled to <body> so this always paints above every page's own content —
  // rendering it nested inside a page div would trap its z-index inside that
  // page's local stacking context (e.g. a page with `isolate` for its own
  // background layering) instead of comparing against app-level overlays
  // like the bottom tab bar.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[480px] bg-finly-cardBg rounded-t-4xl shadow-level3 px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] max-h-[88vh] overflow-y-auto"
      >
        <div className="w-10 h-1.5 bg-finly-pill rounded-full mx-auto mb-3" />
        {title && <h2 className="text-lg font-bold text-finly-dark font-display mb-3">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body,
  );
}
