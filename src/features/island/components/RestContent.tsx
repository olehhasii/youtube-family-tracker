import { useTranslation } from 'react-i18next'
import type { Board } from '../../../data/board'
import { IconDots } from '../../../shared/ui/icons'
import { StatusRing } from '../../../shared/ui/StatusRing'
import { Clock } from './Clock'
import { LanguageButton } from './LanguageButton'
import { ThemeButton } from './ThemeButton'

type Props = {
  /** undefined while the Board loads or failed: then the ring is left out. */
  board: Board | undefined
  onOpenMenu: () => void
}

export function RestContent({ board, onOpenMenu }: Props) {
  const { t } = useTranslation()
  const paying = board?.rows.filter((r) => r.standing.status !== 'exempt') ?? []

  return (
    <>
      <div className="flex min-w-0 items-center gap-2.5 pr-2 pl-0.5">
        {board && (
          <StatusRing
            statuses={paying.map((r) => ({ id: r.member.id, status: r.standing.status }))}
            size={38}
            stroke={4}
            label={t('board.ringLabel', { paidUp: board.summary.paidUp, paying: board.summary.paying })}
          />
        )}
        <Clock />
      </div>
      <LanguageButton />
      <ThemeButton />
      <button
        data-autofocus
        className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-fg press-round"
        aria-label={t('island.menu')}
        onClick={onOpenMenu}
      >
        <IconDots />
      </button>
    </>
  )
}
