"use client";

import { useRouter, usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { MarketCategory } from "@/types";
import { getMainCategories } from "@/lib/mockData";
import { useEffect, useState } from "react";

interface NavigationTabsProps {
  activeCategory: MarketCategory;
  onCategoryChange: (category: MarketCategory) => void;
}

export default function NavigationTabs({
  activeCategory,
  onCategoryChange,
}: NavigationTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [categories, setCategories] = useState<
    { id: MarketCategory; label: string }[]
  >([]);

  useEffect(() => {
    const loadCategories = async () => {
      const mainCategories = await getMainCategories();
      setCategories(mainCategories);
    };
    loadCategories();
  }, []);

  const handleCategoryClick = (category: MarketCategory) => {
    if (isHomePage) {
      // If on home page, use normal behavior
      onCategoryChange(category);
    } else {
      // If not on home page, navigate to home with selected category
      router.push(`/?category=${category}`);
    }
  };

  return (
    <nav className="bg-background sticky top-14 z-10 border-b">
      <div className="container flex gap-6 overflow-x-auto py-1 text-sm font-medium">
        {categories.map((category, index) => (
          <div key={category.id} className="flex items-center">
            <button
              onClick={() => handleCategoryClick(category.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap py-2 pb-1 border-b-2 transition-colors ${
                activeCategory === category.id
                  ? "text-foreground border-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {category.id === "trending" && <TrendingUp className="h-4 w-4" />}
              <span>{category.label}</span>
            </button>
            {/* Adiciona separador visual após "New" (índice 1) */}
            {index === 1 && <div className="ml-6 mr-0 h-4 w-px bg-border" />}
          </div>
        ))}
      </div>
    </nav>
  );
}
