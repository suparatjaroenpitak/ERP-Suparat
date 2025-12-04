import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface TemplateResponse {
  success: boolean;
  code?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<TemplateResponse>> {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const version = url.searchParams.get("version");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 }
      );
    }

    const templatesDir = path.join(process.cwd(), "src", "templates");
    const templateDir = path.join(templatesDir, slug);

    // Default to latest version if version not specified
    let componentPath: string;
    let metadataPath: string;

    if (version) {
      const versionDir = path.join(templateDir, version);
      componentPath = path.join(versionDir, "index.tsx");
      metadataPath = path.join(versionDir, "metadata.json");
    } else {
      // Find latest version folder (highest v#) if exists, else look for legacy index.tsx
      let chosenDir: string | null = null;
      try {
        const entries = await fs.readdir(templateDir, { withFileTypes: true });
        const versionDirs = entries.filter((e) => e.isDirectory() && /^v\d+$/.test(e.name)).map((e) => e.name);
        if (versionDirs.length > 0) {
          // pick max version
          const sorted = versionDirs.sort((a, b) => parseInt(b.replace(/^v/, ""), 10) - parseInt(a.replace(/^v/, ""), 10));
          chosenDir = path.join(templateDir, sorted[0]);
        }
      } catch {}

      if (chosenDir) {
        componentPath = path.join(chosenDir, "index.tsx");
        metadataPath = path.join(chosenDir, "metadata.json");
      } else {
        componentPath = path.join(templateDir, "index.tsx");
        metadataPath = path.join(templateDir, "metadata.json");
      }
    }

    // Check if component file exists
    try {
      await fs.access(componentPath);
    } catch {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Read component code
    const code = await fs.readFile(componentPath, "utf-8");

    // Try to read metadata
    let metadata: Record<string, unknown> = {};
    try {
      const metadataContent = await fs.readFile(metadataPath, "utf-8");
      metadata = JSON.parse(metadataContent);
    } catch {
      // Metadata doesn't exist, that's okay
    }

    return NextResponse.json({
      success: true,
      code,
      metadata,
    });
  } catch (error) {
    console.error("Template API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to load template",
      },
      { status: 500 }
    );
  }
}
