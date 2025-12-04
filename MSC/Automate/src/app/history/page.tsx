"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Eye,
  Copy,
  Check,
  Loader2,
  FileCode,
  Calendar,
  Sparkles,
  FolderOpen,
  AlertCircle,
  Trash2,
  Download,
  Rocket,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme";

interface TemplateHistoryItem {
  slug: string;
  componentName: string;
  description: string;
  templateType: string;
  createdAt: string;
  promptUsed: string;
}

interface HistoryResponse {
  success: boolean;
  templates?: TemplateHistoryItem[];
  total?: number;
  error?: string;
}

export default function HistoryPage() {
  const [templates, setTemplates] = useState<TemplateHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [codeCache, setCodeCache] = useState<Record<string, string>>({});
  const [exportingSlug, setExportingSlug] = useState<string | null>(null);
  const [deployingSlug, setDeployingSlug] = useState<string | null>(null);
  const [deployResult, setDeployResult] = useState<{
    slug: string;
    success: boolean;
    url?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/history");
      const data: HistoryResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load history");
      }

      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (slug: string) => {
    try {
      // Check cache first
      let code = codeCache[slug];

      if (!code) {
        // Fetch the code
        const response = await fetch(`/api/templates/${slug}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error("Failed to fetch code");
        }

        code = data.code;
        setCodeCache((prev) => ({ ...prev, [slug]: code }));
      }

      await navigator.clipboard.writeText(code);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleExport = async (slug: string, componentName: string) => {
    setExportingSlug(slug);
    try {
      const response = await fetch(`/api/export/${slug}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `${componentName}-template.zip`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setExportingSlug(null);
    }
  };

  const handleDeploy = async (slug: string, componentName: string) => {
    setDeployingSlug(slug);
    setDeployResult(null);

    try {
      const response = await fetch(`/api/deploy/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDeployResult({
          slug,
          success: true,
          url: data.deployment.url,
        });
      } else {
        setDeployResult({
          slug,
          success: false,
          error: data.error || "Deployment failed",
        });
      }
    } catch (err) {
      setDeployResult({
        slug,
        success: false,
        error: err instanceof Error ? err.message : "Failed to deploy",
      });
    } finally {
      setDeployingSlug(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case "component":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "page":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      case "layout":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Template History</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {templates.length} template{templates.length !== 1 ? "s" : ""} generated
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/generate"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Generate New
              </Link>
              <Link
                href="/"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-sm font-medium"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading template history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Error Loading History</h2>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchHistory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && templates.length === 0 && (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No Templates Yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                You haven&apos;t generated any templates yet. Start by creating your first one!
              </p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Generate Your First Template
              </Link>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        {!isLoading && !error && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.slug}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                        <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {template.componentName}
                        </h3>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTemplateTypeColor(
                            template.templateType
                          )}`}
                        >
                          {template.templateType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                    {template.description}
                  </p>

                  {/* Prompt */}
                  {template.promptUsed && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Prompt:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                        &ldquo;{template.promptUsed}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(template.createdAt)}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 flex gap-2">
                  <Link
                    href={`/preview/${template.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Link>
                  <button
                    onClick={() => handleCopyCode(template.slug)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                  >
                    {copiedSlug === template.slug ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleExport(template.slug, template.componentName)}
                    disabled={exportingSlug === template.slug}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors font-medium text-sm disabled:opacity-50"
                    title="Export as ZIP"
                  >
                    {exportingSlug === template.slug ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeploy(template.slug, template.componentName)}
                    disabled={deployingSlug === template.slug}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium text-sm disabled:opacity-50"
                    title="Deploy to Vercel"
                  >
                    {deployingSlug === template.slug ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Rocket className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Deploy Result for this card */}
                {deployResult && deployResult.slug === template.slug && (
                  <div
                    className={`p-3 ${
                      deployResult.success
                        ? "bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800"
                    }`}
                  >
                    {deployResult.success ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Deployed!</span>
                        </div>
                        <a
                          href={deployResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:underline"
                        >
                          Visit
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">{deployResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {!isLoading && !error && templates.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {templates.filter((t) => t.templateType === "component").length}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Components</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {templates.filter((t) => t.templateType === "page").length}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pages</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {templates.filter((t) => t.templateType === "layout").length}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Layouts</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
