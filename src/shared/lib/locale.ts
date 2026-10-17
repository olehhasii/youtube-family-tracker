export type Language = 'uk' | 'en'

export const LOCALE: Record<Language, string> = { uk: 'uk', en: 'en-GB' } // en-GB writes "1 November", not "November 1"

export const toLanguage = (resolved: string | undefined): Language => (resolved === 'en' ? 'en' : 'uk')

/** A `YYYY-MM-DD` or `YYYY-MM` date as UTC midnight, so formatting with timeZone UTC never shifts it. */
export const utcDate = (date: string) => new Date(`${date.length === 7 ? `${date}-01` : date}T00:00:00Z`)
