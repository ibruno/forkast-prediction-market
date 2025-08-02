'use client'

import type { FilterPill, EventCategory } from '@/types'
import { Search, Star } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getFilterPillsByCategory } from '@/lib/mockData'

interface FilterToolbarProps {
  activeCategory: EventCategory
  searchQuery: string
  onSearchChange: (query: string) => void
  showFavoritesOnly: boolean
  onToggleFavorites: () => void
}

export default function FilterToolbar({
  activeCategory,
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavorites,
}: FilterToolbarProps) {
  const [activePill, setActivePill] = useState('all')

  const filterPills = getFilterPillsByCategory(activeCategory)

  return (
    <div className="bg-background">
      <div className="container mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 md:px-6">
        <div className="relative w-48 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Favorites Filter Button */}
        <Button
          variant={showFavoritesOnly ? 'default' : 'ghost'}
          size="sm"
          onClick={onToggleFavorites}
          className={`h-8 w-8 p-0 ${
            showFavoritesOnly
              ? `
                bg-yellow-100 text-yellow-600
                hover:bg-yellow-200
                dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50
              `
              : 'text-muted-foreground hover:text-yellow-500'
          }`}
          title={showFavoritesOnly ? 'Mostrar todos' : 'Apenas favoritos'}
        >
          <Star
            className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`}
          />
        </Button>

        {/* Separator */}
        <div className="h-6 w-px flex-shrink-0 bg-border"></div>

        {/* Filter Pills */}
        <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
          {filterPills.map((pill: FilterPill) => (
            <Button
              key={pill.id}
              variant={activePill === pill.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActivePill(pill.id)}
              className="h-8 flex-shrink-0 whitespace-nowrap text-xs"
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
