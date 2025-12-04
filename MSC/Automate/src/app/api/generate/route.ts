import { NextRequest, NextResponse } from "next/server";
import {
  generateFromAI,
  generateSlug,
  saveGeneratedTemplate,
  AIGenerationOptions,
} from "@/lib/aiGenerator";
import {
  enhancePrompt,
  TemplateStyle,
  TemplateType,
} from "@/lib/templatePromptEngine";

// ============================================
// Types
// ============================================

export interface GenerateRequest {
  prompt: string;
  templateType?: "component" | "page" | "layout";
  templateStyle?: "dashboard" | "admin-lte" | "landing-page" | "ecommerce" | "profile";
  framework?: "react" | "nextjs";
  saveToFile?: boolean;
}

export interface GenerateResponse {
  success: boolean;
  code?: string;
  error?: string;
  metadata?: {
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
  };
}

// ============================================
// POST /api/generate
// ============================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateResponse>> {
  try {
    // Parse request body
    const body: GenerateRequest = await request.json();
    const {
      prompt,
      templateType = "component",
      templateStyle = "dashboard",
      framework = "nextjs",
      saveToFile = true,
    } = body;

    // Validate templateStyle
    const validTemplateStyles: TemplateStyle[] = ["dashboard", "admin-lte", "landing-page", "ecommerce", "profile"];
    if (!validTemplateStyles.includes(templateStyle as TemplateStyle)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid templateStyle. Must be one of: ${validTemplateStyles.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (prompt.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt must be at least 3 characters long",
        },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt too long. Maximum 2000 characters allowed.",
        },
        { status: 400 }
      );
    }

    // Validate templateType
    const validTemplateTypes = ["component", "page", "layout"];
    if (!validTemplateTypes.includes(templateType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid templateType. Must be one of: ${validTemplateTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate framework
    const validFrameworks = ["react", "nextjs"];
    if (!validFrameworks.includes(framework)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid framework. Must be one of: ${validFrameworks.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Generate slug from prompt
    const slug = generateSlug(prompt);

    // Enhance prompt using templatePromptEngine
    const enhancedPrompt = enhancePrompt({
      userPrompt: prompt.trim(),
      templateStyle: templateStyle as TemplateStyle,
      templateType: templateType as TemplateType,
      framework,
    });

    // Prepare AI generation options
    const aiOptions: AIGenerationOptions = {
      prompt: enhancedPrompt,
      templateType,
      framework,
      templateStyle: templateStyle as TemplateStyle,
    };

    // Generate code using AI (mock function)
    const aiResult = await generateFromAI(aiOptions);

    // Prepare metadata
    const metadata: GenerateResponse["metadata"] = {
      slug,
      componentName: aiResult.componentName,
      description: aiResult.description,
      templateType,
      framework,
      generatedAt: new Date().toISOString(),
      promptUsed: prompt,
      props: aiResult.props,
      dependencies: aiResult.dependencies,
    };

    // Save to file system if requested
    if (saveToFile) {
      try {
        const filePath = await saveGeneratedTemplate(slug, aiResult.code, {
          ...metadata,
          createdAt: new Date().toISOString(),
        });
        metadata.filePath = filePath;
      } catch (saveError) {
        console.error("Failed to save template:", saveError);
        // Continue without saving - don't fail the whole request
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      code: aiResult.code,
      metadata,
    });
  } catch (error) {
    console.error("Generate API Error:", error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate template",
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/generate
// ============================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: "Template Generator API",
    version: "2.0.0",
    description: "Generate React/Next.js components from natural language prompts",
    endpoints: {
      "POST /api/generate": {
        description: "Generate a new template from a prompt",
        requestBody: {
          prompt: {
            type: "string",
            required: true,
            description: "Natural language description of the component to generate",
            example: "Create a button component with primary, secondary, and outline variants",
          },
          templateType: {
            type: "string",
            required: false,
            default: "component",
            enum: ["component", "page", "layout"],
            description: "Type of template to generate",
          },
          framework: {
            type: "string",
            required: false,
            default: "nextjs",
            enum: ["react", "nextjs"],
            description: "Target framework",
          },
          saveToFile: {
            type: "boolean",
            required: false,
            default: true,
            description: "Whether to save the generated code to /templates/{slug}/index.tsx",
          },
        },
        response: {
          success: "boolean",
          code: "string - The generated component code",
          metadata: {
            slug: "string - URL-friendly identifier",
            componentName: "string - PascalCase component name",
            description: "string - Component description",
            templateType: "string - component | page | layout",
            framework: "string - react | nextjs",
            generatedAt: "string - ISO timestamp",
            promptUsed: "string - Original prompt",
            filePath: "string - Path where file was saved (if saveToFile=true)",
            props: "array - List of component props with types",
            dependencies: "array - Required imports/dependencies",
          },
        },
      },
    },
    examples: [
      {
        description: "Generate a button component",
        request: {
          prompt: "Create a button with loading state",
          templateType: "component",
        },
      },
      {
        description: "Generate a card component",
        request: {
          prompt: "Build a product card with image, title, price, and add to cart button",
          templateType: "component",
        },
      },
      {
        description: "Generate a page template",
        request: {
          prompt: "Create a dashboard page with sidebar navigation",
          templateType: "page",
        },
      },
    ],
  });
}
