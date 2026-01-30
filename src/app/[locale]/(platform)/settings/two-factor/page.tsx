import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SettingsTwoFactorAuthContent from '@/app/[locale]/(platform)/settings/_components/SettingsTwoFactorAuthContent'
import { routing } from '@/i18n/routing'
import { UserRepository } from '@/lib/db/queries/user'

export const metadata: Metadata = {
  title: 'Two Factor Settings',
}

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function TwoFactorSettingsPage(_: PageProps<'/[locale]/settings/two-factor'>) {
  const user = await UserRepository.getCurrentUser({ disableCookieCache: true })
  if (!user) {
    notFound()
  }

  return (
    <section className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Two-Factor Authentication</h1>
        <p className="text-muted-foreground">
          Add an extra layer of security to your account.
        </p>
      </div>

      <div className="mx-auto w-full max-w-2xl lg:mx-0">
        <SettingsTwoFactorAuthContent user={user} />
      </div>
    </section>
  )
}
