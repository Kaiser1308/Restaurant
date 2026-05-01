import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import viCommon from './locales/vi/common.json'
import viAuth from './locales/vi/auth.json'
import viTables from './locales/vi/tables.json'
import viMenu from './locales/vi/menu.json'
import viOrders from './locales/vi/orders.json'
import viBills from './locales/vi/bills.json'
import viAudit from './locales/vi/audit.json'
import viReports from './locales/vi/reports.json'

import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enTables from './locales/en/tables.json'
import enMenu from './locales/en/menu.json'
import enOrders from './locales/en/orders.json'
import enBills from './locales/en/bills.json'
import enAudit from './locales/en/audit.json'
import enReports from './locales/en/reports.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    load: 'languageOnly',
    debug: false,
    interpolation: { escapeValue: false },
    ns: ['common', 'auth', 'tables', 'menu', 'orders', 'bills', 'audit', 'reports'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'restaurant_lang',
    },
    resources: {
      vi: {
        common: viCommon,
        auth: viAuth,
        tables: viTables,
        menu: viMenu,
        orders: viOrders,
        bills: viBills,
        audit: viAudit,
        reports: viReports,
      },
      en: {
        common: enCommon,
        auth: enAuth,
        tables: enTables,
        menu: enMenu,
        orders: enOrders,
        bills: enBills,
        audit: enAudit,
        reports: enReports,
      },
    },
  })

export default i18n
