export function DiamondSvg({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 520" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="outfieldGrass" x1="200" y1="40" x2="200" y2="450" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3cab60" />
          <stop offset="1" stopColor="#146b34" />
        </linearGradient>
        <linearGradient id="infieldGrass" x1="200" y1="210" x2="200" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2f9550" />
          <stop offset="1" stopColor="#187a3c" />
        </linearGradient>
        <radialGradient id="dirtShine" cx="0.45" cy="0.35" r="0.75">
          <stop stopColor="#efd2a2" />
          <stop offset="1" stopColor="#b8884e" />
        </radialGradient>
      </defs>
      <rect width="400" height="520" rx="28" fill="#0c2e1c" />
      <path d="M200 448 L16 150 A 280 250 0 0 1 384 150 Z" fill="url(#outfieldGrass)" />
      <path d="M200 448 L34 164 A 248 220 0 0 1 366 164" stroke="#c6a15e" strokeWidth="14" />
      <path d="M200 448 L16 150" stroke="#f6f1e7" strokeWidth="2" />
      <path d="M200 448 L384 150" stroke="#f6f1e7" strokeWidth="2" />
      <path d="M200 424 L320 304 L200 184 L80 304 Z" fill="url(#dirtShine)" />
      <path d="M200 396 L292 304 L200 212 L108 304 Z" fill="url(#infieldGrass)" />
      <path d="M200 396 L292 304 L200 212 L108 304 Z" stroke="#f6f1e7" strokeWidth="2.5" />
      <ellipse cx="200" cy="338" rx="24" ry="13" fill="#c9a36b" />
      <circle cx="200" cy="334" r="3.5" fill="#f6f1e7" />
      <g fill="#f7f4ec">
        <polygon points="292,296 301,305 292,314 283,305" />
        <polygon points="200,204 209,213 200,222 191,213" />
        <polygon points="108,296 117,305 108,314 99,305" />
        <polygon points="200,396 211,407 211,420 189,420 189,407" />
      </g>
      <path d="M24 142 A 280 250 0 0 1 376 142" stroke="#071f12" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
