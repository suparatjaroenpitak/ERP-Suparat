"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Eye, Code, Loader2, AlertCircle, X, Download, Rocket, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme";

interface GeneratedMetadata {
  slug: string;
  componentName: string;
  description: string;
  templateType: string;
  framework: string;
  generatedAt: string;
  promptUsed: string;
  filePath?: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  dependencies: string[];
}

interface GenerateResponse {
  success: boolean;
  code?: string;
  error?: string;
  metadata?: GeneratedMetadata;
}

// Template Style Options
const TEMPLATE_STYLES = [
  { value: "dashboard", label: "Dashboard", desc: "Admin dashboard with charts and stats" },
  { value: "admin-lte", label: "Admin LTE Style", desc: "Classic admin panel layout" },
  { value: "landing-page", label: "Landing Page", desc: "Marketing landing page" },
  { value: "ecommerce", label: "Ecommerce", desc: "Online store components" },
  { value: "profile", label: "Profile", desc: "User profile pages" },
] as const;

type TemplateStyle = typeof TEMPLATE_STYLES[number]["value"];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [templateType, setTemplateType] = useState<"component" | "page" | "layout">("component");
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>("dashboard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<GeneratedMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "props">("code");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{
    success: boolean;
    url?: string;
    error?: string;
    projectName?: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("กรุณาใส่ prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCode(null);
    setMetadata(null);
    setShowPreview(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          templateType,
          templateStyle,
          framework: "nextjs",
          saveToFile: true,
        }),
      });

      const data: GenerateResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate template");
      }

      setGeneratedCode(data.code || null);
      setMetadata(data.metadata || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("ไม่สามารถคัดลอกได้");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleGenerate();
    }
  };

  const handleClear = () => {
    setPrompt("");
    setGeneratedCode(null);
    setMetadata(null);
    setError(null);
    setShowPreview(false);
    setDeployResult(null);
  };

  const handleExport = async () => {
    if (!metadata?.slug) return;

    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${metadata.slug}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export template");
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `${metadata.componentName}-template.zip`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export template");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeploy = async () => {
    if (!metadata?.slug) return;

    setIsDeploying(true);
    setDeployResult(null);

    try {
      const response = await fetch(`/api/deploy/${metadata.slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDeployResult({
          success: true,
          url: data.deployment.url,
          projectName: data.deployment.projectName,
        });
      } else {
        setDeployResult({
          success: false,
          error: data.error || "Deployment failed",
        });
      }
    } catch (err) {
      setDeployResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to deploy",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Quick example prompts
  const examplePrompts = [
    "Create a button component with loading state",
    "Build a card with image and actions",
    "Create a responsive navbar with mobile menu",
    "Build a contact form with validation",
    "Create a hero section with CTA",
    "Build a modal dialog component",
    "Create a data table with pagination",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Template Generator</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI-Powered Component Generation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <a
                href="/"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-sm font-medium"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            {/* Template Type Selector */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Template Type</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "component", label: "Component", desc: "Reusable UI" },
                  { value: "page", label: "Page", desc: "Full page" },
                  { value: "layout", label: "Layout", desc: "Page wrapper" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setTemplateType(type.value as typeof templateType)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      templateType === type.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className={`font-medium ${templateType === type.value ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Style Dropdown */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Template Style</h2>
              <select
                value={templateStyle}
                onChange={(e) => setTemplateStyle(e.target.value as TemplateStyle)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 cursor-pointer"
              >
                {TEMPLATE_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label} - {style.desc}
                  </option>
                ))}
              </select>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Selected: <span className="font-medium text-blue-600 dark:text-blue-400">{TEMPLATE_STYLES.find(s => s.value === templateStyle)?.label}</span>
              </p>
            </div>

            {/* Prompt Input */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <label className="block text-lg font-semibold text-slate-800 dark:text-white mb-4">
                Describe Your Template
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Create a responsive card component with an image, title, description, price tag, and add to cart button..."
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-shadow"
              />
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {prompt.length}/2000 • Ctrl+Enter to generate
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={handleClear}
                    disabled={isGenerating || (!prompt && !generatedCode)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Template
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Examples */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                Quick Examples
              </h3>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example) => (
                  <button
                    key={example}
                    onClick={() => setPrompt(example)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            {/* Code Preview */}
            <div className="bg-slate-900 rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-slate-400 text-sm">
                    {metadata?.componentName || "component"}.tsx
                  </span>
                </div>

                {generatedCode && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                        showPreview
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-700"
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    {metadata?.slug && (
                      <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Export
                          </>
                        )}
                      </button>
                    )}
                    {metadata?.slug && (
                      <button
                        onClick={handleDeploy}
                        disabled={isDeploying}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {isDeploying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4" />
                            Deploy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Code Content */}
              <div className="relative">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-400">Generating your template...</p>
                    <p className="text-slate-500 text-sm mt-2">This may take a few seconds</p>
                  </div>
                ) : generatedCode ? (
                  <div className="p-4 overflow-auto max-h-[500px]">
                    <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                      <code>{generatedCode}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                    <Code className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg">Your generated code will appear here</p>
                    <p className="text-sm mt-2">Enter a prompt and click Generate</p>
                  </div>
                )}
              </div>

              {/* Metadata Footer */}
              {metadata && (
                <div className="px-4 py-3 bg-slate-800 border-t border-slate-700">
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>
                      Type: <span className="text-slate-400">{metadata.templateType}</span>
                    </span>
                    <span>
                      Component: <span className="text-slate-400">{metadata.componentName}</span>
                    </span>
                    {metadata.filePath && (
                      <span>
                        Saved: <span className="text-green-500">✓</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Deployment Result */}
            {deployResult && (
              <div
                className={`rounded-2xl p-4 ${
                  deployResult.success
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                }`}
              >
                {deployResult.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Deployed Successfully!</span>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-500">
                      <p><span className="font-medium">Project:</span> {deployResult.projectName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={deployResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Visit Site
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setDeployResult(null)}
                        className="px-4 py-2 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-sm transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Deployment Failed</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-500">{deployResult.error}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeploy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        Try Again
                      </button>
                      <button
                        onClick={() => setDeployResult(null)}
                        className="px-4 py-2 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Props & Info Tabs */}
            {metadata && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setActiveTab("code")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === "code"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Info
                  </button>
                  <button
                    onClick={() => setActiveTab("props")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === "props"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    Props ({metadata.props.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "code" ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h4>
                        <p className="text-slate-700 dark:text-slate-300">{metadata.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Slug</h4>
                        <code className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">{metadata.slug}</code>
                      </div>
                      {metadata.filePath && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">File Path</h4>
                          <code className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded block truncate">
                            {metadata.filePath}
                          </code>
                        </div>
                      )}
                      {metadata.dependencies.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Dependencies</h4>
                          <div className="flex flex-wrap gap-2">
                            {metadata.dependencies.map((dep) => (
                              <span
                                key={dep}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-sm"
                              >
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {metadata.props.map((prop) => (
                        <div
                          key={prop.name}
                          className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-semibold text-blue-600 dark:text-blue-400">{prop.name}</code>
                            {prop.required && (
                              <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded">
                                required
                              </span>
                            )}
                          </div>
                          <code className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{prop.type}</code>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{prop.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && generatedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Template Preview</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{metadata?.componentName}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Live Preview</p>
                  <p className="text-sm mt-2">
                    Component preview would render here in a real implementation.
                  </p>
                  <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">
                    Use the generated code to create your component.
                  </p>
                </div>
              </div>
              
              {/* Props Preview */}
              {metadata && metadata.props.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Available Props</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {metadata.props.map((prop) => (
                      <div
                        key={prop.name}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">{prop.name}</span>
                        {prop.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
