import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBar } from '../components/ui/AppBar';
import { Banner } from '../components/ui/Banner';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LineArtBackdrop } from '../components/ui/LineArtBackdrop';
import { useToast } from '../context/ToastContext';
import { useTrip, useTripExpenses } from '../data/hooks';
import { generateTripReport, sendTripReportEmail } from '../services/reportGeneration';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailReportPage() {
  const { tripId = '' } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { trip, loading: tripLoading } = useTrip(tripId);
  const { expenses, loading: expensesLoading } = useTripExpenses(tripId);

  const [generating, setGenerating] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState('');
  const hasGeneratedRef = useRef(false);
  const pdfUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!trip || expensesLoading || hasGeneratedRef.current) return;
    hasGeneratedRef.current = true;
    setGenerating(true);
    generateTripReport(trip, expenses)
      .then((draft) => {
        setSubject(draft.subject);
        setBody(draft.body);
      })
      .finally(() => setGenerating(false));

    // Lazy-loaded: jsPDF (and its canvas/DOM-purify deps) are only needed on
    // this page, so keep them out of the main bundle.
    import('../services/pdfReport').then(({ buildTripReportPdf }) => {
      const { blob, filename } = buildTripReportPdf(trip, expenses);
      const url = URL.createObjectURL(blob);
      pdfUrlRef.current = url;
      setPdfUrl(url);
      setPdfBlob(blob);
      setPdfFilename(filename);
    });
  }, [trip, expensesLoading, expenses]);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

  if (!tripLoading && !trip) {
    return (
      <div className="min-h-screen bg-finly-surface flex items-center justify-center px-6">
        <EmptyState
          icon="fa-solid fa-triangle-exclamation"
          title="Trip not found"
          action={<Button onClick={() => navigate('/')}>Back to trips</Button>}
        />
      </div>
    );
  }

  const addRecipient = () => {
    const email = recipientInput.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setRecipientError('Enter a valid email address.');
      return;
    }
    if (recipients.includes(email)) {
      setRecipientError('That address is already added.');
      return;
    }
    setRecipients((prev) => [...prev, email]);
    setRecipientInput('');
    setRecipientError(null);
  };

  const removeRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
  };

  const handleRecipientKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipient();
    }
  };

  const regenerate = () => {
    if (!trip) return;
    setGenerating(true);
    generateTripReport(trip, expenses)
      .then((draft) => {
        setSubject(draft.subject);
        setBody(draft.body);
      })
      .finally(() => setGenerating(false));
  };

  const canSend =
    recipients.length > 0 && subject.trim() !== '' && body.trim() !== '' && pdfBlob != null && !generating && !sending;

  const handleSend = async () => {
    if (!canSend || !pdfBlob) return;
    setSending(true);
    setSendError(null);
    try {
      await sendTripReportEmail({ to: recipients, subject, body, pdfBlob, pdfFilename });
      showToast(
        `Report sent to ${recipients.length} recipient${recipients.length === 1 ? '' : 's'} with PDF attached`,
        'success',
      );
      navigate(`/trips/${tripId}`);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send the report email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen bg-finly-surface pb-28">
      <LineArtBackdrop />
      <div className="max-w-[480px] mx-auto px-4">
        <AppBar title="Email Report" subtitle={trip?.name} onBack={() => navigate(-1)} />

        <div className="mb-4">
          <label className="block text-xs font-semibold text-finly-dark mb-1.5" htmlFor="recipient-input">
            To
          </label>
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {recipients.map((email) => (
                <span
                  key={email}
                  className="flex items-center gap-1.5 bg-finly-pill text-finly-dark text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeRecipient(email)}
                    aria-label={`Remove ${email}`}
                    className="text-finly-muted hover:text-finly-error"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              id="recipient-input"
              type="email"
              value={recipientInput}
              onChange={(e) => {
                setRecipientInput(e.target.value);
                setRecipientError(null);
              }}
              onKeyDown={handleRecipientKeyDown}
              placeholder="name@company.com"
              className="flex-1 rounded-2xl border border-finly-hairline bg-finly-cardBg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finly-lime"
            />
            <Button variant="ghost" onClick={addRecipient} disabled={!recipientInput.trim()}>
              Add
            </Button>
          </div>
          {recipientError && <p className="text-[11px] text-finly-error font-semibold mt-1.5">{recipientError}</p>}
        </div>

        {!generating && (
          <Banner
            tone="amber"
            icon="fa-solid fa-wand-magic-sparkles"
            title="Drafted by AI — review before sending"
            action={
              <button
                type="button"
                onClick={regenerate}
                className="text-xs font-bold text-finly-amber underline flex-shrink-0"
              >
                Regenerate
              </button>
            }
            className="mb-4"
          />
        )}

        {generating ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-finly-muted flex items-center gap-2">
              <i className="fa-solid fa-circle-notch animate-spin" aria-hidden="true" /> Drafting your report…
            </p>
            <div className="h-12 rounded-2xl bg-finly-pill animate-pulse" />
            <div className="h-40 rounded-2xl bg-finly-pill animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-finly-dark mb-1.5" htmlFor="report-subject">
                Subject
              </label>
              <input
                id="report-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl border border-finly-hairline bg-finly-cardBg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finly-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-finly-dark mb-1.5" htmlFor="report-body">
                Message
              </label>
              <textarea
                id="report-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full rounded-2xl border border-finly-hairline bg-finly-cardBg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-finly-lime resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-finly-dark mb-1.5">Attachment</label>
              {pdfUrl ? (
                <div className="rounded-2xl border border-finly-hairline bg-finly-cardBg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-finly-hairline">
                    <div className="w-8 h-8 rounded-lg bg-finly-errorBg text-finly-error flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                    </div>
                    <p className="text-xs font-semibold text-finly-dark truncate flex-1">{pdfFilename}</p>
                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-finly-dark underline flex-shrink-0">
                      Open
                    </a>
                  </div>
                  <iframe title="Expense report PDF preview" src={pdfUrl} className="w-full h-64 block" />
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-2xl border border-finly-hairline bg-finly-cardBg px-3 py-2.5">
                  <i className="fa-solid fa-circle-notch animate-spin text-finly-muted text-sm" aria-hidden="true" />
                  <p className="text-xs font-semibold text-finly-muted">Preparing PDF attachment…</p>
                </div>
              )}
            </div>

            {sendError && (
              <Banner tone="error" icon="fa-solid fa-circle-exclamation" title="Couldn't send the report" subtitle={sendError} />
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-finly-cardBg border-t border-finly-hairline px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="max-w-[480px] mx-auto">
          <Button fullWidth size="lg" onClick={handleSend} disabled={!canSend}>
            {sending ? 'Sending…' : recipients.length > 0 ? `Send Report (${recipients.length})` : 'Send Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
