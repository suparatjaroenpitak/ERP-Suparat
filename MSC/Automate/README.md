# Template Generator

A Next.js 14 project for generating frontend templates with TailwindCSS.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # API endpoint for template generation
│   ├── globals.css           # Global styles with Tailwind
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page with generator UI
├── components/
│   ├── generator/
│   │   ├── TemplateGenerator.tsx   # Main generator component
│   │   ├── PromptInput.tsx         # Textarea for prompts
│   │   ├── CodePreview.tsx         # Code preview with copy/download
│   │   ├── TemplateSelector.tsx    # Template type selector
│   │   └── index.ts                # Exports
│   └── index.ts
├── lib/
│   ├── templateEngine.ts     # Template generation logic
│   └── api.ts                # API utilities
├── templates/
│   ├── Button.tsx            # Button template
│   ├── Card.tsx              # Card template
│   ├── Navbar.tsx            # Navbar template
│   ├── Hero.tsx              # Hero section template
│   ├── Form.tsx              # Form template
│   └── index.ts              # Template exports
└── types/
    └── index.ts              # TypeScript type definitions
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 🎨 **Template Generator UI** - Textarea prompt with live preview
- 🔧 **API Endpoint** - `/api/generate` for programmatic access
- 📦 **Pre-built Templates** - Button, Card, Navbar, Hero, Form
- 📋 **Copy & Download** - Easily copy or download generated code
- 🎯 **TypeScript** - Full type safety
- 💅 **TailwindCSS** - Modern styling with utility classes

## API Usage

### Generate Template

```bash
POST /api/generate
Content-Type: application/json

{
  "prompt": "Create a button component",
  "templateType": "component",
  "framework": "nextjs"
}
```

### Response

```json
{
  "success": true,
  "code": "// Generated code...",
  "metadata": {
    "templateType": "component",
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "promptUsed": "Create a button component"
  }
}
```

## Tech Stack

- **Next.js 14** - React framework
- **React 18** - UI library
- **TailwindCSS** - Utility-first CSS
- **TypeScript** - Type safety
- **Lucide React** - Icons

## License

MIT
