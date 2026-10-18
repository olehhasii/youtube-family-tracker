// Ukrainian national transliteration (Cabinet of Ministers resolution 55, 2010); a few Russian letters for names typed that way
const LETTERS: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia', ы: 'y', э: 'e', ё: 'io', ъ: '',
}
// at the start of a word these letters are written differently
const WORD_START: Record<string, string> = { є: 'ye', ї: 'yi', й: 'y', ю: 'yu', я: 'ya' }
const APOSTROPHES = /['’ʼ`]/g

function transliterate(word: string) {
  return [...word].map((ch, i) => (i === 0 && WORD_START[ch]) || (LETTERS[ch] ?? ch)).join('')
}

/** A Member's URL-safe id from their name, unique among `taken`. Made once, so it never changes with the name. */
export function memberSlug(name: string, taken: string[]): string {
  const base =
    name
      .toLowerCase()
      .replace(APOSTROPHES, '')
      .split(/\s+/)
      .map(transliterate)
      .join(' ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'member'
  let slug = base
  for (let n = 2; taken.includes(slug); n++) slug = `${base}-${n}`
  return slug
}
