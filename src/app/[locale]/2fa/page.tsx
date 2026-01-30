import TwoFactorClient from '@/app/[locale]/2fa/_components/TwoFactorClient'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function TwoFactorPage({ searchParams }: PageProps<'/[locale]/2fa'>) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const nextValue = resolvedSearchParams?.next
  const next = Array.isArray(nextValue) ? nextValue[0] : nextValue

  return <TwoFactorClient next={next} />
}
