import AdminCategoriesTable from '@/app/[locale]/admin/categories/_components/AdminCategoriesTable'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function AdminCategoriesPage(_: PageProps<'/[locale]/admin/categories'>) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Manage which tags appear as main categories and control their visibility across the site.
        </p>
      </div>
      <div className="min-w-0">
        <AdminCategoriesTable />
      </div>
    </section>
  )
}
