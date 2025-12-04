// AI Generation Helper
// Mock LLM function for generating components from prompts

import fs from "fs/promises";
import path from "path";
import { formatAIPrompt, formatFullAIPrompt, TemplateStyle, TemplateType } from "./templatePromptEngine";

export interface AIGenerationOptions {
  prompt: string;
  templateType: "component" | "page" | "layout";
  framework: "react" | "nextjs";
  styling?: "tailwind" | "css";
  templateStyle?: TemplateStyle;
}

export interface AIGenerationResult {
  code: string;
  componentName: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  dependencies: string[];
}

/**
 * Generate a slug from a prompt
 */
export function generateSlug(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50)
    .replace(/^-|-$/g, "");
}

/**
 * Extract component name from prompt
 */
export function extractComponentName(prompt: string): string {
  // Try to extract a meaningful name from the prompt
  const patterns = [
    /create\s+(?:a\s+)?(\w+)\s+component/i,
    /build\s+(?:a\s+)?(\w+)\s+component/i,
    /make\s+(?:a\s+)?(\w+)\s+component/i,
    /(\w+)\s+component/i,
    /create\s+(?:a\s+)?(\w+)/i,
    /build\s+(?:a\s+)?(\w+)/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      // Capitalize first letter
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
  }

  // Default name if no match found
  return "GeneratedComponent";
}

/**
 * Mock LLM function - In production, replace with actual AI API call
 * (e.g., OpenAI, Anthropic, etc.)
 */
