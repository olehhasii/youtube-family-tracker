import { useTranslation } from 'react-i18next'
import type { Board } from '../../../data/board'
import { toLanguage } from '../../../shared/lib/locale'
import { IconDots } from '../../../shared/ui/icons'
import { StatusRing } from '../../../shared/ui/StatusRing'
import { describeHeadline } from '../../../shared/lib/describe-headline'
import { LanguageButton } from './LanguageButton'

type Props = {
  /** undefined while the Board loads or failed: then only the buttons show. */
  board: Board | undefined
  onOpenMenu: () => void
}

export function RestContent({ board, onOpenMenu }: Props) {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const paying = board?.rows.filter((r) => r.standing.status !== 'exempt') ?? []
  const headline = board && describeHeadline(paying.map((r) => ({ name: r.member.name, standing: r.standing })), lng)

  return (
    <>
      {board && headline && (
        <div className="flex min-w-0 items-center gap-2.5 pr-2 pl-0.5">
          <StatusRing
            statuses={paying.map((r) => ({ id: r.member.id, status: r.standing.status }))}
            size={38}
            stroke={4}
            label={t('board.ringLabel', { paidUp: board.summary.paidUp, paying: board.summary.paying })}
          />
          <div className="min-w-0 leading-tight">
            <p className="text-[11px] text-island-fg/55">{headline.label}</p>
            <p className="truncate font-medium">{headline.text}</p>
          </div>
        </div>
      )}
      <LanguageButton />
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
