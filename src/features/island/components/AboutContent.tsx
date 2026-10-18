import { useTranslation } from 'react-i18next'
import { REPO_URL } from '../helpers/repo-url'

export function AboutContent() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2 leading-relaxed text-island-fg/80">
      <p>{t('island.aboutWhy')}</p>
      <p>{t('island.aboutWhat')}</p>
      <p>
        {t('island.aboutHow')}{' '}
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-medium text-island-fg underline underline-offset-2">
          GitHub
        </a>
        .
      </p>
    </div>
  )
}
