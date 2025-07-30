"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MarketCategory } from "@/types";
import Header from "@/components/layout/Header";
import NavigationTabs from "@/components/layout/NavigationTabs";
import FilterToolbar from "@/components/layout/FilterToolbar";
import EventGrid from "@/components/event/EventGrid";

function HomePageContent() {
  const searchParams = useSearchParams();
  const categoryFromURL = searchParams?.get("category");

  const [activeCategory, setActiveCategory] = useState<MarketCategory>(
    (categoryFromURL as MarketCategory) || "trending"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteMarkets, setFavoriteMarkets] = useState<Set<string>>(
    new Set()
  );

  // Update category when URL params change
  useEffect(() => {
    if (categoryFromURL) {
      setActiveCategory(categoryFromURL as MarketCategory);
    }
  }, [categoryFromURL]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME!.toLowerCase();
    const stored = localStorage.getItem(`${siteName}-favorites`);
    if (stored) {
      try {
        const favArray = JSON.parse(stored);
        setFavoriteMarkets(new Set(favArray));
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME!.toLowerCase();
    localStorage.setItem(
      `${siteName}-favorites`,
      JSON.stringify(Array.from(favoriteMarkets))
    );
  }, [favoriteMarkets]);

  const handleToggleFavorite = (eventId: string) => {
    setFavoriteMarkets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleToggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header />

      {/* Navigation Tabs */}
      <NavigationTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Filter Toolbar */}
      <FilterToolbar
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={handleToggleFavoritesFilter}
      />

      {/* Main Content */}
      <EventGrid
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        showFavoritesOnly={showFavoritesOnly}
        favoriteMarkets={favoriteMarkets}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
