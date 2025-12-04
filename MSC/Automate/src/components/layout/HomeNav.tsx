"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme";
import { AuthNav } from "@/components/auth";

export function HomeNav() {
  return (
    <div className="flex justify-between items-center mb-4">
      <nav className="flex items-center gap-4">
        <Link
          href="/marketplace"
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          Marketplace
        </Link>
        <Link
          href="/generate"
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Generate
        </Link>
        <Link
          href="/history"
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          History
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <AuthNav />
        <ThemeToggle variant="buttons" showLabel />
      </div>
    </div>
  );
}
