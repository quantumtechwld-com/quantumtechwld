import { defineConfig } from "prisma/config";
import * as fs from "fs";
import * as path from "path";

// Carrega .env manual (Next.js não injeta em prisma.config.ts)
function loadEnvFile() {
  const candidates = [
    ".env.production.local",
    ".env.local",
    ".env",
  ];
  for (const file of candidates) {
    const envPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(envPath)) continue;
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
    break;
  }
}

loadEnvFile();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "",
  },
});
