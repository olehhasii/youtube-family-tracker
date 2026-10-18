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
 * The full-screen sky behind the page: its CSS fallback, and the ASCII effect over it where WebGL2 exists. Calls
 * `onReady` once the effect's first frame is drawn (straight away without WebGL2). Until the page is revealed the
 * effect appears at once; after that it is late, so it fades in over the fallback.
 */
export function Background({ revealed, onReady }: { revealed: boolean; onReady: () => void }) {
  const [webgl] = useState(supportsWebGl2)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    if (!webgl) onReady()
  }, [webgl, onReady])

  return (
    <>
      <div aria-hidden className="pointer-events-none screen-overhang sky-fallback" />
      {webgl && (
        <motion.div
          aria-hidden
          className="pointer-events-none screen-overhang"
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
      )}
    </>
  )
}
