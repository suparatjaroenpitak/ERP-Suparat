// Type definitions for the Template Generator

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory = 
  | "component"
  | "page"
  | "layout"
  | "section"
  | "form"
  | "navigation";

export interface GenerateRequest {
  prompt: string;
  templateType?: TemplateCategory;
  framework?: "react" | "nextjs";
  styling?: "tailwind" | "css" | "styled-components";
}

export interface GenerateResponse {
  success: boolean;
  code?: string;
  error?: string;
  metadata?: {
    templateType: string;
    generatedAt: string;
    promptUsed: string;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}
