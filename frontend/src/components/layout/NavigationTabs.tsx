'use client'

import type { MarketCategory } from '@/types'
import { TrendingUp } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getMainCategories } from '@/lib/mockData'

interface NavigationTabsProps {
  activeCategory: MarketCategory
  onCategoryChange: (category: MarketCategory) => void
}

export default function NavigationTabs({
  activeCategory,
  onCategoryChange,
}: NavigationTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const [categories, setCategories] = useState<
    { id: MarketCategory, label: string }[]
  >([])

  useEffect(() => {
    const loadCategories = async () => {
      const mainCategories = await getMainCategories()
      setCategories(mainCategories)
    }
    loadCategories()
  }, [])

  const handleCategoryClick = (category: MarketCategory) => {
    if (isHomePage) {
      // If on home page, use normal behavior
      onCategoryChange(category)
    }
    else {
      // If not on home page, navigate to home with selected category
      router.push(`/?category=${category}`)
    }
  }

  return (
    <nav className="sticky top-14 z-10 border-b bg-background">
      <div className="container flex gap-6 overflow-x-auto py-1 text-sm font-medium">
        {categories.map((category, index) => (
          <div key={category.id} className="flex items-center">
            <button
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 py-2 pb-1 transition-colors ${
                activeCategory === category.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {category.id === 'trending' && <TrendingUp className="h-4 w-4" />}
              <span>{category.label}</span>
            </button>
            {/* Adiciona separador visual após "New" (índice 1) */}
            {index === 1 && <div className="ml-6 mr-0 h-4 w-px bg-border" />}
          </div>
        ))}
      </div>
    </nav>
  )
}
