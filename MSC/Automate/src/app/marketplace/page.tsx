"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Store,
  Search,
  Heart,
  Download,
  Eye,
  Sparkles,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  X,
  Loader2,
  ExternalLink,
  Check,
  Moon,
  Sun,
  Smartphone,
  Zap,
  LayoutDashboard,
  Rocket,
  ShoppingCart,
  FileText,
  Briefcase,
  Settings,
  Megaphone,
  Cloud,
  ClipboardList,
  Table,
  Menu,
  CreditCard,
  Maximize2,
  BarChart3,
  Lock,
  DollarSign,
  Quote,
  Star,
  ArrowDown,
  Package,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme";
import { MarketplaceTemplate, TemplateCategory, CATEGORY_INFO } from "@/types/marketplace";

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Rocket,
  ShoppingCart,
  FileText,
  Briefcase,
  Settings,
  Megaphone,
  Cloud,
  ClipboardList,
  Table,
  Menu,
  CreditCard,
  Maximize2,
  BarChart3,
  Lock,
  DollarSign,
  Quote,
  Zap,
  Star,
  ArrowDown,
  Package,
};

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "mostDownloaded", label: "Most Downloaded" },
  { value: "mostLiked", label: "Most Liked" },
];

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Liked templates (local state for demo)
  const [likedTemplates, setLikedTemplates] = useState<Set<string>>(new Set());
  
  // Category counts
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (searchQuery) params.set("search", searchQuery);
      params.set("sort", sortBy);
      params.set("page", page.toString());
      params.set("limit", "12");

      const response = await fetch(`/api/marketplace?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load templates");
      }

      setTemplates(data.templates);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
      setCategoryCounts(data.categoryCounts || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, page]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const handleLike = async (slug: string) => {
    const isLiked = likedTemplates.has(slug);
    
    // Optimistic update
    setLikedTemplates(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });

    // Update template likes locally
    setTemplates(prev => prev.map(t => {
      if (t.slug === slug) {
        return { ...t, likes: isLiked ? t.likes - 1 : t.likes + 1 };
      }
      return t;
    }));

    // Call API (in real app, this would persist)
    try {
      await fetch(`/api/marketplace/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isLiked ? "unlike" : "like" }),
      });
    } catch (err) {
      // Revert on error
      setLikedTemplates(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(slug);
        } else {
          newSet.delete(slug);
        }
        return newSet;
      });
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = CATEGORY_ICONS[iconName];
    return IconComponent || Package;
  };

  const categories = Object.entries(CATEGORY_INFO) as [TemplateCategory, typeof CATEGORY_INFO[TemplateCategory]][];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                    Template Marketplace
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {total} templates available
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle variant="icon" />
              <Link
                href="/generate"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Generate New
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white cursor-pointer min-w-[180px]"
                title="Sort templates"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 ${viewMode === "grid" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                title="Grid view"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 ${viewMode === "list" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Category Pills */}
          <div className={`flex flex-wrap gap-2 ${showFilters ? "block" : "hidden md:flex"}`}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              All Templates
            </button>
            {categories.map(([key, info]) => {
              const IconComponent = getCategoryIcon(info.icon);
              const count = categoryCounts[key] || 0;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? "bg-purple-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {info.label}
                  {count > 0 && (
                    <span className={`text-xs ${selectedCategory === key ? "text-purple-200" : "text-slate-400"}`}>
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory || searchQuery) && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                {CATEGORY_INFO[selectedCategory].label}
                <button onClick={() => setSelectedCategory(null)} title="Remove filter" className="hover:text-purple-900 dark:hover:text-purple-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} title="Remove filter" className="hover:text-blue-900 dark:hover:text-blue-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery("");
              }}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading templates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchTemplates}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && templates.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              No templates found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {!isLoading && !error && templates.length > 0 && (
          <>
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {templates.map((template) => (
                <TemplateCard
                  key={template.slug}
                  template={template}
                  viewMode={viewMode}
                  isLiked={likedTemplates.has(template.slug)}
                  onLike={() => handleLike(template.slug)}
                  formatNumber={formatNumber}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? "bg-purple-600 text-white"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: MarketplaceTemplate;
  viewMode: "grid" | "list";
  isLiked: boolean;
  onLike: () => void;
  formatNumber: (num: number) => string;
}

function TemplateCard({ template, viewMode, isLiked, onLike, formatNumber }: TemplateCardProps) {
  const categoryInfo = CATEGORY_INFO[template.category];
  
  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all">
        <div className="flex items-center gap-4">
          {/* Preview placeholder */}
          <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center">
            <Package className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white truncate">
                  {template.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {template.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/30 text-${categoryInfo.color}-700 dark:text-${categoryInfo.color}-400`}>
                  {categoryInfo.label}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  {formatNumber(template.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {formatNumber(template.downloads)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(template.views)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {template.responsive && <span title="Responsive"><Smartphone className="w-4 h-4 text-green-500" /></span>}
                {template.darkMode && <span title="Dark mode"><Moon className="w-4 h-4 text-purple-500" /></span>}
                {template.animated && <span title="Animated"><Zap className="w-4 h-4 text-yellow-500" /></span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              href={`/preview/${template.slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
            <button
              onClick={onLike}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                isLiked
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "Liked" : "Like"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all">
      {/* Preview Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-16 h-16 text-slate-300 dark:text-slate-500" />
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            href={`/preview/${template.slug}`}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Link>
          <button
            onClick={onLike}
            title={isLiked ? "Unlike" : "Like"}
            className={`p-2 rounded-lg transition-colors ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 backdrop-blur-sm">
            {categoryInfo.label}
          </span>
        </div>

        {/* Feature badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {template.responsive && (
            <span className="p-1 bg-white/90 dark:bg-slate-800/90 rounded-full backdrop-blur-sm" title="Responsive">
              <Smartphone className="w-3 h-3 text-green-600 dark:text-green-400" />
            </span>
          )}
          {template.darkMode && (
            <span className="p-1 bg-white/90 dark:bg-slate-800/90 rounded-full backdrop-blur-sm" title="Dark Mode">
              <Moon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            </span>
          )}
          {template.animated && (
            <span className="p-1 bg-white/90 dark:bg-slate-800/90 rounded-full backdrop-blur-sm" title="Animated">
              <Zap className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white truncate mb-1">
          {template.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-slate-400">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1" title="Likes">
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              {formatNumber(template.likes)}
            </span>
            <span className="flex items-center gap-1" title="Downloads">
              <Download className="w-4 h-4" />
              {formatNumber(template.downloads)}
            </span>
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500">
            by {template.author.name}
          </span>
        </div>
      </div>
    </div>
  );
}
