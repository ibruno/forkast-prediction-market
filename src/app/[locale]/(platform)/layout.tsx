import { Suspense } from 'react'
import AffiliateQueryHandler from '@/app/[locale]/(platform)/_components/AffiliateQueryHandler'
import Header from '@/app/[locale]/(platform)/_components/Header'
import NavigationTabs from '@/app/[locale]/(platform)/_components/NavigationTabs'
import { FilterProvider } from '@/app/[locale]/(platform)/_providers/FilterProvider'
import { TradingOnboardingProvider } from '@/app/[locale]/(platform)/_providers/TradingOnboardingProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { routing } from '@/i18n/routing'
import { AppProviders } from '@/providers/AppProviders'

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function PlatformLayout({ params, children }: LayoutProps<'/[locale]'>) {
  const { locale } = await params

  return (
    <AppProviders>
      <TradingOnboardingProvider>
        <FilterProvider>
          <Header locale={locale} />
          <Suspense fallback={(
            <div className="container">
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          )}
          >
            <NavigationTabs />
          </Suspense>
          {children}
          <AffiliateQueryHandler />
        </FilterProvider>
      </TradingOnboardingProvider>
    </AppProviders>
  )
}
