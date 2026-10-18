import { motion } from 'motion/react'
import { Suspense, lazy, useEffect, useState } from 'react'
import { backgroundLateFade } from '../shared/lib/motion'

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
 * The full-screen effect behind the page. Calls `onReady` once its first frame is drawn (straight away without WebGL2,
 * where the CSS fallback in `index.css` is the background). Until the page is revealed it appears at once; after that
 * it is late, so it fades in over the fallback.
 */
export function Background({ revealed, onReady }: { revealed: boolean; onReady: () => void }) {
  const [webgl] = useState(supportsWebGl2)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    if (!webgl) onReady()
  }, [webgl, onReady])

  if (!webgl) return null
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: drawn ? 1 : 0 }}
      transition={revealed ? backgroundLateFade : { duration: 0 }}
    >
      <Suspense fallback={null}>
        <AsciiSky
          onReady={() => {
            setDrawn(true)
            onReady()
          }}
        />
      </Suspense>
    </motion.div>
  )
}
