// Language → Intl locale, shared by every piece of Board wording.
export type Language = 'uk' | 'en'

export const LOCALE: Record<Language, string> = { uk: 'uk', en: 'en-GB' } // en-GB writes "1 November", not "November 1"

/** The Board's language from i18next's resolved language; Ukrainian unless English was chosen. */
export const toLanguage = (resolved: string | undefined): Language => (resolved === 'en' ? 'en' : 'uk')

/** A `YYYY-MM-DD` or `YYYY-MM` date as UTC midnight, so formatting with timeZone UTC never shifts it. */
export const utcDate = (date: string) => new Date(`${date.length === 7 ? `${date}-01` : date}T00:00:00Z`)
