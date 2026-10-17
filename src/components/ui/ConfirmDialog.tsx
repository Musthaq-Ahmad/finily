import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div role="alertdialog" aria-modal="true" className="relative w-full max-w-[340px] bg-finly-cardBg rounded-3xl p-5 shadow-level3">
        <h2 className="text-base font-bold text-finly-dark font-display">{title}</h2>
        {message && <p className="text-sm text-finly-muted mt-1.5">{message}</p>}
        <div className="flex gap-3 mt-5">
          <Button variant="ghost" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'destructive' : 'primary'} fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
