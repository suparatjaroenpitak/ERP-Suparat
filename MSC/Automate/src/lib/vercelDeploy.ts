import fs from "fs/promises";
import path from "path";
import archiver from "archiver";

/**
 * Vercel deployment configuration
 */
export interface VercelConfig {
  version: number;
  name: string;
  builds: Array<{
    src: string;
    use: string;
  }>;
  routes?: Array<{
    src: string;
    dest: string;
  }>;
  env?: Record<string, string>;
  framework?: string;
  installCommand?: string;
  buildCommand?: string;
  outputDirectory?: string;
}

/**
 * Deployment result from mock function
 */
export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  url: string;
  status: "queued" | "building" | "ready" | "error";
  createdAt: string;
  projectName: string;
  error?: string;
}

/**
 * Generate a vercel.json configuration for a template
 * @param componentName - The name of the component/project
 * @param templateType - The type of template (component, page, etc.)
 * @returns VercelConfig object
 */
export function generateVercelConfig(
  componentName: string,
  templateType: string = "component"
): VercelConfig {
  const projectName = componentName
    .toLowerCase()
    .replace(/([A-Z])/g, "-$1")
    .replace(/^-/, "")
    .replace(/[^a-z0-9-]/g, "-");

  const config: VercelConfig = {
    version: 2,
    name: projectName,
    framework: "nextjs",
    buildCommand: "next build",
    installCommand: "npm install",
    outputDirectory: ".next",
    builds: [
      {
        src: "package.json",
        use: "@vercel/next",
      },
    ],
    routes: [
      {
        src: "/(.*)",
        dest: "/$1",
      },
    ],
    env: {
      NODE_ENV: "production",
    },
  };

  return config;
}

/**
 * Generate a complete deployable project zip with vercel.json
 * @param slug - The template slug
 * @param componentName - The component name for the project
 * @returns Buffer containing the deployment zip
 */
export async function generateDeploymentZip(
  slug: string,
  componentName: string
): Promise<Buffer> {
  const templatesDir = path.join(process.cwd(), "src", "templates", slug);

  // Check if template folder exists
  try {
    await fs.access(templatesDir);
  } catch {
    throw new Error(`Template folder not found: ${slug}`);
  }

  // Read metadata if available
  let templateType = "component";
  try {
    const metadataPath = path.join(templatesDir, "metadata.json");
    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(metadataContent);
    templateType = metadata.templateType || "component";
  } catch {
    // Use default template type
  }

  // Generate vercel.json config
  const vercelConfig = generateVercelConfig(componentName, templateType);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on("error", (err: Error) => {
      reject(err);
    });

    // Add the template folder contents
    archive.directory(templatesDir, false);

    // Add vercel.json to the root
    archive.append(JSON.stringify(vercelConfig, null, 2), {
      name: "vercel.json",
    });

    // Add a basic package.json if not exists
    const packageJson = {
      name: vercelConfig.name,
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        next: "14.0.4",
        react: "^18",
        "react-dom": "^18",
      },
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        typescript: "^5",
        tailwindcss: "^3.3.0",
        autoprefixer: "^10.0.1",
        postcss: "^8",
      },
    };

    archive.append(JSON.stringify(packageJson, null, 2), {
      name: "package.json",
    });

    // Add basic Next.js config
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`;
    archive.append(nextConfig, { name: "next.config.js" });

    // Add tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    archive.append(tailwindConfig, { name: "tailwind.config.js" });

    // Add postcss config
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    archive.append(postcssConfig, { name: "postcss.config.js" });

    // Add tsconfig
    const tsConfig = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: {
          "@/*": ["./*"],
        },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    };
    archive.append(JSON.stringify(tsConfig, null, 2), { name: "tsconfig.json" });

    // Finalize the archive
    archive.finalize();
  });
}

/**
 * Mock function to simulate deploying to Vercel
 * In a real implementation, this would call the Vercel API
 * @param zipBuffer - The deployment zip file buffer
 * @param projectName - The name of the project
 * @returns DeploymentResult
 */
export async function deployToVercel(
  zipBuffer: Buffer,
  projectName: string
): Promise<DeploymentResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Generate mock deployment data
  const deploymentId = `dpl_${generateRandomId(20)}`;
  const projectSlug = projectName
    .toLowerCase()
    .replace(/([A-Z])/g, "-$1")
    .replace(/^-/, "")
    .replace(/[^a-z0-9-]/g, "-");

  // Simulate occasional errors (10% chance)
  if (Math.random() < 0.1) {
    return {
      success: false,
      deploymentId,
      url: "",
      status: "error",
      createdAt: new Date().toISOString(),
      projectName: projectSlug,
      error: "Simulated deployment error. Please try again.",
    };
  }

  // Return successful deployment result
  return {
    success: true,
    deploymentId,
    url: `https://${projectSlug}-${generateRandomId(8)}.vercel.app`,
    status: "ready",
    createdAt: new Date().toISOString(),
    projectName: projectSlug,
  };
}

/**
 * Generate a random alphanumeric ID
 */
function generateRandomId(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
