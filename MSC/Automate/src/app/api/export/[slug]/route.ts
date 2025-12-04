import { NextRequest, NextResponse } from "next/server";
import { generateTemplateZip, templateExists, getTemplateMetadata } from "@/lib/zipGenerator";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Validate slug
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid template slug" },
        { status: 400 }
      );
    }

    // Sanitize slug to prevent directory traversal
    const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
    
    if (sanitizedSlug !== slug) {
      return NextResponse.json(
        { success: false, error: "Invalid characters in slug" },
        { status: 400 }
      );
    }

    // Check if template exists
    const exists = await templateExists(sanitizedSlug);
    if (!exists) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // Get metadata for filename
    const metadata = await getTemplateMetadata(sanitizedSlug);
    const componentName = metadata?.componentName || sanitizedSlug;

    // Generate zip file
    const zipBuffer = await generateTemplateZip(sanitizedSlug);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${componentName}-template-${timestamp}.zip`;

    // Return zip file as download
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to export template";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
