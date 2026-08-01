import type { NextConfig } from "next";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

const ENGINE_SRC = join(process.cwd(), "src/generated/prisma");
const CHUNKS_DIR = join(process.cwd(), ".next/server/chunks");

function copyEnginesToChunks(destDir: string) {
  if (!existsSync(ENGINE_SRC)) return;
  const engines = readdirSync(ENGINE_SRC).filter(
    (f) => /query_engine/.test(f) || /libquery_engine/.test(f)
  );
  if (engines.length === 0) return;
  mkdirSync(destDir, { recursive: true });
  for (const file of engines) {
    const src = join(ENGINE_SRC, file);
    if (statSync(src).isFile()) {
      copyFileSync(src, join(destDir, file));
    }
  }
}

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": [
      "./src/generated/prisma/**/*",
      "./.next/server/chunks/**/*",
    ],
    "/api/**/*": [
      "./src/generated/prisma/**/*",
      "./.next/server/chunks/**/*",
    ],
  },
  webpack: (config) => {
    copyEnginesToChunks(CHUNKS_DIR);
    return config;
  },
};

export default nextConfig;
