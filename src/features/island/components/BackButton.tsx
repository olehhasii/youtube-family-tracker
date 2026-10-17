import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { IconBack } from '../../../shared/ui/icons'

export function BackButton(props: ComponentProps<'button'>) {
  const { t } = useTranslation()
  return (
    <button className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-island-fg/10 pr-4 pl-3 press" {...props}>
      <IconBack /> {t('island.back')}
    </button>
  )
}
