import { useId } from 'react'

// [cx, cy, r] of each puff of the cumulus
const PUFFS: [number, number, number][] = [
  [120, 230, 70], [200, 190, 90], [300, 160, 105], [400, 185, 85], [470, 225, 60],
  [250, 250, 80], [360, 255, 75], [170, 270, 55], [430, 270, 50], [300, 95, 70], [235, 120, 55],
]

/** The painted cloud behind the stage; the turbulence displacement roughens the circles into brush edges. */
export function Cloud({ className }: { className?: string }) {
  const paint = useId().replace(/[^\w-]/g, '') // React's ids hold characters that break url(#…)
  return (
    <svg viewBox="0 0 600 340" aria-hidden className={className}>
      <filter id={paint} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="22" />
      </filter>
      <g filter={`url(#${paint})`}>
        {PUFFS.map(([cx, cy, r], i) => (
          <circle key={`shade-${i}`} cx={cx} cy={cy + 14} r={r} fill="var(--cloud-shade)" />
        ))}
        {PUFFS.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx - 6} cy={cy - 4} r={r * 0.94} fill="var(--cloud)" />
        ))}
      </g>
    </svg>
  )
}
