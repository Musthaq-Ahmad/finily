const BLOB_PATH =
  'M39.9,-65.7C52.8,-59.1,65.5,-51.1,73.6,-39.5C81.7,-27.9,85.2,-13,84.3,1.5C83.4,16,78.1,32,68.6,44.6C59.1,57.2,45.4,66.4,30.8,71.6C16.2,76.8,0.7,78,-15.4,76.1C-31.5,74.2,-48.2,69.2,-59.9,58.8C-71.6,48.4,-78.3,32.6,-80.8,16.1C-83.3,-0.4,-81.6,-17.6,-74.6,-31.9C-67.6,-46.2,-55.3,-57.6,-41.5,-64.2C-27.7,-70.8,-13.9,-72.6,0.5,-73.5C14.8,-74.4,29.7,-74.3,39.9,-65.7Z';

const PALETTES = [
  ['#D8FA36', '#C4EDEE'],
  ['#C4EDEE', '#1C1E21'],
  ['#D8FA36', '#1C1E21'],
  ['#C4EDEE', '#D8FA36'],
] as const;

const ROTATIONS = [0, 90, 180, 270];

/** Two soft, blurred vector blobs bleeding off opposite corners, varied per `variant`. */
export function BlobBackdrop({ variant }: { variant: number }) {
  const [colorA, colorB] = PALETTES[variant % PALETTES.length];
  const rotationA = ROTATIONS[variant % ROTATIONS.length];
  const rotationB = ROTATIONS[(variant + 2) % ROTATIONS.length];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute -top-20 -right-20 w-72 h-72 opacity-25 blur-xl"
        style={{ transform: `rotate(${rotationA}deg)` }}
        viewBox="0 0 200 200"
      >
        <path fill={colorA} d={BLOB_PATH} transform="translate(100 100)" />
      </svg>
      <svg
        className="absolute -bottom-24 -left-16 w-64 h-64 opacity-[0.15] blur-xl"
        style={{ transform: `rotate(${rotationB}deg)` }}
        viewBox="0 0 200 200"
      >
        <path fill={colorB} d={BLOB_PATH} transform="translate(100 100)" />
      </svg>
    </div>
  );
}
