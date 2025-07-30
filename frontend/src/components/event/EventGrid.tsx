"use client";

import { useState, useEffect } from "react";
import { MarketCategory, Market } from "@/types";
import { getAllMarkets } from "@/lib/mockData";
import EventCard from "./EventCard";
import { Search, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventGridProps {
  activeCategory: MarketCategory;
  searchQuery: string;
  showFavoritesOnly: boolean;
  favoriteMarkets: Set<string>;
  onToggleFavorite: (eventId: string) => void;
}

export default function EventGrid({
  activeCategory,
  searchQuery,
  showFavoritesOnly,
  favoriteMarkets,
  onToggleFavorite,
}: EventGridProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [events, setEvents] = useState<Market[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      const allEvents = await getAllMarkets(activeCategory);
      setEvents(allEvents);
      setIsLoading(false);
    };
    loadEvents();
  }, [activeCategory]);

  // Filter events based on category and search
  const filteredEvents = events
    .filter((event: Market) => {
      const matchesCategory =
        activeCategory === "trending"
          ? true // Show all markets for trending, will be sorted by volume
          : activeCategory === "new"
          ? true // For now, show all as "new"
          : event.category === activeCategory;

      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesFavorites =
        !showFavoritesOnly || favoriteMarkets.has(event.id);

      return matchesCategory && matchesSearch && matchesFavorites;
    })
    .sort((a: Market, b: Market) => {
      // Sort by volume descending when trending category is active
      if (activeCategory === "trending") {
        return b.volume - a.volume;
      }
      // Default sort (keep original order for other categories)
      return 0;
    });

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-3 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </main>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-3 max-w-6xl">
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2 flex justify-center">
            {searchQuery ? (
              <Search className="h-6 w-6" />
            ) : (
              <BarChart3 className="h-6 w-6" />
            )}
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? "No events found" : "No events available"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {searchQuery ? (
              <>Try adjusting your search for &ldquo;{searchQuery}&rdquo;</>
            ) : (
              <>
                There are no events in the {activeCategory} category with these
                filters
              </>
            )}
          </p>

          {/* Simple home button */}
          <Button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-3 max-w-6xl">
      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEvents.map((event: Market) => (
          <EventCard
            key={event.id}
            event={event}
            isOpen={openCardId === event.id}
            onToggle={(isOpen) => setOpenCardId(isOpen ? event.id : null)}
            isFavorited={favoriteMarkets.has(event.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </main>
  );
}

function EventCardSkeleton() {
  return (
    <div className="rounded-lg bg-card border p-4 min-h-[170px] animate-pulse">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-8 h-8 rounded bg-muted"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="w-8 h-5 bg-muted rounded"></div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 mb-3">
        <div className="h-8 bg-muted rounded"></div>
        <div className="h-8 bg-muted rounded"></div>
      </div>

      <div className="flex justify-between items-center">
        <div className="h-3 bg-muted rounded w-16"></div>
        <div className="h-3 bg-muted rounded w-6"></div>
      </div>
    </div>
  );
}