export async function generateFromAI(
  options: AIGenerationOptions
): Promise<AIGenerationResult> {
  const { prompt, templateType, framework, templateStyle } = options;
  
  // Format the AI prompt using the standard format
  const formattedPrompt = templateStyle 
    ? formatFullAIPrompt(prompt, templateType as TemplateType, templateStyle)
    : formatAIPrompt(prompt, templateType as TemplateType);
  
  // Log the formatted prompt (for debugging/demonstration)
  console.log("=== Formatted AI Prompt ===");
  console.log(formattedPrompt);
  console.log("===========================");
  
  // Extract component name from prompt
  const componentName = extractComponentName(prompt);
  
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Detect what kind of component to generate based on prompt keywords
  const lowerPrompt = prompt.toLowerCase();
  
  let code: string;
  let description: string;
  let props: AIGenerationResult["props"] = [];
  let dependencies: string[] = [];

  // Generate different components based on prompt content
  if (lowerPrompt.includes("button")) {
    code = generateButtonComponent(componentName, framework);
    description = "A customizable button component with multiple variants and sizes";
    props = [
      { name: "children", type: "React.ReactNode", required: true, description: "Button content" },
      { name: "variant", type: '"primary" | "secondary" | "outline"', required: false, description: "Button style variant" },
      { name: "size", type: '"sm" | "md" | "lg"', required: false, description: "Button size" },
      { name: "onClick", type: "() => void", required: false, description: "Click handler" },
      { name: "disabled", type: "boolean", required: false, description: "Disabled state" },
    ];
  } else if (lowerPrompt.includes("card")) {
    code = generateCardComponent(componentName, framework);
    description = "A versatile card component for displaying content with optional image and actions";
    props = [
      { name: "title", type: "string", required: true, description: "Card title" },
      { name: "description", type: "string", required: false, description: "Card description" },
      { name: "image", type: "string", required: false, description: "Image URL" },
      { name: "children", type: "React.ReactNode", required: false, description: "Card body content" },
    ];
    if (framework === "nextjs") {
      dependencies = ["next/image"];
    }
  } else if (lowerPrompt.includes("nav") || lowerPrompt.includes("header") || lowerPrompt.includes("menu")) {
    code = generateNavbarComponent(componentName, framework);
    description = "A responsive navigation bar with mobile menu support";
    props = [
      { name: "logo", type: "React.ReactNode", required: false, description: "Logo element" },
      { name: "items", type: "NavItem[]", required: false, description: "Navigation items" },
      { name: "sticky", type: "boolean", required: false, description: "Make navbar sticky" },
    ];
    dependencies = framework === "nextjs" ? ["next/link", "lucide-react"] : ["lucide-react"];
  } else if (lowerPrompt.includes("form") || lowerPrompt.includes("input") || lowerPrompt.includes("contact")) {
    code = generateFormComponent(componentName, framework);
    description = "A form component with validation and submit handling";
    props = [
      { name: "title", type: "string", required: false, description: "Form title" },
      { name: "fields", type: "FormField[]", required: true, description: "Form field configurations" },
      { name: "onSubmit", type: "(data: Record<string, string>) => Promise<void>", required: false, description: "Submit handler" },
    ];
  } else if (lowerPrompt.includes("hero") || lowerPrompt.includes("banner") || lowerPrompt.includes("landing")) {
    code = generateHeroComponent(componentName, framework);
    description = "A hero section with title, subtitle, and call-to-action buttons";
    props = [
      { name: "title", type: "string", required: true, description: "Main heading" },
      { name: "subtitle", type: "string", required: false, description: "Subheading text" },
      { name: "ctaText", type: "string", required: false, description: "CTA button text" },
      { name: "ctaHref", type: "string", required: false, description: "CTA button link" },
    ];
    if (framework === "nextjs") {
      dependencies = ["next/link"];
    }
  } else if (lowerPrompt.includes("modal") || lowerPrompt.includes("dialog") || lowerPrompt.includes("popup")) {
    code = generateModalComponent(componentName, framework);
    description = "A modal dialog component with backdrop and close functionality";
    props = [
      { name: "isOpen", type: "boolean", required: true, description: "Modal visibility state" },
      { name: "onClose", type: "() => void", required: true, description: "Close handler" },
      { name: "title", type: "string", required: false, description: "Modal title" },
      { name: "children", type: "React.ReactNode", required: true, description: "Modal content" },
    ];
    dependencies = ["lucide-react"];
  } else if (lowerPrompt.includes("table") || lowerPrompt.includes("list") || lowerPrompt.includes("data")) {
    code = generateTableComponent(componentName, framework);
    description = "A data table component with sorting and pagination";
    props = [
      { name: "columns", type: "Column[]", required: true, description: "Table column definitions" },
      { name: "data", type: "T[]", required: true, description: "Table row data" },
      { name: "onRowClick", type: "(row: T) => void", required: false, description: "Row click handler" },
    ];
  } else {
    // Default generic component
    code = generateGenericComponent(componentName, templateType, framework);
    description = `A ${templateType} component generated from: ${prompt}`;
    props = [
      { name: "children", type: "React.ReactNode", required: false, description: "Component content" },
      { name: "className", type: "string", required: false, description: "Additional CSS classes" },
    ];
  }

  return {
    code,
    componentName,
    description,
    props,
    dependencies,
  };
}

/**
 * Save generated component to file system
 */
export async function saveGeneratedTemplate(
  slug: string,
  code: string,
  metadata: Record<string, unknown>
): Promise<string> {
  // Base templates directory for this slug
  const baseTemplateDir = path.join(process.cwd(), "src", "templates", slug);

  // Ensure base directory exists
  await fs.mkdir(baseTemplateDir, { recursive: true });

  // Determine next version (v1, v2, ...)
  let nextVersionNumber = 1;
  try {
    const entries = await fs.readdir(baseTemplateDir, { withFileTypes: true });
    const versionDirs = entries
      .filter((e) => e.isDirectory() && /^v\d+$/.test(e.name))
      .map((e) => parseInt(e.name.replace(/^v/, ""), 10))
      .filter(Boolean);

    if (versionDirs.length > 0) {
      const max = Math.max(...versionDirs);
      nextVersionNumber = max + 1;
    }
  } catch {
    // ignore, create v1
  }

  const versionName = `v${nextVersionNumber}`;
  const versionDir = path.join(baseTemplateDir, versionName);

  // Create version directory
  await fs.mkdir(versionDir, { recursive: true });

  // Save the component code in the version directory
  const componentPath = path.join(versionDir, "index.tsx");
  await fs.writeFile(componentPath, code, "utf-8");

  // Ensure metadata contains version and createdAt
  try {
    metadata.version = versionName;
  } catch {}
  if (!metadata.createdAt) {
    try {
      metadata.createdAt = new Date().toISOString();
    } catch {}
  }

  // Save metadata into version folder
  const metadataPath = path.join(versionDir, "metadata.json");
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");

  return componentPath;
}

