import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { useCreateTrip } from '../data/hooks';

interface CreateTripSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTripSheet({ open, onClose }: CreateTripSheetProps) {
  const createTrip = useCreateTrip();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const trip = await createTrip({ name, start_date: startDate, end_date: endDate });
      handleClose();
      navigate(`/trips/${trip.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title="New trip">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-finly-dark mb-1.5" htmlFor="trip-name">
            Trip name
          </label>
          <input
            id="trip-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="SF Client Visit"
            className="w-full rounded-2xl border border-finly-hairline bg-finly-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finly-lime"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-finly-dark mb-1.5" htmlFor="trip-start">
              Start date
            </label>
            <input
              id="trip-start"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-2xl border border-finly-hairline bg-finly-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finly-lime"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-finly-dark mb-1.5" htmlFor="trip-end">
              End date
            </label>
            <input
              id="trip-end"
              type="date"
              required
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-2xl border border-finly-hairline bg-finly-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finly-lime"
            />
          </div>
        </div>
        <Button type="submit" fullWidth size="lg" disabled={submitting || !name || !startDate || !endDate}>
          {submitting ? 'Creating…' : 'Create'}
        </Button>
      </form>
    </BottomSheet>
  );
}
