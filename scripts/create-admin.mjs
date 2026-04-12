import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

// Carregar .env.local manualmente
const envPath = resolve(process.cwd(), ".env.local");
const lines = readFileSync(envPath, "utf-8").split("\n");
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const idx = t.indexOf("=");
  if (idx === -1) continue;
  const key = t.slice(0, idx).trim();
  const val = t.slice(idx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const prisma = new PrismaClient();

const user = await prisma.user.upsert({
  where: { email: "ricardo8leandro@gmail.com" },
  update: { role: "ADMIN", status: "ACTIVE", name: "Ricardo" },
  create: { email: "ricardo8leandro@gmail.com", name: "Ricardo", role: "ADMIN", status: "ACTIVE" },
});

console.log("✅ Utilizador criado/atualizado:", user.email, "|", user.role, "|", user.status);
await prisma.$disconnect();
