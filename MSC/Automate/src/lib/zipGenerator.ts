import fs from "fs/promises";
import path from "path";
import { createReadStream, createWriteStream } from "fs";
import archiver from "archiver";

/**
 * Generate a zip file from a template folder
 * @param slug - The template slug (folder name)
 * @returns Buffer containing the zip file data
 */
export async function generateTemplateZip(slug: string): Promise<Buffer> {
  const templatesDir = path.join(process.cwd(), "src", "templates", slug);
  
  // Check if template folder exists
  try {
    await fs.access(templatesDir);
  } catch {
    throw new Error(`Template folder not found: ${slug}`);
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    archive.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on("error", (err) => {
      reject(err);
    });

    // Add the entire template folder to the zip
    archive.directory(templatesDir, slug);

    // Finalize the archive
    archive.finalize();
  });
}

/**
 * Get template metadata for the zip
 * @param slug - The template slug
 * @returns Metadata object or null if not found
 */
export async function getTemplateMetadata(slug: string): Promise<{
  componentName: string;
  description: string;
  templateType: string;
  createdAt: string;
} | null> {
  const metadataPath = path.join(
    process.cwd(),
    "src",
    "templates",
    slug,
    "metadata.json"
  );

  try {
    const content = await fs.readFile(metadataPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * List all files in a template folder
 * @param slug - The template slug
 * @returns Array of file names
 */
export async function listTemplateFiles(slug: string): Promise<string[]> {
  const templatesDir = path.join(process.cwd(), "src", "templates", slug);
  
  try {
    const files = await fs.readdir(templatesDir);
    return files;
  } catch {
    return [];
  }
}

/**
 * Check if a template exists
 * @param slug - The template slug
 * @returns boolean
 */
export async function templateExists(slug: string): Promise<boolean> {
  const templatesDir = path.join(process.cwd(), "src", "templates", slug);
  
  try {
    await fs.access(templatesDir);
    return true;
  } catch {
    return false;
  }
}
