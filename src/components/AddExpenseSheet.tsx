import { useNavigate } from 'react-router-dom';
import { BottomSheet } from './ui/BottomSheet';

interface AddExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
}

export function AddExpenseSheet({ open, onClose, tripId }: AddExpenseSheetProps) {
  const navigate = useNavigate();

  const goScan = () => {
    onClose();
    navigate(`/trips/${tripId}/scan`);
  };

  const goManual = () => {
    onClose();
    navigate(`/trips/${tripId}/expenses/new`, { state: { mode: 'manual' } });
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Add expense">
      <div className="grid grid-cols-2 gap-3 pb-2">
        <button
          type="button"
          onClick={goScan}
          className="flex flex-col items-center gap-2 rounded-3xl bg-finly-lime text-finly-ink py-6 px-3 font-bold shadow-limeCard active:scale-95 transition-transform"
        >
          <i className="fa-solid fa-camera text-2xl" aria-hidden="true" />
          <span className="text-sm">Scan Receipt</span>
        </button>
        <button
          type="button"
          onClick={goManual}
          className="flex flex-col items-center gap-2 rounded-3xl bg-finly-surface text-finly-dark py-6 px-3 font-bold border border-finly-hairline active:scale-95 transition-transform"
        >
          <i className="fa-solid fa-pen text-2xl" aria-hidden="true" />
          <span className="text-sm">Manual Entry</span>
        </button>
      </div>
    </BottomSheet>
  );
}
