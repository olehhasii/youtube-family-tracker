import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { toLanguage } from '../../../shared/lib/locale'
import { letterRoll } from '../../../shared/lib/motion'

export function LanguageButton() {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const roll = letterRoll(useReducedMotion())
  const code = lng === 'uk' ? 'UA' : 'EN'
  return (
    <button
      className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-[13px] font-semibold press-round"
      aria-label={t('island.switchLanguage', { current: code })} // starts with the visible letters, so voice control can say them
      onClick={() => void i18n.changeLanguage(lng === 'uk' ? 'en' : 'uk')}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={lng} {...roll} aria-hidden>
          {code}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