// ============================================
// Component Generation Templates
// ============================================

function generateButtonComponent(name: string, framework: string): string {
  const useClient = framework === "nextjs" ? '"use client";\n\n' : "";
  
  return `${useClient}interface ${name}Props {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export default function ${name}({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
  className = "",
}: ${name}Props) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600",
  };
  
  const sizes = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${fullWidth ? "w-full" : ""} \${disabled ? "opacity-50 cursor-not-allowed" : ""} \${className}\`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
`;
}

function generateCardComponent(name: string, framework: string): string {
  const useClient = framework === "nextjs" ? '"use client";\n\n' : "";
  const imageImport = framework === "nextjs" ? 'import Image from "next/image";\n\n' : "";
  
  return `${useClient}${imageImport}interface ${name}Props {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  badge?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ${name}({
  title,
  description,
  image,
  imageAlt = "Card image",
  badge,
  footer,
  children,
  onClick,
  className = "",
}: ${name}Props) {
  return (
    <div
      onClick={onClick}
      className={\`bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/70 transition-shadow border border-slate-200 dark:border-slate-700 \${onClick ? "cursor-pointer" : ""} \${className}\`}
    >
      {image && (
        <div className="relative aspect-video w-full overflow-hidden">
          ${framework === "nextjs" 
            ? `<Image src={image} alt={imageAlt} fill className="object-cover" />`
            : `<img src={image} alt={imageAlt} className="w-full h-full object-cover" />`
          }
          {badge && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{description}</p>
        )}
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-700">
          {footer}
        </div>
      )}
    </div>
  );
}
`;
}

function generateNavbarComponent(name: string, framework: string): string {
  const linkComponent = framework === "nextjs" ? "Link" : "a";
  const linkImport = framework === "nextjs" ? 'import Link from "next/link";\n' : "";
  
  return `"use client";

import { useState } from "react";
${linkImport}import { Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

interface ${name}Props {
  logo?: React.ReactNode;
  items?: NavItem[];
  cta?: { label: string; href: string };
  sticky?: boolean;
  className?: string;
}

export default function ${name}({
  logo = "Logo",
  items = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ],
  cta,
  sticky = true,
  className = "",
}: ${name}Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={\`w-full bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 \${sticky ? "sticky top-0 z-50" : ""} \${className}\`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <${linkComponent} href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {logo}
          </${linkComponent}>

          <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => (
              <${linkComponent}
                key={item.href}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                {item.label}
              </${linkComponent}>
            ))}
            {cta && (
              <${linkComponent}
                href={cta.href}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {cta.label}
              </${linkComponent}>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-800">
            {items.map((item) => (
              <${linkComponent}
                key={item.href}
                href={item.href}
                className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </${linkComponent}>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
`;
}

