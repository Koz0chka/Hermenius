import { createI18n } from 'vue-i18n'
import ru from './ru.json'
import en from './en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages: {
    ru,
    en,
  },
})

export default i18n
