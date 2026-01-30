import AdminCreateEventForm from '@/app/[locale]/admin/create-event/_components/AdminCreateEventForm'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function AdminCreateEventPage(_: PageProps<'/[locale]/admin/categories'>) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Create Event</h1>
        <p className="text-sm text-muted-foreground">
          Prepare event and market data using the latest admin layout before wiring backend integrations.
        </p>
      </div>
      <div className="min-w-0">
        <AdminCreateEventForm />
      </div>
    </section>
  )
}
