import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardRow } from '../../data'
import { Avatar } from '../../ui/Avatar'
import { RADIUS, STATUS_COLOR_TRANSITION, layoutSpring, rowEntrance } from '../../ui/motion'
import type { StandingText } from './describe-standing'
import { memberLayoutId } from './layout-ids'
import { STATUS_COLOR } from './status-colors'
import { StatusPill } from './StatusPill'

type Props = {
  row: BoardRow
  wording: StandingText
  index: number
  /** Take keyboard focus when shown, e.g. after this Member's card closes. */
  focusOnMount?: boolean
  onOpen: () => void
  /** Shown to the Admin for Paying Members: opens the record-payment sheet. */
  onRecord?: () => void
}

/** One Member on the Board. Shares layout ids with DetailCard, so opening it grows the row into the card. */
export function MemberRow({ row: { member, standing }, wording, index, focusOnMount = false, onOpen, onRecord }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const button = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (focusOnMount) button.current?.focus()
  }, [focusOnMount])

  return (
    <motion.li
      layoutId={memberLayoutId(member.id, '', reduce)}
      {...rowEntrance(reduce, index)}
      className="flex items-center bg-raised/60"
      style={{ borderRadius: RADIUS.row }} // inline so Motion can correct it during the layout animation
    >
      <button ref={button} className="flex min-w-0 flex-1 items-center gap-3 rounded-[inherit] p-3 text-left press" onClick={onOpen}>
        <motion.div layoutId={memberLayoutId(member.id, '-avatar', reduce)} transition={layoutSpring}>
          <Avatar id={member.id} name={member.name} url={member.avatarUrl} />
        </motion.div>
        <div className="min-w-0 flex-1">
          {/* the pill shares the name's line so long Ukrainian pills never squeeze the dates */}
          <div className="flex items-center justify-between gap-2">
            <motion.div layoutId={memberLayoutId(member.id, '-name', reduce)} transition={layoutSpring} className="w-fit truncate font-medium">
              {member.name}
            </motion.div>
            <StatusPill status={standing.status} text={wording.pill} />
          </div>
          <div className="text-[13px] leading-snug text-muted">{wording.primary}</div>
          {wording.relative && (
            <div className="text-[13px] leading-snug" style={{ color: STATUS_COLOR[standing.status], transition: STATUS_COLOR_TRANSITION }}>
              {wording.relative}
            </div>
          )}
        </div>
      </button>
      {onRecord && (
        <button
          className="mr-3 grid size-8 shrink-0 place-items-center rounded-full bg-fg/10 press-round"
          aria-label={t('admin.recordFor', { name: member.name })}
          onClick={onRecord}
        >
          <IconPlus />
        </button>
      )}
    </motion.li>
  )
}

const IconPlus = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
