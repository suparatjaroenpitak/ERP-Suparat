import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export interface TemplateHistoryItem {
  slug: string;
  version?: string;
  componentName: string;
  description: string;
  templateType: string;
  createdAt: string;
  promptUsed: string;
}

export interface HistoryResponse {
  success: boolean;
  templates?: TemplateHistoryItem[];
  total?: number;
  error?: string;
}

export async function GET(): Promise<NextResponse<HistoryResponse>> {
  try {
    const templatesDir = path.join(process.cwd(), "src", "templates");

    // Check if templates directory exists
    try {
      await fs.access(templatesDir);
    } catch {
      return NextResponse.json({
        success: true,
        templates: [],
        total: 0,
      });
    }

    // Read all entries in templates directory
    const entries = await fs.readdir(templatesDir, { withFileTypes: true });

    // Filter only directories and exclude index.ts
    const templateDirs = entries.filter(
      (entry) => entry.isDirectory() && entry.name !== "node_modules"
    );

    // Load metadata for each template and its versions
    const templates: TemplateHistoryItem[] = [];

    for (const dir of templateDirs) {
      const slug = dir.name;
      const slugDir = path.join(templatesDir, slug);

      // Read version subdirectories like v1, v2
      let versionEntries = [];
      try {
        const entries = await fs.readdir(slugDir, { withFileTypes: true });
        versionEntries = entries.filter((e) => e.isDirectory() && /^v\d+$/.test(e.name));
      } catch {
        continue;
      }

      // If no version subdirs, treat legacy single-folder template
      if (versionEntries.length === 0) {
        const componentPath = path.join(slugDir, "index.tsx");
        try {
          await fs.access(componentPath);
        } catch {
          continue;
        }

        let metadata: Partial<TemplateHistoryItem> = {};
        const metadataPath = path.join(slugDir, "metadata.json");
        try {
          const metadataContent = await fs.readFile(metadataPath, "utf-8");
          metadata = JSON.parse(metadataContent);
        } catch {
          const stats = await fs.stat(componentPath);
          metadata = { createdAt: stats.birthtime.toISOString() };
        }

        templates.push({
          slug,
          componentName:
            metadata.componentName ||
            slug
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(""),
          description: metadata.description || `Template: ${slug}`,
          templateType: metadata.templateType || "component",
          createdAt: metadata.createdAt || new Date().toISOString(),
          promptUsed: metadata.promptUsed || "",
        });

        continue;
      }

      // For each version, read its metadata
      for (const v of versionEntries) {
        const versionName = v.name;
        const versionDir = path.join(slugDir, versionName);
        const componentPath = path.join(versionDir, "index.tsx");
        const metadataPath = path.join(versionDir, "metadata.json");

        try {
          await fs.access(componentPath);
        } catch {
          continue;
        }

        let metadata: Partial<TemplateHistoryItem> = {};
        try {
          const metadataContent = await fs.readFile(metadataPath, "utf-8");
          metadata = JSON.parse(metadataContent);
        } catch {
          const stats = await fs.stat(componentPath);
          metadata = { createdAt: stats.birthtime.toISOString() };
        }

        templates.push({
          slug,
          version: versionName,
          componentName:
            metadata.componentName ||
            slug
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(""),
          description: metadata.description || `Template: ${slug}`,
          templateType: metadata.templateType || "component",
          createdAt: (metadata.createdAt as string) || new Date().toISOString(),
          promptUsed: metadata.promptUsed || "",
        });
      }
    }

    // Sort by created date (newest first)
    templates.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      templates,
      total: templates.length,
    });
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load template history",
      },
      { status: 500 }
    );
  }
}
