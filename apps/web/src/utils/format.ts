import { useTranslation } from 'react-i18next'

export function useLocaleFormat() {
  const { i18n } = useTranslation()
  const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US'

  return {
    formatMoney: (amount: number): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    },

    formatDateTime: (date: string | Date): string => {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(date))
    },

    formatDate: (date: string | Date): string => {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
      }).format(new Date(date))
    },

    formatTime: (date: string | Date): string => {
      return new Intl.DateTimeFormat(locale, {
        timeStyle: 'short',
      }).format(new Date(date))
    },
  }
}

export function formatMoney(amount: number, locale: 'vi' | 'en'): string {
  const intlLocale = locale === 'vi' ? 'vi-VN' : 'en-US'
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
