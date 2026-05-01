export type TranslationKey = string
export type TranslationResources = Record<string, TranslationKey>

export interface TranslationNamespace {
  common: TranslationResources
  auth: TranslationResources
  tables: TranslationResources
  menu: TranslationResources
  orders: TranslationResources
  bills: TranslationResources
  audit: TranslationResources
  reports: TranslationResources
}
