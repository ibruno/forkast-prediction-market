import AdminUsersTable from '@/app/[locale]/admin/(users)/_components/AdminUsersTable'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function AdminUsersPage(_: PageProps<'/[locale]/admin'>) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage user accounts and view user statistics.
        </p>
      </div>
      <div className="min-w-0">
        <AdminUsersTable />
      </div>
    </section>
  )
}
