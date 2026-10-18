import { motion, useReducedMotion } from 'motion/react'
import { Suspense, lazy, useEffect, useState } from 'react'
import { backgroundLateFade, reducedReveal, skyIntro } from '../shared/lib/motion'

const AsciiSky = lazy(() => import('./AsciiSky'))

const supportsWebGl2 = () => {
  if (!('WebGL2RenderingContext' in window)) return false
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

/**
 * The full-screen sky behind the page: its CSS fallback, and the ASCII effect over it where WebGL2 exists. Calls
 * `onReady` once the effect's first frame is drawn (straight away without WebGL2). Until the page is revealed the sky
 * is empty; then the effect decodes in from the centre as the fallback fades in under it. An effect drawn after that is
 * late, so it fades in over the fallback.
 */
export function Background({ revealed, onReady }: { revealed: boolean; onReady: () => void }) {
  const reduce = useReducedMotion()
  const [webgl] = useState(supportsWebGl2)
  const [drawn, setDrawn] = useState<'early' | 'late' | null>(null)
  useEffect(() => {
    if (!webgl) onReady()
  }, [webgl, onReady])

  return (
    <div aria-hidden className="pointer-events-none sky-layer">
      <motion.div
        className="absolute inset-0 sky-fallback edge-fade"
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : undefined}
        transition={reduce ? reducedReveal : skyIntro}
      />
      {webgl && (
        <motion.div
          className="absolute inset-0 edge-fade"
          initial={{ opacity: 0 }}
          // the effect grows in by itself, but under reduced motion it starts whole, so it fades in with the page
          animate={{ opacity: drawn && (revealed || !reduce) ? 1 : 0 }}
          transition={drawn === 'late' ? backgroundLateFade : reduce ? reducedReveal : { duration: 0 }}
        >
          <Suspense fallback={null}>
            <AsciiSky
              // one that arrives late skips its intro and fades in instead
              intro={!revealed || !!drawn}
              play={revealed}
              onReady={() => {
                setDrawn(revealed ? 'late' : 'early')
                onReady()
              }}
            />
          </Suspense>
        </motion.div>
      )}
    </div>
  )
}
