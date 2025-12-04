// Template Prompt Engine
// Enhances user prompts with layout, colors, and component structure based on template style

export type TemplateStyle = 
  | "dashboard" 
  | "admin-lte" 
  | "landing-page" 
  | "ecommerce" 
  | "profile";

export type TemplateType = "component" | "page" | "layout";

export interface PromptEnhancementOptions {
  userPrompt: string;
  templateStyle: TemplateStyle;
  templateType: TemplateType;
  framework?: "react" | "nextjs";
}

export interface TemplateStyleConfig {
  name: string;
  description: string;
  layout: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  components: string[];
  typography: string;
  spacing: string;
  additionalInstructions: string[];
}

// ============================================
// Template Style Configurations
// ============================================

const TEMPLATE_CONFIGS: Record<TemplateStyle, TemplateStyleConfig> = {
  dashboard: {
    name: "Dashboard",
    description: "Modern admin dashboard with data visualization and analytics",
    layout: `
      - Fixed sidebar navigation (240px width) on the left
      - Top header bar with search, notifications, and user profile
      - Main content area with grid-based card layout
      - Responsive: sidebar collapses to icons on tablet, hidden on mobile with hamburger menu
      - Footer with copyright and links (optional)
    `,
    colorPalette: {
      primary: "blue-600 (primary actions, active states)",
      secondary: "slate-600 (secondary text, icons)",
      accent: "emerald-500 (success), amber-500 (warning), red-500 (error)",
      background: "slate-50 (main bg), white (cards), slate-900 (dark sidebar option)",
      text: "slate-900 (headings), slate-600 (body), slate-400 (muted)",
      border: "slate-200 (light borders), slate-300 (input borders)",
    },
    components: [
      "Sidebar with logo, navigation links, and collapsible sections",
      "Header with breadcrumb, search bar, notification bell, and user dropdown",
      "Stat cards with icons, values, and percentage changes",
      "Charts area (placeholder for charts)",
      "Data tables with sorting and pagination",
      "Activity feed or recent items list",
      "Quick action buttons",
    ],
    typography: "Inter or system-ui font, text-sm for body, text-xs for labels, font-semibold for headings",
    spacing: "p-6 for main content, gap-6 for grid, p-4 for cards",
    additionalInstructions: [
      "Include loading states for data components",
      "Add hover effects on interactive elements",
      "Use shadow-sm for cards, shadow-md on hover",
      "Include empty states for tables/lists",
    ],
  },

  "admin-lte": {
    name: "Admin LTE Style",
    description: "Classic admin panel with traditional layout inspired by AdminLTE",
    layout: `
      - Fixed top navbar (dark themed, 56px height)
      - Fixed left sidebar (230px width) with tree menu navigation
      - Content wrapper with content-header (page title + breadcrumb) and main content
      - Control sidebar option on the right for settings
      - Small footer at bottom
    `,
    colorPalette: {
      primary: "blue-500 (primary), indigo-600 (info)",
      secondary: "slate-700 (sidebar bg), slate-800 (navbar bg)",
      accent: "green-500 (success), yellow-500 (warning), red-500 (danger), cyan-500 (info)",
      background: "slate-100 (content bg), white (boxes), slate-800 (dark elements)",
      text: "slate-800 (headings), slate-600 (body), white (on dark bg)",
      border: "slate-300 (box borders), slate-600 (dark borders)",
    },
    components: [
      "Main navbar with logo, sidebar toggle, search, messages, notifications, user menu",
      "Sidebar with user panel, search form, and tree-view menu",
      "Content header with page title and breadcrumb",
      "Info boxes with icons and statistics",
      "Box widgets with headers, body, and optional footer",
      "Tables with striped rows and bordered style",
      "Form elements with input groups",
      "Small box stats with colored backgrounds",
    ],
    typography: "Source Sans Pro or system font, 14px base, bold headings",
    spacing: "p-4 content padding, mb-4 for boxes, p-3 for box body",
    additionalInstructions: [
      "Use box-shadow for depth on widgets",
      "Include colored left border on info boxes",
      "Add icon backgrounds in circles for stat boxes",
      "Tree menu with expand/collapse arrows",
    ],
  },

  "landing-page": {
    name: "Landing Page",
    description: "Marketing landing page with hero section and conversion focus",
    layout: `
      - Sticky transparent/white navbar that changes on scroll
      - Full-width hero section with headline, subheadline, CTA buttons
      - Features section with icon cards (3-4 columns)
      - Social proof section (testimonials, logos, stats)
      - Pricing section with pricing cards
      - FAQ accordion section
      - CTA banner section
      - Footer with links, social icons, newsletter signup
    `,
    colorPalette: {
      primary: "violet-600 or blue-600 (CTA buttons, links)",
      secondary: "slate-600 (secondary buttons, text)",
      accent: "amber-400 (highlights), emerald-500 (success badges)",
      background: "white (main), slate-50 (alternating sections), gradient hero",
      text: "slate-900 (headlines), slate-600 (body), slate-400 (captions)",
      border: "slate-200 (subtle dividers)",
    },
    components: [
      "Navigation bar with logo, nav links, and CTA button",
      "Hero section with large heading, description, email capture or CTA buttons, hero image/illustration",
      "Trusted by / Logo cloud section",
      "Features grid with icons, titles, and descriptions",
      "How it works / Process steps section",
      "Testimonial cards with avatar, quote, name, role",
      "Pricing table with popular plan highlighted",
      "FAQ accordion",
      "Final CTA section with background",
      "Footer with columns of links and social icons",
    ],
    typography: "Modern sans-serif, text-5xl/6xl for hero heading, text-xl for subheading, text-lg for section titles",
    spacing: "py-20 for sections, max-w-7xl container, gap-8 for grids",
    additionalInstructions: [
      "Use gradient backgrounds for hero section",
      "Add subtle animations on scroll (fade-in)",
      "Include social proof numbers/stats",
      "Mobile-first responsive design",
      "Smooth scroll for anchor links",
    ],
  },

  ecommerce: {
    name: "Ecommerce",
    description: "Online store with product displays and shopping features",
    layout: `
      - Header with logo, search bar, cart icon with count, user menu
      - Category navigation bar or mega menu
      - Product grid layout (4 columns desktop, 2 mobile)
      - Sidebar filters on category pages
      - Product detail with image gallery, info, add to cart
      - Shopping cart sidebar or page
      - Footer with store info, policies, payment icons
    `,
    colorPalette: {
      primary: "rose-600 or orange-500 (buy buttons, sale tags)",
      secondary: "slate-700 (text), slate-500 (secondary)",
      accent: "green-600 (in stock), red-600 (sale), yellow-400 (ratings stars)",
      background: "white (main), slate-50 (sections), slate-900 (footer option)",
      text: "slate-900 (product titles), slate-600 (descriptions), slate-400 (meta)",
      border: "slate-200 (cards), slate-300 (inputs)",
    },
    components: [
      "Header with search, cart, wishlist, account icons",
      "Category mega menu or horizontal nav",
      "Product card with image, title, price, rating, add to cart",
      "Product image gallery with thumbnails",
      "Size/variant selector buttons",
      "Quantity selector with +/- buttons",
      "Add to cart / Buy now buttons",
      "Filter sidebar with checkboxes, range sliders, color swatches",
      "Sort dropdown",
      "Pagination or infinite scroll",
      "Cart summary with item list and totals",
      "Recently viewed products carousel",
    ],
    typography: "Clean sans-serif, product titles font-medium, prices font-bold",
    spacing: "gap-4 product grid, p-4 product cards, py-12 sections",
    additionalInstructions: [
      "Product images should have hover zoom or swap effect",
      "Show original price crossed out next to sale price",
      "Include star rating display",
      "Badge for 'Sale', 'New', 'Bestseller'",
      "Skeleton loading for product grids",
    ],
  },

  profile: {
    name: "Profile",
    description: "User profile and account settings pages",
    layout: `
      - Profile header with cover photo and avatar
      - Tab navigation for profile sections
      - Two-column layout: sidebar with user info, main with content
      - Settings page with form sections
      - Activity timeline/feed
    `,
    colorPalette: {
      primary: "blue-600 (primary actions, links)",
      secondary: "slate-600 (secondary text)",
      accent: "emerald-500 (online status), amber-500 (badges)",
      background: "slate-100 (page bg), white (cards), gradient (cover photo)",
      text: "slate-900 (name), slate-600 (bio), slate-400 (meta info)",
      border: "slate-200 (card borders), slate-300 (form inputs)",
    },
    components: [
      "Cover photo banner with edit button",
      "Profile avatar (rounded-full, border) overlapping cover",
      "User name, username, bio, location, website",
      "Stats row: followers, following, posts counts",
      "Follow/Message/Edit Profile buttons",
      "Tab navigation: Posts, About, Photos, Friends, etc.",
      "About section with info cards",
      "Photo gallery grid",
      "Friends/Followers list with avatars",
      "Activity timeline with icons and timestamps",
      "Settings form with sections: profile, account, privacy, notifications",
    ],
    typography: "text-2xl font-bold for name, text-sm for meta, text-base for body",
    spacing: "p-6 for content areas, gap-4 for grids, mb-6 between sections",
    additionalInstructions: [
      "Avatar should have online/offline indicator option",
      "Include verification badge option",
      "Settings forms should have clear section dividers",
      "Add success/error states for form submissions",
      "Profile completeness indicator option",
    ],
  },
};

