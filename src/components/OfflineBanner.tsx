import { Banner } from './ui/Banner';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return <Banner tone="amber" icon="fa-solid fa-wifi" title="Offline — changes are saved on this device" className="mb-4" />;
}
