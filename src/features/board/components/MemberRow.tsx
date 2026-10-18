import { motion, useReducedMotion } from 'motion/react'
import { type CSSProperties, useEffect, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { BoardRow } from '../../../data/board'
import type { Status } from '../../../model/types'
import { Avatar } from '../../../shared/ui/Avatar'
import { IconPlus } from '../../../shared/ui/icons'
import { RADIUS, REVEAL, STATUS_COLOR_TRANSITION, layoutSpring, rowEntrance } from '../../../shared/lib/motion'
import type { StandingText } from '../../../shared/lib/describe-standing'
import { memberLayoutId } from '../helpers/layout-ids'
import { STATUS_COLOR } from '../../../shared/lib/status-colors'
import { AvatarRing } from './AvatarRing'
import { StatusPill } from './StatusPill'

type Props = {
  row: BoardRow
  wording: StandingText
  index: number
  /** Seconds the rows wait for the card on page load. */
  /** On page load the row follows the card in; afterwards it returns on its own. */
  pageLoad: boolean
  focusOnMount?: boolean
  onOpen: () => void
  onRecord?: () => void
}

const TINT: Record<Status, string> = {
  paid: 'status-tint',
  dueSoon: 'status-tint',
  exempt: 'status-tint',
  overdue: 'status-hatched',
  unknown: 'status-faded',
}

// shares layout ids with DetailCard, so opening it grows the row into the card
export function MemberRow({ row: { member, standing }, wording, index, pageLoad, focusOnMount = false, onOpen, onRecord }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const button = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (focusOnMount) button.current?.focus()
  }, [focusOnMount])

  return (
    <motion.li
      layoutId={memberLayoutId(member.id, '', reduce)}
      {...rowEntrance(reduce, index, pageLoad)}
      className={`flex items-center ${TINT[standing.status]}`}
      // inline so Motion can correct the radius during the layout animation
      style={{ borderRadius: RADIUS.row, '--tint': STATUS_COLOR[standing.status] } as CSSProperties}
    >
      <button ref={button} className="flex min-w-0 flex-1 items-center gap-3.5 rounded-[inherit] p-3.5 text-left press" onClick={onOpen}>
        <motion.div layoutId={memberLayoutId(member.id, '-avatar', reduce)} transition={layoutSpring} className="relative">
          <Avatar id={member.id} name={member.name} url={member.avatarUrl} size={46} />
          <AvatarRing status={standing.status} index={index} after={pageLoad ? REVEAL.rows : 0} />
        </motion.div>
        <div className="min-w-0 flex-1">
          {/* the pill shares the name's line so long Ukrainian pills never squeeze the dates; when both don't fit it wraps below the name instead of crushing it */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <motion.div layoutId={memberLayoutId(member.id, '-name', reduce)} transition={layoutSpring} className="w-fit max-w-full truncate text-[17px] font-medium">
              {member.name}
            </motion.div>
            <StatusPill status={standing.status} text={wording.pill} />
          </div>
          <div className="text-[13px] leading-snug text-muted">
            {wording.dueDate ? (
              <Trans i18nKey="standing.nextPayment" values={{ date: wording.dueDate }} components={{ strong: <strong className="font-bold text-fg" /> }} />
            ) : (
              wording.primary
            )}
          </div>
          {wording.relative && (
            <div className="text-[13px] leading-snug font-bold" style={{ color: STATUS_COLOR[standing.status], transition: STATUS_COLOR_TRANSITION }}>
              {wording.relative}
            </div>
          )}
        </div>
      </button>
      {onRecord && (
        <button
          className="mr-3.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-fg press-round"
          aria-label={t('admin.recordFor', { name: member.name })}
          onClick={onRecord}
        >
          <IconPlus />
        </button>
      )}
    </motion.li>
  )
}