// ============================================
// Component Structure Templates
// ============================================

const COMPONENT_STRUCTURES: Record<TemplateType, Record<TemplateStyle, string>> = {
  component: {
    dashboard: "Single reusable component like stat card, data table row, chart container, or notification item",
    "admin-lte": "Widget box, info box, small box, timeline item, or direct chat message component",
    "landing-page": "Feature card, testimonial card, pricing card, FAQ item, or CTA button component",
    ecommerce: "Product card, cart item, filter checkbox, rating stars, or quantity selector component",
    profile: "Profile card, stat item, activity item, settings toggle, or avatar component",
  },
  page: {
    dashboard: "Full dashboard page with sidebar, header, and main content area containing stats, charts, and tables",
    "admin-lte": "Complete admin page with navbar, sidebar, content-header, boxes, and footer",
    "landing-page": "Full landing page with all sections: hero, features, testimonials, pricing, FAQ, and footer",
    ecommerce: "Product listing page with filters, product grid, and pagination OR product detail page with gallery and info",
    profile: "Complete profile page with cover, avatar, user info, tabs, and content sections",
  },
  layout: {
    dashboard: "Dashboard shell layout with sidebar navigation and header, children render in main content area",
    "admin-lte": "AdminLTE-style layout wrapper with navbar, sidebar, and content-wrapper for children",
    "landing-page": "Marketing site layout with sticky navbar and footer, children render between them",
    ecommerce: "Store layout with header (search, cart), optional category nav, and footer with children in between",
    profile: "Profile/account layout with sidebar navigation for settings sections and main content area",
  },
};

