import GradientASCII from './GradientASCII'
import { usePalette } from './use-palette'
import { usePortrait } from './use-portrait'

/** The background: a glow of palette colours drawn as Tektur glyphs, scrambling under a mouse. Lazy-loaded by `Background`. */
export default function AsciiSky({ onReady }: { onReady: () => void }) {
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
      intro={false}
      clickEffect="none"
      mouseInteraction={window.matchMedia('(hover: hover) and (pointer: fine)').matches}
      calmSelector="[data-fx-calm]"
      calmStrength={portrait ? palette.portrait.calm : 0.75}
    />
  )
}
