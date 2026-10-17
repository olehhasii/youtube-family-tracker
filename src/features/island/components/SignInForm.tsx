import { type FormEvent, type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSignIn } from '../../../data/hooks/use-auth'

type Props = {
  onSignedIn: () => void
  back: ReactNode
}

export function SignInForm({ onSignedIn, back }: Props) {
  const { t } = useTranslation()
  const signIn = useSignIn()
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const password = form.elements.namedItem('password') as HTMLInputElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    setError(null)
    try {
      if (await signIn.mutateAsync({ email, password: password.value })) return onSignedIn()
      setError(t('island.wrongCredentials'))
    } catch {
      setError(t('island.signInFailed'))
    }
    password.value = ''
    password.focus()
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => void submit(e)}>
      <Field label={t('island.email')}>
        <input data-autofocus name="email" type="email" autoComplete="username" required className={INPUT} />
      </Field>
      <Field label={t('island.password')}>
        <input name="password" type="password" autoComplete="current-password" required className={INPUT} />
      </Field>
      {error && (
        <p role="alert" className="px-1 text-overdue">
          {error}
        </p>
      )}
      <div className="mt-1 flex items-center justify-between gap-2">
        {back}
        <button type="submit" disabled={signIn.isPending} className="h-10 rounded-full bg-white px-5 font-semibold text-black press disabled:opacity-50">
          {t('island.signIn')}
        </button>
      </div>
    </form>
  )
}

const INPUT = 'h-11 w-full rounded-xl bg-white/10 px-3 text-white outline-none focus-visible:outline-2 focus-visible:outline-white'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="px-1 text-[11px] text-white/50">{label}</span>
      {children}
    </label>
  )
}
