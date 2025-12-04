import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Code, FileCode, Calendar, Tag, Download } from "lucide-react";
import { ThemeToggle } from "@/components/theme";
import { DeployButton } from "@/components/deploy";
import { CopyButtonClient } from "./CopyButtonClient";
import { ExportButtonClient } from "./ExportButtonClient";

interface TemplateMetadata {
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface SearchParamsProps {
  searchParams?: { [key: string]: string | undefined };
}

// Get all available template slugs for static generation
export async function generateStaticParams() {
  const templatesDir = path.join(process.cwd(), "src", "templates");
  
  try {
    const entries = await fs.readdir(templatesDir, { withFileTypes: true });
    const slugs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({ slug: entry.name }));
    
    return slugs;
  } catch {
    return [];
  }
}

// Check if template exists and load metadata
async function getTemplateData(slug: string): Promise<{
  exists: boolean;
  metadata?: TemplateMetadata;
  code?: string;
}> {
  const templateDir = path.join(process.cwd(), "src", "templates", slug);

  // Find latest version folder if present
  let componentPath = path.join(templateDir, "index.tsx");
  let metadataPath = path.join(templateDir, "metadata.json");
  try {
    const entries = await fs.readdir(templateDir, { withFileTypes: true });
    const versionDirs = entries.filter((e) => e.isDirectory() && /^v\d+$/.test(e.name)).map((e) => e.name);
    if (versionDirs.length > 0) {
      const sorted = versionDirs.sort((a, b) => parseInt(b.replace(/^v/, ""), 10) - parseInt(a.replace(/^v/, ""), 10));
      const latest = sorted[0];
      componentPath = path.join(templateDir, latest, "index.tsx");
      metadataPath = path.join(templateDir, latest, "metadata.json");
    }
  } catch {}

  try {
    // Check if component file exists
    await fs.access(componentPath);
    
    // Read component code
    const code = await fs.readFile(componentPath, "utf-8");
    
    // Try to read metadata
    let metadata: TemplateMetadata | undefined;
    try {
      const metadataContent = await fs.readFile(metadataPath, "utf-8");
      metadata = JSON.parse(metadataContent);
    } catch {
      // Metadata file doesn't exist, create basic metadata
      metadata = {
        slug,
        componentName: slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(""),
        description: `Template: ${slug}`,
        templateType: "component",
        framework: "nextjs",
        generatedAt: new Date().toISOString(),
        promptUsed: "",
        props: [],
        dependencies: [],
      };
    }

    return { exists: true, metadata, code };
  } catch {
    return { exists: false };
  }
}

export default async function PreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const templateData = await getTemplateData(slug);

  // If template doesn't exist, show 404
  if (!templateData.exists) {
    notFound();
  }

  const { metadata, code } = templateData;

  // Dynamically import the component
  // Note: This requires the component to be properly exportable
  let DynamicComponent: React.ComponentType<Record<string, unknown>> | null = null;
  let loadError: string | null = null;

  try {
    // Try to dynamically import the template
    DynamicComponent = dynamic(
      () => import(`@/templates/${slug}/index`).catch(() => {
        return Promise.resolve(() => (
          <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <p className="text-yellow-700">
              Component could not be loaded dynamically.
              <br />
              View the code below to use it in your project.
            </p>
          </div>
        ));
      }),
      {
        loading: () => (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ),
        ssr: false,
      }
    );
  } catch {
    loadError = "Failed to load component";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/generate"
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                  {metadata?.componentName || slug}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Template Preview</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                {metadata?.templateType || "component"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Preview Panel */}
          <div className="xl:col-span-2 space-y-6">
            {/* Live Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-500" />
                  Live Preview
                </h2>
              </div>
              <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 min-h-[400px]">
                {loadError ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-red-500">
                      <p className="font-medium">{loadError}</p>
                    </div>
                  </div>
                ) : DynamicComponent ? (
                  <div className="flex items-center justify-center">
                    <DynamicComponent />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500 dark:text-slate-400">Loading component...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Code View */}
            <div className="bg-slate-900 rounded-2xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    {slug}/index.tsx
                  </span>
                </div>
                <CopyButton code={code || ""} />
              </div>
              <div className="p-4 overflow-auto max-h-[500px]">
                <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Template Info</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h3>
                  <p className="text-slate-700 dark:text-slate-300">{metadata?.description || "No description"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Slug</h3>
                  <code className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">{slug}</code>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {metadata?.generatedAt
                      ? new Date(metadata.generatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </span>
                </div>

                {metadata?.promptUsed && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Original Prompt</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                      &ldquo;{metadata.promptUsed}&rdquo;
                    </p>
                  </div>
                )}

                {metadata?.dependencies && metadata.dependencies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Dependencies</h3>
                    <div className="flex flex-wrap gap-2">
                      {metadata.dependencies.map((dep) => (
                        <span
                          key={dep}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-sm flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Props Card */}
            {metadata?.props && metadata.props.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Props ({metadata.props.length})
                  </h2>
                </div>
                <div className="p-4 space-y-3 max-h-[400px] overflow-auto">
                  {metadata.props.map((prop) => (
                    <div
                      key={prop.name}
                      className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {prop.name}
                        </code>
                        {prop.required && (
                          <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded">
                            required
                          </span>
                        )}
                      </div>
                      <code className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                        {prop.type}
                      </code>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{prop.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Actions</h2>
              <div className="space-y-3">
                <DeployButton slug={slug} componentName={metadata?.componentName || slug} />
                <ExportButton slug={slug} componentName={metadata?.componentName || slug} />
                <Link
                  href="/generate"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Generate New Template
                </Link>
                <Link
                  href="/history"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  View History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Copy Button Component (Client Component)
function CopyButton({ code }: { code: string }) {
  return <CopyButtonClient code={code} />;
}

// Export Button Component (Client Component)
function ExportButton({ slug, componentName }: { slug: string; componentName: string }) {
  return <ExportButtonClient slug={slug} componentName={componentName} />;
}
