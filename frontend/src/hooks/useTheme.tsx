"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  actualTheme: "dark" | "light"; // The actual resolved theme
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [actualTheme, setActualTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    // Check for saved theme preference or default to system
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (
      savedTheme &&
      (savedTheme === "dark" ||
        savedTheme === "light" ||
        savedTheme === "system")
    ) {
      setTheme(savedTheme);
    } else {
      setTheme("system");
    }
  }, []);

  useEffect(() => {
    const updateActualTheme = () => {
      let resolvedTheme: "dark" | "light" = "light";

      if (theme === "system") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
      } else {
        resolvedTheme = theme as "dark" | "light";
      }

      setActualTheme(resolvedTheme);

      // Apply theme to html element
      const root = window.document.documentElement;
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Save theme preference
      localStorage.setItem("theme", theme);
    };

    updateActualTheme();

    // Listen for system theme changes only if theme is "system"
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateActualTheme();

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light"; // system -> light
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, actualTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
