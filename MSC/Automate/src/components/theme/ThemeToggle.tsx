"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  showLabel?: boolean;
  variant?: "icon" | "dropdown" | "buttons";
  className?: string;
}

export function ThemeToggle({ 
  showLabel = false, 
  variant = "icon",
  className = "" 
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  // Simple icon toggle
  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
        aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
        title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
      >
        {resolvedTheme === "light" ? (
          <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        )}
        {showLabel && (
          <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
            {resolvedTheme === "light" ? "Dark" : "Light"}
          </span>
        )}
      </button>
    );
  }

  // Button group
  if (variant === "buttons") {
    return (
      <div className={`inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-slate-100 dark:bg-slate-800 ${className}`}>
        <button
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === "light"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          aria-label="Light mode"
        >
          <Sun className="w-4 h-4" />
          {showLabel && <span>Light</span>}
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === "dark"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          aria-label="Dark mode"
        >
          <Moon className="w-4 h-4" />
          {showLabel && <span>Dark</span>}
        </button>
        <button
          onClick={() => setTheme("system")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === "system"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          aria-label="System mode"
        >
          <Monitor className="w-4 h-4" />
          {showLabel && <span>System</span>}
        </button>
      </div>
    );
  }

  // Dropdown
  return (
    <div className={`relative ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
        className="appearance-none pl-10 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {resolvedTheme === "light" ? (
          <Sun className="w-4 h-4 text-slate-500" />
        ) : (
          <Moon className="w-4 h-4 text-slate-400" />
        )}
      </div>
    </div>
  );
}
