import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Board } from '../../data/board'
import { useSaveGroup } from '../../data/hooks/use-members'
import { useToast } from '../../shared/toast/use-toast'
import { GroupForm } from './components/GroupForm'
import { Sheet } from './components/Sheet'

type Props = {
  open: boolean
  /** null until the Admin sets the Group up; its first save creates it. */
  group: Board['group']
  onClose: () => void
}

export function GroupSheet({ open, group, onClose }: Props) {
  const { t } = useTranslation()
  const save = useSaveGroup()
  const toast = useToast()

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const changes = {
      name: String(form.get('name')).trim(),
      monthly_price: Number(String(form.get('price')).replace(',', '.')), // phones in uk type a decimal comma
      currency: String(form.get('currency')),
    }
    onClose()
    try {
      await save.mutateAsync(changes)
      toast(t('group.saved'))
    } catch {
      toast(t('group.saveFailed'), { tone: 'error' })
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      {/* keyed by what is saved, so reopening after a save starts from the new values */}
      <GroupForm key={JSON.stringify(group)} group={group} onSubmit={(e) => void submit(e)} />
    </Sheet>
  )
}
