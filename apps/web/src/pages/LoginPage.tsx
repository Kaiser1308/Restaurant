import { getDefaultPathByRole, useAuth } from '@/features/auth'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Toast from '@/components/Toast'
import type { LoginRequest } from '@/types'
import { useState } from 'react'

export default function LoginPage() {
  const { login, isLoginLoading } = useAuth()
  const { t } = useTranslation('auth')
  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' })
  const [toastMessage, setToastMessage] = useState<string>(() => {
    const notice = sessionStorage.getItem('authNotice')
    if (notice) {
      sessionStorage.removeItem('authNotice')
      if (notice === '__SESSION_EXPIRED__') {
        return i18n.t('common:sessionExpired')
      }
      return notice
    }
    return ''
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedUsername = form.username.trim()
    const normalizedPassword = form.password.trim()

    if (!normalizedUsername || !normalizedPassword) {
      setToastMessage(t('actions.invalidCredentials'))
      return
    }

    try {
      const result = await login({
        username: normalizedUsername,
        password: normalizedPassword,
      })
      window.location.href = getDefaultPathByRole(result.user.role)
    } catch {
      setToastMessage(t('actions.loginFailed'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="text-center space-y-2">
            <span className="mx-auto inline-flex rounded-full border border-[#ffd3bf] bg-[#fff2eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
              {t('login.cashierDemo')}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">{t('login.restaurantPos')}</h1>
            <p className="font-medium text-[var(--color-on-surface-variant)]">{t('login.welcome')}</p>
          </div>

          <div className="space-y-4">
            <Input
              label={t('labels.username')}
              placeholder={t('login.usernamePlaceholder')}
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
            <Input
              label={t('labels.password')}
              type="password"
              placeholder={t('login.passwordMaskPlaceholder')}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button className="w-full" size="lg" type="submit" disabled={isLoginLoading}>
              {isLoginLoading ? t('actions.loggingIn') : t('actions.login')}
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1">{t('login.actions.qrScan')}</Button>
              <Button variant="ghost" className="flex-1">{t('login.actions.support')}</Button>
            </div>
          </div>
        </form>
      </Card>
      {toastMessage ? (
        <Toast
          message={toastMessage}
          variant="error"
          onClose={() => setToastMessage('')}
        />
      ) : null}
    </div>
  )
}