// ============================================
// Main Prompt Enhancement Function
// ============================================

export function enhancePrompt(options: PromptEnhancementOptions): string {
  const { userPrompt, templateStyle, templateType, framework = "nextjs" } = options;
  
  const config = TEMPLATE_CONFIGS[templateStyle];
  const componentStructure = COMPONENT_STRUCTURES[templateType][templateStyle];
  
  // Build the enhanced prompt
  const enhancedPrompt = `
## Task
Generate a ${templateType} for a ${config.name} using TailwindCSS and ${framework === "nextjs" ? "Next.js" : "React"}.

## User Requirements
${userPrompt}

## Template Style: ${config.name}
${config.description}

## Layout Design
${config.layout}

## Color Palette (TailwindCSS classes)
- Primary: ${config.colorPalette.primary}
- Secondary: ${config.colorPalette.secondary}
- Accent: ${config.colorPalette.accent}
- Background: ${config.colorPalette.background}
- Text: ${config.colorPalette.text}
- Border: ${config.colorPalette.border}

## Component Structure for ${templateType}
${componentStructure}

## Recommended Components to Include
${config.components.map((c, i) => `${i + 1}. ${c}`).join("\n")}

## Typography Guidelines
${config.typography}

## Spacing Guidelines
${config.spacing}

## Additional Instructions
${config.additionalInstructions.map((i) => `- ${i}`).join("\n")}

## Technical Requirements
- Use TypeScript with proper interfaces for props
- Use TailwindCSS utility classes only (no custom CSS)
- Make it fully responsive (mobile-first)
- Include hover and focus states for interactive elements
- Export as default function component
${framework === "nextjs" ? '- Add "use client" directive if using React hooks or event handlers' : ""}
- Use semantic HTML elements
- Include aria attributes for accessibility where appropriate

Generate clean, production-ready code.
`.trim();

  return enhancedPrompt;
}

