import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { Board } from '../../../data/board'
import { REVEAL, islandPop } from '../../../shared/lib/motion'
import { IconDots } from '../../../shared/ui/icons'
import { StatusRing } from '../../../shared/ui/StatusRing'
import { Clock } from './Clock'
import { LanguageButton } from './LanguageButton'
import { ThemeButton } from './ThemeButton'

type Props = {
  /** undefined while the Board loads or failed: then the ring is left out. */
  board: Board | undefined
  /** On page load the contents pop in one by one once the island has widened; coming back from the menu they don't. */
  intro: boolean
  onOpenMenu: () => void
}

export function RestContent({ board, intro, onOpenMenu }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const paying = board?.rows.filter((r) => r.standing.status !== 'exempt') ?? []
  const pop = (index: number) => (intro ? islandPop(reduce, index) : { initial: false as const })

  return (
    <>
      <motion.div {...pop(0)} className="flex min-w-0 items-center gap-2.5 pr-2 pl-0.5">
        {board && (
          <StatusRing
            statuses={paying.map((r) => ({ id: r.member.id, status: r.standing.status }))}
            size={38}
            stroke={4}
            label={t('board.ringLabel', { paidUp: board.summary.paidUp, paying: board.summary.paying })}
            after={intro ? REVEAL.islandContent : 0}
          />
        )}
        <Clock />
      </motion.div>
      <motion.div {...pop(1)} className="shrink-0">
        <LanguageButton />
      </motion.div>
      <motion.div {...pop(2)} className="shrink-0">
        <ThemeButton />
      </motion.div>
      <motion.button
        {...pop(3)}
        data-autofocus
        className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-fg press-round"
        aria-label={t('island.menu')}
        onClick={onOpenMenu}
      >
        <IconDots />
      </motion.button>
    </>
  )
}
