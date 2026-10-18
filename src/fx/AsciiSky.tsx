import { SKY_INTRO_S } from '../shared/lib/motion'
import GradientASCII from './GradientASCII'
import { usePalette } from './use-palette'
import { usePortrait } from './use-portrait'

type Props = {
  onReady: () => void
  /** Whether it decodes in outwards from the centre (where the loader's glyphs sat), and when that starts. */
  intro: boolean
  play: boolean
}

/** The background: a glow of palette colours drawn as Tektur glyphs, scrambling under a mouse. Lazy-loaded by `Background`. */
export default function AsciiSky({ onReady, intro, play }: Props) {
  const palette = usePalette()
  const portrait = usePortrait()
  return (
    <GradientASCII
      onReady={onReady}
      shape="horizon"
      sunHeight={portrait ? palette.portrait.sunHeight : 0.58}
      colors={palette.ramp}
      glyphGain={palette.glyphGain}
      glyphLight={palette.glyphLight}
      characters=" ·:+*oO@"
      fontFamily='"Tektur Variable", ui-monospace, monospace'
      cellSize={16}
      density={0.8}
      glyphOpacity={0.9}
      glow={0.2}
      flicker={0.2}
      flow={0.5}
      speed={0.7}
      gradientOpacity={palette.fill}
      grain={0}
      dpr={1}
      intro={intro}
      introPlay={play}
      introFrom="centre"
      introSeconds={SKY_INTRO_S}
      clickEffect="none"
      mouseInteraction={window.matchMedia('(hover: hover) and (pointer: fine)').matches}
      calmSelector="[data-fx-calm]"
      calmStrength={portrait ? palette.portrait.calm : 0.75}
    />
  )
}
