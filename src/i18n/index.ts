import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import uk from './uk.json'

const STORAGE_KEY = 'language'

const saved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null // private mode or blocked storage: UA, as for a first visit
  }
}

// before init, so the language it starts in is applied too
i18n.on('languageChanged', (lng) => {
  // keep <html lang> in step, so screen readers and hyphenation follow the switch in the island
  document.documentElement.setAttribute('lang', lng)
  document.title = i18n.t('app.title')
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    // the choice lasts for this visit only
  }
})

void i18n.use(initReactI18next).init({
  resources: { uk: { translation: uk }, en: { translation: en } },
  lng: saved() === 'en' ? 'en' : 'uk',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
})

export default i18n
