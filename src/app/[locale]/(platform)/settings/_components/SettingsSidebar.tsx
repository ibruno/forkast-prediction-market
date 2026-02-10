'use client'

import type { Route } from 'next'
import { useExtracted } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link, usePathname } from '@/i18n/navigation'

interface MenuItem {
  id: string
  label: string
  href: Route
}

export default function SettingsSidebar() {
  const t = useExtracted()
  const pathname = usePathname()
  const menuItems: MenuItem[] = [
    { id: 'profile', label: t('Profile'), href: '/settings' as Route },
    { id: 'notifications', label: t('Notifications'), href: '/settings/notifications' as Route },
    { id: 'trading', label: t('Trading'), href: '/settings/trading' as Route },
    { id: 'affiliate', label: t('Affiliate'), href: '/settings/affiliate' as Route },
    { id: 'two-factor', label: t('Two-Factor Auth'), href: '/settings/two-factor' as Route },
  ]
  const activeItem = menuItems.find(item => pathname === item.href)
  const active = activeItem?.id ?? 'profile'

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <nav className="grid gap-1">
        {menuItems.map(item => (
          <Button
            key={item.id}
            type="button"
            variant={active === item.id ? 'outline' : 'ghost'}
            className="justify-start text-muted-foreground"
            asChild
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        ))}
      </nav>
    </aside>
  )
}
