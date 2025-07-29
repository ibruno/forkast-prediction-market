"use client";

import { useState } from "react";
import { Search, Star } from "lucide-react";
import { MarketCategory, FilterPill } from "@/types";
import { getFilterPillsByCategory } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterToolbarProps {
  activeCategory: MarketCategory;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
}

export default function FilterToolbar({
  activeCategory,
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavorites,
}: FilterToolbarProps) {
  const [activePill, setActivePill] = useState("all");

  const filterPills = getFilterPillsByCategory(activeCategory);

  return (
    <div className="bg-background">
      <div className="container mx-auto flex items-center gap-4 py-2 px-4 md:px-6 max-w-6xl">
        <div className="relative w-48 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Favorites Filter Button */}
        <Button
          variant={showFavoritesOnly ? "default" : "ghost"}
          size="sm"
          onClick={onToggleFavorites}
          className={`w-8 h-8 p-0 ${
            showFavoritesOnly
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
              : "text-muted-foreground hover:text-yellow-500"
          }`}
          title={showFavoritesOnly ? "Mostrar todos" : "Apenas favoritos"}
        >
          <Star
            className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`}
          />
        </Button>

        {/* Separator */}
        <div className="w-px h-6 bg-border flex-shrink-0"></div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {filterPills.map((pill: FilterPill) => (
            <Button
              key={pill.id}
              variant={activePill === pill.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActivePill(pill.id)}
              className="h-8 text-xs whitespace-nowrap flex-shrink-0"
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
