import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { IconCode, IconInfo, IconKey } from '../../../shared/ui/icons'
import { BackButton } from './BackButton'

const REPO_URL = 'https://github.com/olehhasii/youtube-family-tracker'
const ICON_BUTTON = 'grid size-10 place-items-center rounded-full press-round hover-fine:bg-white/10'

type Props = {
  admin: boolean
  /** The state the menu was opened from; focus returns to the button that led there. */
  from: string | null
  onBack: () => void
  onAbout: () => void
  onSignIn: () => void
  onSignOut: () => void
}

export function MenuContent({ admin, from, onBack, onAbout, onSignIn, onSignOut }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <BackButton data-autofocus={from === 'rest' || undefined} onClick={onBack} />
      <IconButton data-autofocus={from === 'about' || undefined} label={t('island.about')} onClick={onAbout}>
        <IconInfo />
      </IconButton>
      <a href={REPO_URL} target="_blank" rel="noreferrer" aria-label={t('island.github')} title="GitHub" className={ICON_BUTTON}>
        <IconCode />
      </a>
      {admin ? (
        <IconButton label={t('island.signOut')} className={`${ICON_BUTTON} bg-island-blue`} onClick={onSignOut}>
          <IconKey />
        </IconButton>
      ) : (
        <IconButton data-autofocus={from === 'signIn' || undefined} label={t('island.signInAsAdmin')} onClick={onSignIn}>
          <IconKey />
        </IconButton>
      )}
    </>
  )
}

function IconButton({ label, children, ...rest }: ComponentProps<'button'> & { label: string }) {
  return (
    <button className={ICON_BUTTON} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  )
}
