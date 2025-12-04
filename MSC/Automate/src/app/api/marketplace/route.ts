import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MarketplaceTemplate, TemplateCategory, SAMPLE_MARKETPLACE_DATA } from "@/types/marketplace";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as TemplateCategory | null;
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "popular"; // popular, newest, mostDownloaded
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Load templates from filesystem and merge with sample data
    const templatesDir = path.join(process.cwd(), "src", "templates");
    let templates: MarketplaceTemplate[] = [...SAMPLE_MARKETPLACE_DATA];

    try {
      const entries = await fs.readdir(templatesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const metadataPath = path.join(templatesDir, entry.name, "metadata.json");
          const marketplacePath = path.join(templatesDir, entry.name, "marketplace.json");
          
          try {
            // Try to load marketplace-specific metadata first
            let marketplaceData: Partial<MarketplaceTemplate> = {};
            try {
              const mpContent = await fs.readFile(marketplacePath, "utf-8");
              marketplaceData = JSON.parse(mpContent);
            } catch {
              // No marketplace.json, use defaults
            }

            // Load basic metadata
            const metadataContent = await fs.readFile(metadataPath, "utf-8");
            const metadata = JSON.parse(metadataContent);
            
            // Check if template already exists in sample data
            const existsInSample = templates.some(t => t.slug === entry.name);
            if (!existsInSample) {
              // Create marketplace template from filesystem template
              const template: MarketplaceTemplate = {
                slug: entry.name,
                componentName: metadata.componentName || entry.name,
                title: marketplaceData.title || metadata.componentName || entry.name,
                description: metadata.description || "",
                category: marketplaceData.category || inferCategory(metadata.templateType, metadata.componentName),
                tags: marketplaceData.tags || [metadata.templateType],
                templateType: metadata.templateType || "component",
                framework: metadata.framework || "nextjs",
                likes: marketplaceData.likes || Math.floor(Math.random() * 100),
                downloads: marketplaceData.downloads || Math.floor(Math.random() * 500),
                views: marketplaceData.views || Math.floor(Math.random() * 1000),
                author: marketplaceData.author || { name: "User" },
                createdAt: metadata.generatedAt || new Date().toISOString(),
                updatedAt: metadata.generatedAt || new Date().toISOString(),
                dependencies: metadata.dependencies || [],
                props: metadata.props || [],
                features: marketplaceData.features || [],
                responsive: marketplaceData.responsive ?? true,
                darkMode: marketplaceData.darkMode ?? true,
                animated: marketplaceData.animated ?? false,
              };
              
              templates.push(template);
            }
          } catch {
            // Skip templates without valid metadata
          }
        }
      }
    } catch {
      // Templates directory doesn't exist, use only sample data
    }

    // Filter by category
    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        t.componentName.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (sort) {
      case "newest":
        templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "mostDownloaded":
        templates.sort((a, b) => b.downloads - a.downloads);
        break;
      case "mostLiked":
        templates.sort((a, b) => b.likes - a.likes);
        break;
      case "popular":
      default:
        // Popular = combination of likes, downloads, and views
        templates.sort((a, b) => {
          const scoreA = a.likes * 3 + a.downloads * 2 + a.views * 0.1;
          const scoreB = b.likes * 3 + b.downloads * 2 + b.views * 0.1;
          return scoreB - scoreA;
        });
    }

    // Pagination
    const total = templates.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedTemplates = templates.slice(startIndex, startIndex + limit);

    // Get category counts
    const allTemplates = [...SAMPLE_MARKETPLACE_DATA];
    const categoryCounts: Record<string, number> = {};
    for (const t of allTemplates) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      templates: paginatedTemplates,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      categoryCounts,
    });
  } catch (error) {
    console.error("Marketplace API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load marketplace templates" },
      { status: 500 }
    );
  }
}

// Helper to infer category from template type and name
function inferCategory(templateType: string, componentName: string): TemplateCategory {
  const nameLower = componentName.toLowerCase();
  
  if (nameLower.includes("dashboard")) return "dashboard";
  if (nameLower.includes("hero")) return "heroes";
  if (nameLower.includes("pricing")) return "pricing";
  if (nameLower.includes("auth") || nameLower.includes("login")) return "authentication";
  if (nameLower.includes("product") || nameLower.includes("cart")) return "ecommerce";
  if (nameLower.includes("table")) return "tables";
  if (nameLower.includes("form")) return "forms";
  if (nameLower.includes("card")) return "cards";
  if (nameLower.includes("nav") || nameLower.includes("sidebar") || nameLower.includes("menu")) return "navigation";
  if (nameLower.includes("modal")) return "modals";
  if (nameLower.includes("chart")) return "charts";
  if (nameLower.includes("testimonial")) return "testimonials";
  if (nameLower.includes("feature")) return "features";
  if (nameLower.includes("footer")) return "footers";
  if (nameLower.includes("blog") || nameLower.includes("post")) return "blog";
  if (nameLower.includes("portfolio")) return "portfolio";
  
  if (templateType === "page") return "landing";
  if (templateType === "layout") return "admin";
  
  return "other";
}
