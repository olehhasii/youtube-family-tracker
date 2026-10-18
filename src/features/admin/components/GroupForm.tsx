import { Drawer } from '@base-ui/react/drawer'
import { type FormEvent, type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Board } from '../../../data/board'
import { validationMessage } from '../../../shared/lib/validation'

const CURRENCIES = ['UAH', 'USD', 'EUR']

export function GroupForm({ group, onSubmit }: { group: Board['group']; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const { t } = useTranslation()
  const [currency, setCurrency] = useState(group?.currency ?? 'UAH')
  const currencies = CURRENCIES.includes(currency) ? CURRENCIES : [...CURRENCIES, currency]

  return (
    <Drawer.Content render={<form onSubmit={onSubmit} />} className="flex flex-col gap-5">
      <Drawer.Title className="font-display text-lg font-bold tracking-[-0.02em]">{t('group.title')}</Drawer.Title>
      <Field label={t('group.name')}>
        <input name="name" defaultValue={group?.name} required pattern=".*\S.*" maxLength={60} autoComplete="off" {...validationMessage(t('validation.groupName'))} className={INPUT} />
      </Field>
      <div className="flex gap-3">
        <Field label={t('group.price')}>
          <input
            name="price"
            defaultValue={group?.monthlyPrice}
            required
            inputMode="decimal"
            pattern="\d+([.,]\d{1,2})?"
            autoComplete="off"
            {...validationMessage(t('validation.price'))}
            className={INPUT}
          />
        </Field>
        <Field label={t('group.currency')}>
          <select name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={INPUT}>
            {currencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
      <button type="submit" className="h-12 w-full rounded-full bg-primary font-semibold text-primary-fg press">
        {t('group.save')}
      </button>
    </Drawer.Content>
  )
}

const INPUT = 'h-12 w-full rounded-xl bg-fg/5 px-3.5 text-fg outline-none focus-visible:outline-2 focus-visible:outline-fg'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="px-1 text-sm text-muted">{label}</span>
      {children}
    </label>
  )
}
