import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_MARKETPLACE_DATA } from "@/types/marketplace";

// POST to like a template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { action } = await request.json();

    // Find template in sample data
    const template = SAMPLE_MARKETPLACE_DATA.find(t => t.slug === slug);
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // In a real app, this would update the database
    // For now, we'll just return the current values + 1 for like
    if (action === "like") {
      return NextResponse.json({
        success: true,
        likes: template.likes + 1,
        message: "Template liked!",
      });
    }

    if (action === "unlike") {
      return NextResponse.json({
        success: true,
        likes: Math.max(0, template.likes - 1),
        message: "Like removed",
      });
    }

    if (action === "download") {
      return NextResponse.json({
        success: true,
        downloads: template.downloads + 1,
        message: "Download counted",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process action" },
      { status: 500 }
    );
  }
}

// GET template stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const template = SAMPLE_MARKETPLACE_DATA.find(t => t.slug === slug);
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: {
        likes: template.likes,
        downloads: template.downloads,
        views: template.views,
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
