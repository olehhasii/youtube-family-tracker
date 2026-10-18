import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { letterRoll } from '../../../shared/lib/motion'
import { IconMoon, IconSun } from '../../../shared/ui/icons'
import { setTheme } from '../helpers/theme'
import { useTheme } from '../hooks/use-theme'

export function ThemeButton() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const theme = useTheme()
  const roll = letterRoll(reduce)
  return (
    <button
      className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-island-fg/10 press-round"
      aria-label={t(theme === 'dark' ? 'island.switchToLight' : 'island.switchToDark')}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark', !!reduce)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={theme} {...roll} aria-hidden>
          {theme === 'dark' ? <IconMoon /> : <IconSun />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
