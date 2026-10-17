import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardRow } from '../../../data/board'
import { Avatar } from '../../../shared/ui/Avatar'
import { IconPlus } from '../../../shared/ui/icons'
import { RADIUS, STATUS_COLOR_TRANSITION, layoutSpring, rowEntrance } from '../../../shared/lib/motion'
import type { StandingText } from '../../../shared/lib/describe-standing'
import { memberLayoutId } from '../helpers/layout-ids'
import { STATUS_COLOR } from '../../../shared/lib/status-colors'
import { StatusPill } from './StatusPill'

type Props = {
  row: BoardRow
  wording: StandingText
  index: number
  focusOnMount?: boolean
  onOpen: () => void
  onRecord?: () => void
}

// shares layout ids with DetailCard, so opening it grows the row into the card
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
