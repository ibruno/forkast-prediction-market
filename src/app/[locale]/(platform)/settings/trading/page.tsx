import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SettingsTradingContent from '@/app/[locale]/(platform)/settings/_components/SettingsTradingContent'
import { routing } from '@/i18n/routing'
import { UserRepository } from '@/lib/db/queries/user'

export const metadata: Metadata = {
  title: 'Trading Settings',
}

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function TradingSettingsPage(_: PageProps<'/[locale]/settings/trading'>) {
  const user = await UserRepository.getCurrentUser({ disableCookieCache: true })
  if (!user) {
    notFound()
  }

  return (
    <section className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Market Order Type</h1>
        <p className="text-muted-foreground">
          Choose how your market orders are executed.
        </p>
      </div>

      <div className="mx-auto w-full max-w-2xl lg:mx-0">
        <SettingsTradingContent user={user} />
      </div>
    </section>
  )
}
