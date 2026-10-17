import { useEffect, useRef } from 'react';
import { useDataVersion } from '../data/DataContext';
import { dbMarkAllPendingSynced } from '../data/db';
import { useToast } from '../context/ToastContext';

/**
 * TRD §8: "A background sync process (triggered on reconnect...) pushes
 * `pending` items to the backend and marks them `synced`." There is no
 * backend in this milestone, so reconnecting simply flips local `pending`
 * expenses to `synced` — the seam a real sync call will replace later.
 */
export function useAutoSync(): void {
  const { notifyChange } = useDataVersion();
  const { showToast } = useToast();
  const hasSyncedOnLoad = useRef(false);

  useEffect(() => {
    const runSync = async () => {
      const count = await dbMarkAllPendingSynced();
      if (count > 0) {
        notifyChange();
        showToast(`Synced ${count} pending expense${count === 1 ? '' : 's'}`, 'success');
      }
    };

    if (navigator.onLine && !hasSyncedOnLoad.current) {
      hasSyncedOnLoad.current = true;
      void runSync();
    }

    const handleOnline = () => void runSync();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [notifyChange, showToast]);
}
