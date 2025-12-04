"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "template-generator-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  // Resolve the actual theme
  const resolveTheme = (themeValue: Theme): "light" | "dark" => {
    if (themeValue === "system") {
      return getSystemTheme();
    }
    return themeValue;
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setThemeState(savedTheme);
      setResolvedTheme(resolveTheme(savedTheme));
    } else {
      setResolvedTheme(resolveTheme("system"));
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    // Add new theme class
    root.classList.add(resolvedTheme);
    
    // Update color-scheme for native elements
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setResolvedTheme(resolveTheme(newTheme));
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
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

// Hook for getting theme-aware classes
export function useThemeClasses() {
  const { resolvedTheme } = useTheme();
  
  return {
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
    // Common theme-aware class combinations
    bg: resolvedTheme === "dark" ? "bg-slate-900" : "bg-white",
    bgAlt: resolvedTheme === "dark" ? "bg-slate-800" : "bg-slate-50",
    bgPage: resolvedTheme === "dark" ? "bg-slate-950" : "bg-slate-100",
    text: resolvedTheme === "dark" ? "text-white" : "text-slate-900",
    textMuted: resolvedTheme === "dark" ? "text-slate-400" : "text-slate-600",
    border: resolvedTheme === "dark" ? "border-slate-700" : "border-slate-200",
    card: resolvedTheme === "dark" 
      ? "bg-slate-800 border-slate-700" 
      : "bg-white border-slate-200",
    input: resolvedTheme === "dark"
      ? "bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400",
  };
}
