import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useSaveReceiptImage } from '../data/hooks';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function ScanReceiptPage() {
  const { tripId = '' } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const saveReceiptImage = useSaveReceiptImage();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  };

  const usePhoto = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const receiptImagePath = await saveReceiptImage(file);
      navigate(`/trips/${tripId}/expenses/new`, {
        state: online ? { mode: 'scan', receiptImagePath } : { mode: 'manual', receiptImagePath, offlineCapture: true },
        replace: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-finly-ink flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3">
        <Button variant="icon" size="sm" onClick={() => navigate(-1)} aria-label="Back" className="!bg-white/10 !text-white">
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </Button>
        <h1 className="text-white font-bold font-display">Scan Receipt</h1>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        {previewUrl ? (
          <img src={previewUrl} alt="Captured receipt" className="max-h-[65vh] w-full object-contain rounded-2xl" />
        ) : (
          <div className="w-full aspect-[3/4] max-h-[65vh] border-2 border-dashed border-white/30 rounded-3xl flex flex-col items-center justify-center text-white/60 gap-3">
            <i className="fa-solid fa-receipt text-4xl" aria-hidden="true" />
            <p className="text-sm">Line up the receipt in frame</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-4">
        {previewUrl ? (
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth size="lg" onClick={retake} disabled={saving}>
              Retake
            </Button>
            <Button fullWidth size="lg" onClick={usePhoto} disabled={saving}>
              {saving ? 'Saving…' : 'Use Photo'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="icon"
              size="lg"
              onClick={() => libraryInputRef.current?.click()}
              aria-label="Choose from library"
              className="!bg-white/10 !text-white"
            >
              <i className="fa-regular fa-image" aria-hidden="true" />
            </Button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              aria-label="Capture photo"
              className="w-20 h-20 rounded-full bg-finly-lime border-4 border-white/80 active:scale-95 transition-transform"
            />
            <div className="w-11" />
          </div>
        )}
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input ref={libraryInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
