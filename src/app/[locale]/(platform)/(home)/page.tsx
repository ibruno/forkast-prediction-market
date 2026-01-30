'use cache'

import type { Event } from '@/types'
import HomeClient from '@/app/[locale]/(platform)/(home)/_components/HomeClient'
import { routing } from '@/i18n/routing'
import { EventRepository } from '@/lib/db/queries/event'

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function HomePage(_: PageProps<'/[locale]'>) {
  let initialEvents: Event[] = []

  try {
    const { data: events, error } = await EventRepository.listEvents({
      tag: 'trending',
      search: '',
      userId: '',
      bookmarked: false,
    })

    if (error) {
      console.warn('Failed to fetch initial events for static generation:', error)
    }
    else {
      initialEvents = events ?? []
    }
  }
  catch {
    initialEvents = []
  }

  return (
    <main className="container grid gap-4 py-4">
      <HomeClient initialEvents={initialEvents} />
    </main>
  )
}
