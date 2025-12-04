import { NextRequest, NextResponse } from "next/server";
import { generateDeploymentZip, deployToVercel, generateVercelConfig } from "@/lib/vercelDeploy";
import fs from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validate slug
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Invalid template slug" },
        { status: 400 }
      );
    }

    // Sanitize slug to prevent path traversal
    const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
    if (sanitizedSlug !== slug) {
      return NextResponse.json(
        { error: "Invalid template slug format" },
        { status: 400 }
      );
    }

    // Check if template exists
    const templateDir = path.join(process.cwd(), "src", "templates", sanitizedSlug);
    try {
      await fs.access(templateDir);
    } catch {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Get component name from metadata
    let componentName = sanitizedSlug;
    try {
      const metadataPath = path.join(templateDir, "metadata.json");
      const metadataContent = await fs.readFile(metadataPath, "utf-8");
      const metadata = JSON.parse(metadataContent);
      componentName = metadata.componentName || sanitizedSlug;
    } catch {
      // Use slug as fallback
    }

    // Generate the deployment zip with vercel.json
    const zipBuffer = await generateDeploymentZip(sanitizedSlug, componentName);

    // Call mock deploy function
    const deploymentResult = await deployToVercel(zipBuffer, componentName);

    // Return deployment result
    if (deploymentResult.success) {
      return NextResponse.json({
        success: true,
        deployment: {
          id: deploymentResult.deploymentId,
          url: deploymentResult.url,
          status: deploymentResult.status,
          projectName: deploymentResult.projectName,
          createdAt: deploymentResult.createdAt,
        },
        vercelConfig: generateVercelConfig(componentName),
        message: `Successfully deployed to ${deploymentResult.url}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: deploymentResult.error || "Deployment failed",
          deployment: {
            id: deploymentResult.deploymentId,
            status: deploymentResult.status,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Deploy error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to deploy template",
      },
      { status: 500 }
    );
  }
}

// Also support GET to check deployment status (mock)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Return mock deployment info
  return NextResponse.json({
    slug,
    deployable: true,
    message: "Use POST to deploy this template to Vercel",
  });
}
