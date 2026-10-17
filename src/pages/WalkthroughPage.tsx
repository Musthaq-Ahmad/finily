import { useRef, useState, type TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlobBackdrop } from '../components/ui/BlobBackdrop';
import { Button } from '../components/ui/Button';

const WALKTHROUGH_SEEN_KEY = 'finly_seen_walkthrough';

interface Slide {
  icon: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'fa-solid fa-camera',
    title: 'Stop typing receipts by hand',
    description:
      "Snap a photo. Vendor, amount, date, and category land in the form before you've put your phone away.",
  },
  {
    icon: 'fa-solid fa-wand-magic-sparkles',
    title: 'AI drafts it. You stay in control.',
    description: "Every AI-filled field is marked, and anything it's unsure about gets flagged before it reaches your report.",
  },
  {
    icon: 'fa-solid fa-receipt',
    title: 'Every trip, perfectly organized',
    description: 'Expenses sort into categories on their own, with a running total that updates the moment you hit save.',
  },
  {
    icon: 'fa-solid fa-paper-plane',
    title: 'Submit in one tap, not one hour',
    description: 'Download a CSV, generate a polished PDF, or email finance directly — ready the second your trip ends.',
  },
];

export function WalkthroughPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isLast = index === SLIDES.length - 1;

  const finish = () => {
    localStorage.setItem(WALKTHROUGH_SEEN_KEY, 'true');
    navigate('/login');
  };

  const next = () => {
    if (isLast) finish();
    else setIndex((i) => i + 1);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -40 && !isLast) setIndex((i) => i + 1);
    if (delta > 40 && index > 0) setIndex((i) => i - 1);
    touchStartX.current = null;
  };

  const slide = SLIDES[index];

  return (
    <div className="relative isolate min-h-screen bg-finly-surface flex flex-col overflow-hidden">
      <BlobBackdrop variant={index} />

      <div className="flex justify-end px-5 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <button type="button" onClick={finish} className="text-sm font-semibold text-finly-muted">
          Skip
        </button>
      </div>

      <div
        className="flex-1 flex flex-col items-center justify-center px-8 text-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-20 h-20 rounded-3xl bg-finly-dark text-finly-lime flex items-center justify-center mb-8 text-3xl">
          <i className={slide.icon} aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold font-display text-finly-dark max-w-[280px]">{slide.title}</h1>
        <p className="text-sm text-finly-muted mt-3 max-w-[300px] leading-relaxed">{slide.description}</p>
      </div>

      <div className="flex items-center justify-center gap-2 pb-6">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-finly-dark' : 'w-1.5 bg-finly-pill'}`}
          />
        ))}
      </div>

      <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <Button fullWidth size="lg" onClick={next}>
          {isLast ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export function hasSeenWalkthrough(): boolean {
  return localStorage.getItem(WALKTHROUGH_SEEN_KEY) === 'true';
}
