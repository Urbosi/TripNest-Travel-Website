import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

/** Directories that are build artefacts or dependencies — never shown. */
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "coverage",
  ".turbo",
  "out",
]);

/** Files that are noise for a human reading the source. */
const SKIP_FILES = new Set(["package-lock.json", "next-env.d.ts", ".env", ".env.local"]);

/** Binary / generated extensions. */
const SKIP_EXT = new Set([
  ".zip",
  ".log",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".woff",
  ".woff2",
  ".tsbuildinfo",
]);

const MAX_BYTES = 220_000;

const LANGUAGES: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "tsx",
  ".js": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".json": "json",
  ".css": "css",
  ".md": "markdown",
  ".html": "html",
  ".svg": "html",
  ".yml": "yaml",
  ".yaml": "yaml",
  ".sh": "bash",
};

export type CodeFile = {
  path: string;
  size: number;
  lines: number;
  language: string;
};

export function languageFor(filePath: string): string {
  return LANGUAGES[path.extname(filePath).toLowerCase()] ?? "text";
}

function isTextFile(filePath: string, base: string): boolean {
  if (SKIP_FILES.has(base)) return false;
  if (SKIP_EXT.has(path.extname(base).toLowerCase())) return false;
  return true;
}

async function walk(dir: string, out: CodeFile[], depth = 0): Promise<void> {
  if (depth > 12) return;

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".gitignore" && entry.name !== ".env.example") {
      continue;
    }

    const abs = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(abs, out, depth + 1);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!isTextFile(abs, entry.name)) continue;

    const stat = await fs.stat(abs);
    if (stat.size > MAX_BYTES) continue;

    let lines = 0;
    try {
      const content = await fs.readFile(abs, "utf8");
      lines = content.length === 0 ? 0 : content.split("\n").length;
    } catch {
      continue;
    }

    out.push({
      path: path.relative(ROOT, abs).split(path.sep).join("/"),
      size: stat.size,
      lines,
      language: languageFor(abs),
    });
  }
}

let cache: { at: number; files: CodeFile[] } | null = null;
const TTL = 15_000;

/** Full list of readable source files in the project (cached briefly). */
export async function listSourceFiles(): Promise<CodeFile[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.files;

  const files: CodeFile[] = [];
  await walk(ROOT, files);
  files.sort((a, b) => a.path.localeCompare(b.path));

  cache = { at: Date.now(), files };
  return files;
}

/** Resolve a requested path safely inside the project root. */
export async function readSourceFile(
  requested: string,
): Promise<{ path: string; content: string; lines: number; language: string; size: number } | null> {
  const normalised = path.normalize(requested).replace(/^([.][.][/\\])+/, "");
  const abs = path.join(ROOT, normalised);

  // Refuse anything that escapes the project root.
  if (!abs.startsWith(ROOT)) return null;

  const known = await listSourceFiles();
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  if (!known.some((f) => f.path === rel)) return null;

  try {
    const content = await fs.readFile(abs, "utf8");
    return {
      path: rel,
      content,
      lines: content.length === 0 ? 0 : content.split("\n").length,
      language: languageFor(abs),
      size: Buffer.byteLength(content, "utf8"),
    };
  } catch {
    return null;
  }
}
