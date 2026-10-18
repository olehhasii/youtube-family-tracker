import { motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePalette } from '../../../fx/use-palette'
import { viewExit } from '../../../shared/lib/motion'
import { GROUP_NAME_LAYOUT_ID, GROUP_NAME_TYPE, ON_SKY_SHADOW } from '../helpers/group-name'
import { GLYPHS, useGlyphDecode } from '../hooks/use-glyph-decode'

const IDLE_LENGTH = 9

const density = (glyph: string) => GLYPHS.indexOf(glyph) / (GLYPHS.length - 1)

// as in the sky: denser glyphs take colours further along the ramp, read brighter, and are lit by the palette's glyph light
const glyphStyle = (glyph: string, ramp: string[], light: number) => ({
  color: ramp[Math.round(density(glyph) * (ramp.length - 1))],
  opacity: 0.3 + 0.7 * density(glyph),
  filter: `brightness(${light})`,
})

type Props = {
  /** undefined while the page waits; then the Group name to decode into, or null when there is none. */
  name: string | null | undefined
  onDone: () => void
}

/**
 * The page-load moment's first beat: the sky's glyphs scrambling at the centre, which resolve into the Group name once the
 * page may appear. Unmounting it hands the name to the stage's heading (shared layout id); with no name it fades out.
 */
export function Loader({ name, onDone }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const palette = usePalette()
  const tint = (glyph: string) => glyphStyle(glyph, palette.ramp, palette.glyphLight)
  const { glyphs, resolved, done } = useGlyphDecode(name, !!reduce)
  const leaving = done && name === null
  useEffect(() => {
    if (done && name !== null) onDone()
  }, [done, name, onDone])

  return (
    <div role="status" className="pointer-events-none fixed inset-0 grid place-items-center px-6">
      <span className="sr-only">{t('board.loading')}</span>
      <motion.p
        aria-hidden
        layoutId={name && !reduce ? GROUP_NAME_LAYOUT_ID : undefined}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={viewExit}
        onAnimationComplete={() => leaving && onDone()}
        className={`max-w-full text-center text-on-sky ${GROUP_NAME_TYPE} ${ON_SKY_SHADOW}`}
      >
        {typeof name === 'string'
          ? [...name].map((letter, i) =>
              i < resolved || letter === ' ' ? (
                <span key={i}>{letter}</span>
              ) : (
                // the hidden letter holds the name's real width, so nothing shifts as the glyphs resolve
                <span key={i} className="relative">
                  <span className="invisible">{letter}</span>
                  <span className="absolute inset-0 text-center" style={tint(glyphs[i])}>
                    {glyphs[i]}
                  </span>
                </span>
              ),
            )
          : glyphs.slice(0, IDLE_LENGTH).map((glyph, i) => (
              <span key={i} className="inline-block w-[0.7em]" style={tint(glyph)}>
                {glyph}
              </span>
            ))}
      </motion.p>
    </div>
  )
}