// ============================================
// Quick Prompt Enhancement (Simpler version)
// ============================================

export function quickEnhancePrompt(
  userPrompt: string,
  templateStyle: TemplateStyle
): string {
  const config = TEMPLATE_CONFIGS[templateStyle];
  
  return `Generate a ${config.name} using TailwindCSS with requirements: ${userPrompt}. 
Use color scheme: primary ${config.colorPalette.primary}, background ${config.colorPalette.background}. 
Include: ${config.components.slice(0, 3).join(", ")}.`;
}

// ============================================
// Standard AI Prompt Format
// ============================================

export function formatAIPrompt(
  userPrompt: string,
  templateType: TemplateType
): string {
  return `Create a responsive modern webpage using TailwindCSS.
Type: ${templateType}
Requirements: ${userPrompt}
Return only the React component code, no explanation.
Must include layout, sections, buttons, hero, navigation.`;
}

// ============================================
// Full AI Prompt with Style Context
// ============================================

export function formatFullAIPrompt(
  userPrompt: string,
  templateType: TemplateType,
  templateStyle?: TemplateStyle
): string {
  const basePrompt = `Create a responsive modern webpage using TailwindCSS.
Type: ${templateType}
Requirements: ${userPrompt}
Return only the React component code, no explanation.
Must include layout, sections, buttons, hero, navigation.`;

  if (templateStyle) {
    const config = TEMPLATE_CONFIGS[templateStyle];
    return `${basePrompt}

Style: ${config.name}
Color Palette: Primary ${config.colorPalette.primary}, Secondary ${config.colorPalette.secondary}, Background ${config.colorPalette.background}
Components to include: ${config.components.slice(0, 5).join(", ")}
Layout: ${config.layout.split('\n').map(l => l.trim()).filter(l => l.startsWith('-')).slice(0, 3).join(' ')}`;
  }

  return basePrompt;
}

// ============================================
// Get Template Config (for UI display)
// ============================================

export function getTemplateConfig(style: TemplateStyle): TemplateStyleConfig {
  return TEMPLATE_CONFIGS[style];
}

export function getAllTemplateStyles(): Array<{
  value: TemplateStyle;
  label: string;
  description: string;
}> {
  return Object.entries(TEMPLATE_CONFIGS).map(([value, config]) => ({
    value: value as TemplateStyle,
    label: config.name,
    description: config.description,
  }));
}

// ============================================
// Export configurations for external use
// ============================================

export { TEMPLATE_CONFIGS, COMPONENT_STRUCTURES };
