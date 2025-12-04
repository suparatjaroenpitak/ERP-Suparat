/**
 * Marketplace Template Schema
 * Templates stored under /templates with this metadata structure
 */

export interface MarketplaceTemplate {
  // Basic Info
  slug: string;
  componentName: string;
  title: string;
  description: string;
  
  // Categorization
  category: TemplateCategory;
  tags: string[];
  
  // Template Details
  templateType: "component" | "page" | "layout" | "section";
  framework: "nextjs" | "react" | "vue" | "html";
  
  // Stats
  likes: number;
  downloads: number;
  views: number;
  
  // Author Info
  author: {
    name: string;
    avatar?: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Preview
  previewImage?: string;
  livePreviewUrl?: string;
  
  // Technical
  dependencies: string[];
  props: PropDefinition[];
  
  // Features
  features: string[];
  responsive: boolean;
  darkMode: boolean;
  animated: boolean;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

export type TemplateCategory = 
  | "dashboard"
  | "landing"
  | "ecommerce"
  | "blog"
  | "portfolio"
  | "admin"
  | "marketing"
  | "saas"
  | "forms"
  | "tables"
  | "navigation"
  | "cards"
  | "modals"
  | "charts"
  | "authentication"
  | "pricing"
  | "testimonials"
  | "features"
  | "heroes"
  | "footers"
  | "other";

export const CATEGORY_INFO: Record<TemplateCategory, { label: string; icon: string; color: string }> = {
  dashboard: { label: "Dashboard", icon: "LayoutDashboard", color: "blue" },
  landing: { label: "Landing Page", icon: "Rocket", color: "purple" },
  ecommerce: { label: "E-commerce", icon: "ShoppingCart", color: "green" },
  blog: { label: "Blog", icon: "FileText", color: "orange" },
  portfolio: { label: "Portfolio", icon: "Briefcase", color: "pink" },
  admin: { label: "Admin Panel", icon: "Settings", color: "slate" },
  marketing: { label: "Marketing", icon: "Megaphone", color: "red" },
  saas: { label: "SaaS", icon: "Cloud", color: "cyan" },
  forms: { label: "Forms", icon: "ClipboardList", color: "indigo" },
  tables: { label: "Tables", icon: "Table", color: "teal" },
  navigation: { label: "Navigation", icon: "Menu", color: "amber" },
  cards: { label: "Cards", icon: "CreditCard", color: "violet" },
  modals: { label: "Modals", icon: "Maximize2", color: "fuchsia" },
  charts: { label: "Charts", icon: "BarChart3", color: "emerald" },
  authentication: { label: "Auth", icon: "Lock", color: "rose" },
  pricing: { label: "Pricing", icon: "DollarSign", color: "lime" },
  testimonials: { label: "Testimonials", icon: "Quote", color: "sky" },
  features: { label: "Features", icon: "Zap", color: "yellow" },
  heroes: { label: "Heroes", icon: "Star", color: "orange" },
  footers: { label: "Footers", icon: "ArrowDown", color: "gray" },
  other: { label: "Other", icon: "Package", color: "neutral" },
};

// Sample marketplace data for demonstration
export const SAMPLE_MARKETPLACE_DATA: MarketplaceTemplate[] = [
  {
    slug: "modern-dashboard",
    componentName: "ModernDashboard",
    title: "Modern Dashboard",
    description: "A sleek, responsive admin dashboard with charts, stats cards, and data tables. Perfect for SaaS applications.",
    category: "dashboard",
    tags: ["admin", "analytics", "charts", "responsive"],
    templateType: "page",
    framework: "nextjs",
    likes: 342,
    downloads: 1250,
    views: 5420,
    author: { name: "TemplateAI", avatar: "/avatars/ai.png" },
    createdAt: "2024-11-15T10:30:00Z",
    updatedAt: "2024-12-01T14:20:00Z",
    previewImage: "/previews/dashboard.png",
    dependencies: ["recharts", "lucide-react"],
    props: [],
    features: ["Dark mode", "Responsive", "Charts", "Data tables"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
  {
    slug: "hero-gradient",
    componentName: "HeroGradient",
    title: "Gradient Hero Section",
    description: "Eye-catching hero section with animated gradient background and CTA buttons.",
    category: "heroes",
    tags: ["hero", "gradient", "animation", "cta"],
    templateType: "section",
    framework: "nextjs",
    likes: 567,
    downloads: 2340,
    views: 8900,
    author: { name: "TemplateAI" },
    createdAt: "2024-10-20T08:00:00Z",
    updatedAt: "2024-11-28T16:45:00Z",
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", required: true, description: "Main heading text" },
      { name: "subtitle", type: "string", required: false, description: "Supporting text" },
    ],
    features: ["Animated gradient", "Responsive", "Customizable CTA"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
  {
    slug: "pricing-cards",
    componentName: "PricingCards",
    title: "Pricing Table",
    description: "Beautiful pricing cards with feature comparison, perfect for SaaS landing pages.",
    category: "pricing",
    tags: ["pricing", "cards", "saas", "features"],
    templateType: "component",
    framework: "nextjs",
    likes: 423,
    downloads: 1890,
    views: 6700,
    author: { name: "TemplateAI" },
    createdAt: "2024-11-01T12:00:00Z",
    updatedAt: "2024-11-25T09:30:00Z",
    dependencies: [],
    props: [
      { name: "plans", type: "Plan[]", required: true, description: "Array of pricing plans" },
    ],
    features: ["Monthly/yearly toggle", "Feature comparison", "Highlighted plan"],
    responsive: true,
    darkMode: true,
    animated: false,
  },
  {
    slug: "auth-form",
    componentName: "AuthForm",
    title: "Authentication Forms",
    description: "Complete login, register, and forgot password forms with validation.",
    category: "authentication",
    tags: ["auth", "login", "register", "forms"],
    templateType: "component",
    framework: "nextjs",
    likes: 678,
    downloads: 3200,
    views: 12400,
    author: { name: "TemplateAI" },
    createdAt: "2024-09-15T14:00:00Z",
    updatedAt: "2024-12-02T11:00:00Z",
    dependencies: ["react-hook-form", "zod"],
    props: [
      { name: "mode", type: "'login' | 'register' | 'forgot'", required: true, description: "Form mode" },
      { name: "onSubmit", type: "function", required: true, description: "Submit handler" },
    ],
    features: ["Form validation", "Social login buttons", "Password strength"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
  {
    slug: "ecommerce-card",
    componentName: "ProductCard",
    title: "Product Card",
    description: "Modern product card with image, rating, price, and add to cart button.",
    category: "ecommerce",
    tags: ["product", "card", "shop", "rating"],
    templateType: "component",
    framework: "nextjs",
    likes: 234,
    downloads: 980,
    views: 4500,
    author: { name: "TemplateAI" },
    createdAt: "2024-11-10T16:00:00Z",
    updatedAt: "2024-11-30T10:15:00Z",
    dependencies: [],
    props: [
      { name: "product", type: "Product", required: true, description: "Product data object" },
    ],
    features: ["Image zoom", "Rating stars", "Sale badge", "Quick view"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
  {
    slug: "data-table",
    componentName: "DataTable",
    title: "Advanced Data Table",
    description: "Feature-rich data table with sorting, filtering, pagination, and row selection.",
    category: "tables",
    tags: ["table", "data", "sorting", "filtering"],
    templateType: "component",
    framework: "nextjs",
    likes: 512,
    downloads: 2100,
    views: 7800,
    author: { name: "TemplateAI" },
    createdAt: "2024-10-05T09:00:00Z",
    updatedAt: "2024-11-20T13:30:00Z",
    dependencies: ["@tanstack/react-table"],
    props: [
      { name: "data", type: "T[]", required: true, description: "Table data array" },
      { name: "columns", type: "Column[]", required: true, description: "Column definitions" },
    ],
    features: ["Sorting", "Filtering", "Pagination", "Row selection", "Export"],
    responsive: true,
    darkMode: true,
    animated: false,
  },
  {
    slug: "testimonial-carousel",
    componentName: "TestimonialCarousel",
    title: "Testimonial Carousel",
    description: "Smooth testimonial carousel with avatar, quote, and company info.",
    category: "testimonials",
    tags: ["testimonial", "carousel", "reviews", "social-proof"],
    templateType: "component",
    framework: "nextjs",
    likes: 189,
    downloads: 750,
    views: 3200,
    author: { name: "TemplateAI" },
    createdAt: "2024-11-18T11:00:00Z",
    updatedAt: "2024-11-29T08:45:00Z",
    dependencies: ["embla-carousel-react"],
    props: [
      { name: "testimonials", type: "Testimonial[]", required: true, description: "Array of testimonials" },
    ],
    features: ["Auto-play", "Touch swipe", "Dots navigation", "Fade animation"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
  {
    slug: "feature-grid",
    componentName: "FeatureGrid",
    title: "Feature Grid",
    description: "Showcase your product features in a beautiful grid layout with icons.",
    category: "features",
    tags: ["features", "grid", "icons", "landing"],
    templateType: "component",
    framework: "nextjs",
    likes: 298,
    downloads: 1120,
    views: 4800,
    author: { name: "TemplateAI" },
    createdAt: "2024-10-25T15:00:00Z",
    updatedAt: "2024-11-22T17:20:00Z",
    dependencies: ["lucide-react"],
    props: [
      { name: "features", type: "Feature[]", required: true, description: "Array of features" },
    ],
    features: ["Icon support", "Hover animations", "Customizable columns"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
  {
    slug: "contact-form",
    componentName: "ContactForm",
    title: "Contact Form",
    description: "Professional contact form with validation and success state.",
    category: "forms",
    tags: ["contact", "form", "validation", "email"],
    templateType: "component",
    framework: "nextjs",
    likes: 156,
    downloads: 620,
    views: 2900,
    author: { name: "TemplateAI" },
    createdAt: "2024-11-05T10:00:00Z",
    updatedAt: "2024-11-27T14:10:00Z",
    dependencies: ["react-hook-form"],
    props: [
      { name: "onSubmit", type: "function", required: true, description: "Form submit handler" },
    ],
    features: ["Validation", "Success/error states", "Loading indicator"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
  {
    slug: "sidebar-nav",
    componentName: "SidebarNav",
    title: "Sidebar Navigation",
    description: "Collapsible sidebar navigation with icons, nested items, and tooltips.",
    category: "navigation",
    tags: ["sidebar", "navigation", "menu", "admin"],
    templateType: "component",
    framework: "nextjs",
    likes: 445,
    downloads: 1650,
    views: 6100,
    author: { name: "TemplateAI" },
    createdAt: "2024-10-12T08:30:00Z",
    updatedAt: "2024-11-18T12:00:00Z",
    dependencies: ["lucide-react"],
    props: [
      { name: "items", type: "NavItem[]", required: true, description: "Navigation items" },
      { name: "collapsed", type: "boolean", required: false, description: "Collapsed state" },
    ],
    features: ["Collapsible", "Nested items", "Active states", "Tooltips"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
  {
    slug: "stats-cards",
    componentName: "StatsCards",
    title: "Statistics Cards",
    description: "Dashboard stats cards with icons, trends, and animated counters.",
    category: "cards",
    tags: ["stats", "cards", "dashboard", "analytics"],
    templateType: "component",
    framework: "nextjs",
    likes: 378,
    downloads: 1420,
    views: 5600,
    author: { name: "TemplateAI" },
    createdAt: "2024-10-30T13:00:00Z",
    updatedAt: "2024-11-24T16:30:00Z",
    dependencies: [],
    props: [
      { name: "stats", type: "Stat[]", required: true, description: "Array of statistics" },
    ],
    features: ["Animated counters", "Trend indicators", "Icon support"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
  {
    slug: "blog-card",
    componentName: "BlogCard",
    title: "Blog Post Card",
    description: "Clean blog post card with featured image, author, date, and excerpt.",
    category: "blog",
    tags: ["blog", "card", "post", "article"],
    templateType: "component",
    framework: "nextjs",
    likes: 267,
    downloads: 890,
    views: 3800,
    author: { name: "TemplateAI" },
    createdAt: "2024-11-08T09:30:00Z",
    updatedAt: "2024-11-26T11:45:00Z",
    dependencies: [],
    props: [
      { name: "post", type: "BlogPost", required: true, description: "Blog post data" },
    ],
    features: ["Featured image", "Category badge", "Read time", "Hover effects"],
    responsive: true,
    darkMode: true,
    animated: true,
  },
];
