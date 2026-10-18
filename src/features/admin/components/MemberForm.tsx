import { Drawer } from '@base-ui/react/drawer'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardRow } from '../../../data/board'
import type { MemberDraft } from '../../../data/hooks/use-members'
import { standing } from '../../../model/standing'
import { type Day, isDated } from '../../../model/types'
import { describePaymentMonths } from '../../../shared/lib/describe-payment'
import { toLanguage } from '../../../shared/lib/locale'
import { validationMessage } from '../../../shared/lib/validation'
import { ConfirmButton } from './ConfirmButton'
import { PhotoField } from './PhotoField'

type Props = {
  /** null for a new Member. */
  row: BoardRow | null
  today: Day
  onSave: (draft: MemberDraft) => void
  onDelete: () => void
}

export function MemberForm({ row, today, onSave, onDelete }: Props) {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const member = row?.member ?? null
  const [name, setName] = useState(member?.name ?? '')
  const [exempt, setExempt] = useState(member?.exempt ?? false)
  const [photo, setPhoto] = useState<Blob | null | undefined>(undefined)

  // turning Exempt off picks the old ledger back up, which may put the Member behind at once (ticket 05)
  const resume = row?.member.exempt && !exempt ? standing({ ...row.member, exempt: false }, row.payments, today) : null
  const resumeNote =
    resume &&
    (isDated(resume)
      ? t(resume.monthsBehind > 0 ? 'member.resumeBehind' : 'member.resumeOnTime', {
          month: describePaymentMonths({ firstMonth: resume.dueDate.slice(0, 7), months: 1 }, lng),
          name: name.trim() || member?.name,
          count: resume.monthsBehind,
        })
      : t('member.resumeFirst'))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave({ name: name.trim(), exempt, photo })
  }

  return (
    <Drawer.Content render={<form onSubmit={submit} />} className="flex flex-col gap-5">
      <Drawer.Title className="font-display text-lg font-bold tracking-[-0.02em]">
        {member ? t('member.titleEdit', { name: member.name }) : t('member.titleNew')}
      </Drawer.Title>

      <PhotoField memberId={member?.id ?? 'new'} name={name} currentUrl={member?.avatarUrl ?? null} photo={photo} onChange={setPhoto} />

      <label className="flex flex-col gap-1.5">
        <span className="px-1 text-sm text-muted">{t('member.name')}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          pattern=".*\S.*" // the database refuses a name of only spaces
          maxLength={40}
          autoComplete="off"
          {...validationMessage(t('validation.name'))}
          className="h-12 rounded-xl bg-fg/5 px-3.5 text-fg outline-none focus-visible:outline-2 focus-visible:outline-fg"
        />
      </label>

      <div>
        <label className="flex items-center justify-between gap-4 rounded-2xl bg-fg/5 p-3.5">
          <span>
            <span className="block font-medium">{t('member.exempt')}</span>
            <span className="block text-sm text-muted">{t('member.exemptHint')}</span>
          </span>
          <input type="checkbox" role="switch" checked={exempt} onChange={(e) => setExempt(e.target.checked)} className="peer sr-only" />
          <span
            aria-hidden
            className="relative h-7 w-12 shrink-0 rounded-full bg-fg/15 transition-colors duration-150 ease-out peer-checked:bg-exempt peer-focus-visible:outline-2 peer-focus-visible:outline-fg after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-card after:transition-transform after:duration-150 after:ease-out peer-checked:after:translate-x-5"
          />
        </label>
        {resumeNote && (
          <p className="mt-2 px-1 text-sm text-overdue" aria-live="polite">
            {resumeNote}
          </p>
        )}
      </div>

      <button type="submit" className="h-12 w-full rounded-full bg-primary font-semibold text-primary-fg press">
        {member ? t('member.save') : t('member.add')}
      </button>

      {row && (
        <ConfirmButton
          label={t('member.delete')}
          confirmLabel={
            row.payments.length
              ? t('member.confirmDelete', { name: row.member.name, count: row.payments.length })
              : t('member.confirmDeleteNoPayments', { name: row.member.name })
          }
          onConfirm={onDelete}
        />
      )}
    </Drawer.Content>
  )
}
