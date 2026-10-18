import type { UseQueryResult } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { Board } from '../../../data/board'
import { useAdmin } from '../../../data/hooks/use-auth'
import { MemberList } from './MemberList'

type Props = {
  board: UseQueryResult<Board>
  onRecord: (memberId: string) => void
  onEdit: (memberId: string) => void
  onAdd: () => void
}

export function BoardBody({ board, onRecord, onEdit, onAdd }: Props) {
  const { t } = useTranslation()
  const admin = useAdmin()
  if (board.isPending) return <Message text={t('board.loading')} />
  if (board.isError) return <Message text={t('board.error')} />
  const { group, rows, today } = board.data
  const list = <MemberList rows={rows} today={today} onRecord={onRecord} onEdit={onEdit} onAdd={onAdd} />
  if (group && rows.length > 0) return list
  return (
    <>
      <Message text={t('board.empty')} />
      {admin && list /* only the Add Member row, so the Admin can fill the Board */}
    </>
  )
}

function Message({ text }: { text: string }) {
  return <p className="px-1 py-6 text-center text-sm text-muted">{text}</p>
}
