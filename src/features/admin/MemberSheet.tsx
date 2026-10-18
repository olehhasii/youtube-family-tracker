import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardMember, BoardRow } from '../../data/board'
import { type MemberDraft, useDeleteMember, useSaveMember } from '../../data/hooks/use-members'
import type { Day } from '../../model/types'
import { useSettleToast, useToast } from '../../shared/toast/use-toast'
import { MemberForm } from './components/MemberForm'
import { Sheet } from './components/Sheet'

type Props = {
  /** The Member to edit, 'new' to add one, null closes the sheet. */
  target: BoardRow | 'new' | null
  /** Everyone on the Board, for a new Member's slug and place. */
  members: BoardMember[]
  today: Day
  onClose: () => void
}

export function MemberSheet({ target, members, today, onClose }: Props) {
  const { t } = useTranslation()
  // keep showing the form while the sheet slides away, after `target` is already null
  const [last, setLast] = useState(target)
  if (target && target !== last) setLast(target)

  const save = useSaveMember()
  const remove = useDeleteMember()
  const toast = useToast()
  const settleToast = useSettleToast()
  const row = last === 'new' ? null : last

  // the sheet goes at once and the island reports how it went, as when recording a Payment
  const afterSettling = async (write: () => Promise<void>) => {
    onClose()
    try {
      await settleToast() // a removal waiting on its undo toast must reach the database first
    } catch {
      return // it failed and said so
    }
    await write()
  }

  const onSave = (draft: MemberDraft) =>
    void afterSettling(async () => {
      try {
        const photoSaved = await save.mutateAsync({ member: row?.member ?? null, draft, others: members })
        if (photoSaved) toast(t(row ? 'member.saved' : 'member.added', { name: draft.name }))
        else toast(t('member.photoFailed', { name: draft.name }), { tone: 'error' })
      } catch {
        toast(t('member.saveFailed', { name: draft.name }), { tone: 'error' })
      }
    })

  const onDelete = () =>
    void afterSettling(async () => {
      if (!row) return
      const { name } = row.member
      try {
        await remove.mutateAsync(row.member)
        toast(t('member.deleted', { name }))
      } catch {
        toast(t('member.deleteFailed', { name }), { tone: 'error' })
      }
    })

  return (
    <Sheet open={target !== null} onClose={onClose}>
      {last && <MemberForm key={row?.member.id ?? 'new'} row={row} today={today} onSave={onSave} onDelete={onDelete} />}
    </Sheet>
  )
}
