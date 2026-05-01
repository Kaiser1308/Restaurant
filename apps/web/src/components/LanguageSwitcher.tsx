import { useTranslation } from 'react-i18next'

const SUPPORTED_LANGUAGES = ['vi', 'en'] as const
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

const LANGUAGE_OPTIONS: Record<SupportedLanguage, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
}

const isSupportedLanguage = (value: string): value is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')
  const resolved = i18n.resolvedLanguage?.split('-')[0] ?? 'vi'
  const currentLang: SupportedLanguage = isSupportedLanguage(resolved) ? resolved : 'vi'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value
    if (isSupportedLanguage(newLang)) {
      i18n.changeLanguage(newLang)
    }
  }

  return (
    <>
      <label htmlFor="language-switcher" className="sr-only">
        {t('accessibility.changeLanguage')}
      </label>
      <select
        id="language-switcher"
        value={currentLang}
        onChange={handleChange}
        aria-label={t('accessibility.changeLanguage')}
        className="rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-3 py-1.5 text-sm font-semibold text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang} value={lang}>
            {LANGUAGE_OPTIONS[lang]}
          </option>
        ))}
      </select>
    </>
  )
}
