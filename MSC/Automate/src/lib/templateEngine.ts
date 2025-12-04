// Template Engine - Generates code based on prompts
// This is a simplified version. In production, integrate with AI APIs.

interface GenerateOptions {
  prompt: string;
  templateType: "component" | "page" | "layout";
  framework: "react" | "nextjs";
}

// Template patterns for common UI components
const templatePatterns: Record<string, string> = {
  button: `interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${disabled ? "opacity-50 cursor-not-allowed" : ""}\`}
    >
      {children}
    </button>
  );
}`,

  card: `interface CardProps {
  title: string;
  description?: string;
  image?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export default function Card({
  title,
  description,
  image,
  children,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
        {description && (
          <p className="text-slate-600 mb-4">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}`,

  navbar: `"use client";

import { useState } from "react";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  logo?: string;
  items?: NavItem[];
}

export default function Navbar({
  logo = "Logo",
  items = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ],
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary-600">
            {logo}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-600 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-slate-600 hover:text-primary-600"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}`,

  form: `"use client";

import { useState, FormEvent } from "react";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea";
  placeholder?: string;
  required?: boolean;
}

interface FormProps {
  title?: string;
  fields?: FormField[];
  submitLabel?: string;
  onSubmit?: (data: Record<string, string>) => void;
}

export default function Form({
  title = "Contact Form",
  fields = [
    { name: "name", label: "Name", type: "text", placeholder: "Your name", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "your@email.com", required: true },
    { name: "message", label: "Message", type: "textarea", placeholder: "Your message...", required: true },
  ],
  submitLabel = "Submit",
  onSubmit,
}: FormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (onSubmit) {
      await onSubmit(formData);
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto">
      {title && <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>}
      
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}`,

  hero: `interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  backgroundImage?: string;
}

export default function Hero({
  title = "Welcome to Our Platform",
  subtitle = "Build amazing products with our powerful tools and services",
  ctaText = "Get Started",
  ctaHref = "#",
  backgroundImage,
}: HeroProps) {
  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800"
      style={backgroundImage ? { backgroundImage: \`url(\${backgroundImage})\`, backgroundSize: "cover" } : {}}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/50" />}
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8">
          {subtitle}
        </p>
        <a
          href={ctaHref}
          className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-colors shadow-lg"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}`,

  default: `interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Component({ children, className = "" }: ComponentProps) {
  return (
    <div className={\`p-6 bg-white rounded-xl shadow-md \${className}\`}>
      {children || (
        <p className="text-slate-600">
          Your content goes here. Customize this component as needed.
        </p>
      )}
    </div>
  );
}`,
};

// Detect what template to use based on prompt keywords
function detectTemplateType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("button") || lowerPrompt.includes("btn")) return "button";
  if (lowerPrompt.includes("card")) return "card";
  if (lowerPrompt.includes("nav") || lowerPrompt.includes("header") || lowerPrompt.includes("menu")) return "navbar";
  if (lowerPrompt.includes("form") || lowerPrompt.includes("input") || lowerPrompt.includes("contact")) return "form";
  if (lowerPrompt.includes("hero") || lowerPrompt.includes("banner") || lowerPrompt.includes("landing")) return "hero";
  
  return "default";
}

export async function generateTemplate(options: GenerateOptions): Promise<string> {
  const { prompt, templateType, framework } = options;
  
  // Detect template type from prompt
  const detectedType = detectTemplateType(prompt);
  
  // Get base template
  let template = templatePatterns[detectedType] || templatePatterns.default;
  
  // Add framework-specific imports
  const imports = framework === "nextjs" 
    ? `// Next.js Component\n`
    : `// React Component\n`;
  
  // Wrap with metadata comment
  const metadata = `/**
 * Generated Template
 * Type: ${templateType}
 * Framework: ${framework}
 * Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? "..." : ""}
 * Generated: ${new Date().toISOString()}
 */\n\n`;

  return `${metadata}${imports}${template}`;
}
