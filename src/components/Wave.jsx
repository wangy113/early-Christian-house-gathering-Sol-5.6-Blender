/** Decorative wavy divider between sections (Groovy style). */
export function Wave({ flip = false }) {
  return (
    <svg className={flip ? 'wave wave-flip' : 'wave'} viewBox={'0 0 1440 60'} preserveAspectRatio={'none'} aria-hidden={'true'} focusable={'false'}>
      <path d={'M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z'} />
    </svg>
  )
}