function generateFormComponent(name: string, framework: string): string {
  const useClient = framework === "nextjs" ? '"use client";\n\n' : "";
  
  return `${useClient}import { useState, FormEvent } from "react";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface ${name}Props {
  title?: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  onSubmit?: (data: Record<string, string>) => Promise<void>;
  className?: string;
}

export default function ${name}({
  title,
  description,
  fields,
  submitLabel = "Submit",
  onSubmit,
  className = "",
}: ${name}Props) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = \`\${field.label} is required\`;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) await onSubmit(formData);
      setIsSuccess(true);
      setFormData({});
    } catch (error) {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500";

  return (
    <form onSubmit={handleSubmit} className={\`bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 p-8 border border-slate-200 dark:border-slate-700 \${className}\`}>
      {title && <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>}
      {description && <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>}
      
      {isSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          Form submitted successfully!
        </div>
      )}
      
      {errors.form && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {errors.form}
        </div>
      )}

      <div className="space-y-5">
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleChange}
                rows={4}
                className={\`\${inputStyles} resize-none\`}
              />
            ) : field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className={inputStyles}
              >
                <option value="">{field.placeholder || "Select..."}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className={inputStyles}
              />
            )}
            
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {isSubmitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}
`;
}

function generateHeroComponent(name: string, framework: string): string {
  const linkImport = framework === "nextjs" ? 'import Link from "next/link";\n\n' : "";
  const linkComponent = framework === "nextjs" ? "Link" : "a";
  
  return `${linkImport}interface ${name}Props {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  className?: string;
}

export default function ${name}({
  title,
  subtitle,
  description,
  ctaText = "Get Started",
  ctaHref = "#",
  secondaryCtaText,
  secondaryCtaHref,
  backgroundImage,
  className = "",
}: ${name}Props) {
  return (
    <section
      className={\`relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900 \${className}\`}
      style={backgroundImage ? { backgroundImage: \`url(\${backgroundImage})\`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />}
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {subtitle && (
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium mb-6">
            {subtitle}
          </span>
        )}
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        
        {description && (
          <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
            {description}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <${linkComponent}
            href={ctaHref}
            className="px-8 py-4 bg-white text-blue-600 dark:text-blue-700 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {ctaText}
          </${linkComponent}>
          
          {secondaryCtaText && secondaryCtaHref && (
            <${linkComponent}
              href={secondaryCtaHref}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              {secondaryCtaText}
            </${linkComponent}>
          )}
        </div>
      </div>
    </section>
  );
}
`;
}

function generateModalComponent(name: string, framework: string): string {
  return `"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ${name}Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export default function ${name}({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}: ${name}Props) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={\`relative w-full \${sizes[size]} bg-white dark:bg-slate-800 rounded-xl shadow-2xl dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 \${className}\`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          {title && <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors ml-auto"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateTableComponent(name: string, framework: string): string {
  const useClient = framework === "nextjs" ? '"use client";\n\n' : "";
  
  return `${useClient}interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface ${name}Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export default function ${name}<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data available",
  className = "",
}: ${name}Props<T>) {
  return (
    <div className={\`overflow-x-auto bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 \${className}\`}>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={\`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors \${onRowClick ? "cursor-pointer" : ""}\`}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
`;
}

function generateGenericComponent(
  name: string,
  templateType: string,
  framework: string
): string {
  const useClient = framework === "nextjs" ? '"use client";\n\n' : "";
  
  if (templateType === "page") {
    return `${useClient}interface ${name}Props {
  title?: string;
  children?: React.ReactNode;
}

export default function ${name}({
  title = "${name}",
  children,
}: ${name}Props) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">{title}</h1>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 p-8 border border-slate-200 dark:border-slate-700">
          {children || (
            <p className="text-gray-600 dark:text-gray-400">
              This is a generated page template. Add your content here.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
`;
  }
  
  if (templateType === "layout") {
    return `${useClient}interface ${name}Props {
  children: React.ReactNode;
}

export default function ${name}({ children }: ${name}Props) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">App Name</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
          © ${new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
`;
  }
  
  // Default component
  return `${useClient}interface ${name}Props {
  children?: React.ReactNode;
  className?: string;
}

export default function ${name}({
  children,
  className = "",
}: ${name}Props) {
  return (
    <div className={\`p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 \${className}\`}>
      {children || (
        <p className="text-gray-600 dark:text-gray-400">
          This is a generated component. Add your content here.
        </p>
      )}
    </div>
  );
}
`;
}
