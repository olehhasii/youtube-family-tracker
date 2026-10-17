import type { UseQueryResult } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { Board } from '../../../data/board'
import { MemberList } from './MemberList'

type Props = { board: UseQueryResult<Board>; onRecord: (memberId: string) => void }

export function BoardBody({ board, onRecord }: Props) {
  const { t } = useTranslation()
  if (board.isPending) return <Message text={t('board.loading')} />
  if (board.isError) return <Message text={t('board.error')} />
  const { group, rows, today } = board.data
  if (!group || rows.length === 0) return <Message text={t('board.empty')} />
  return <MemberList rows={rows} today={today} onRecord={onRecord} />
}

function Message({ text }: { text: string }) {
  return <p className="px-1 py-6 text-center text-sm text-muted">{text}</p>
}
