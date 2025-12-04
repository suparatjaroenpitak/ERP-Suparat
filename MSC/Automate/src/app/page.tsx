import Link from "next/link";
import TemplateGenerator from "@/components/generator/TemplateGenerator";
import { HomeNav } from "@/components/layout";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <HomeNav />
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            Template Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Generate production-ready Next.js, React, and TailwindCSS templates
            from simple prompts
          </p>
        </header>
        
        <TemplateGenerator />
      </div>
    </main>
  );
}
