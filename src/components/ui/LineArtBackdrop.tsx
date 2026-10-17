/**
 * A subtle, fixed-position field of flowing line vectors behind page content.
 * Each host page's root element needs `relative isolate` (or just `isolate`)
 * so this -z-10 layer paints above that root's own background instead of
 * being hoisted into the document's root stacking context and hidden behind
 * it — see the walkthrough page for the bug this avoids.
 */
export function LineArtBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 420 900">
        <path
          d="M-30,110 C70,50 150,170 250,100 S450,30 530,90"
          fill="none"
          stroke="#1C1E21"
          strokeOpacity="0.05"
          strokeWidth="1.5"
        />
        <path
          d="M-40,340 C60,400 150,280 250,350 S450,420 520,350"
          fill="none"
          stroke="#D8FA36"
          strokeOpacity="0.14"
          strokeWidth="1.5"
        />
        <path
          d="M-30,620 C90,680 190,560 300,630 S480,700 530,630"
          fill="none"
          stroke="#C4EDEE"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
        <path
          d="M-20,830 C100,790 200,870 310,820 S470,780 540,830"
          fill="none"
          stroke="#1C1E21"
          strokeOpacity="0.04"
          strokeWidth="1.5"
        />
        <circle cx="370" cy="150" r="2" fill="#1C1E21" fillOpacity="0.08" />
        <circle cx="50" cy="560" r="2" fill="#1C1E21" fillOpacity="0.08" />
        <circle cx="330" cy="760" r="2" fill="#1C1E21" fillOpacity="0.06" />
      </svg>
    </div>
  );
}
