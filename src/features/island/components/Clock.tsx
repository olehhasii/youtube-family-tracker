import { useTranslation } from 'react-i18next'
import { LOCALE, toLanguage } from '../../../shared/lib/locale'
import { useMinute } from '../hooks/use-minute'

// Kyiv time, like "today" everywhere else on the Board (src/data/today.ts)
const TIME_ZONE = 'Europe/Kyiv'

export function Clock() {
  const { i18n } = useTranslation()
  const locale = LOCALE[toLanguage(i18n.resolvedLanguage)]
  const now = useMinute()
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }).format(now)
  const date = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE }).format(now)
  return (
    <time dateTime={now.toISOString()} className="min-w-0 leading-tight">
      <span className="block truncate text-[11px] text-island-fg/55">{date}</span>
      <span className="block font-display text-[15px] font-bold tabular-nums">{time}</span>
    </time>
  )
}
