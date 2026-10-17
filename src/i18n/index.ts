import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import uk from './uk.json'

void i18n.use(initReactI18next).init({
  resources: { uk: { translation: uk }, en: { translation: en } },
  lng: 'uk',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
})

// keep <html lang> in step, so screen readers and hyphenation follow the switch in the island
i18n.on('languageChanged', (lng) => document.documentElement.setAttribute('lang', lng))

export default i18n
