/**
 * Gera um magic link de acesso direto no banco local.
 * Uso: npm run tool:gen-magic-link -- <email>
 * Deletar após uso.
 */
import { createHash, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const email = process.argv[2];
if (!email) {
  console.error("Uso: npm run tool:gen-magic-link -- <email>");
  process.exit(1);
}

const BASE_URL = process.env.AUTH_URL ?? "http://localhost:3000";

const isLocal = process.env.DATABASE_URL?.includes("localhost") ?? false;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  // Auth.js armazena o SHA-256 do token raw no DB
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(`${rawToken}${process.env.AUTH_SECRET}`).digest("hex");

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  // Remove token anterior para o mesmo email (evita conflito)
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: { identifier: email, token: hashedToken, expires },
  });

  const callbackUrl = encodeURIComponent(`${BASE_URL}/portal`);
  const magicLink = `${BASE_URL}/api/auth/callback/nodemailer?callbackUrl=${callbackUrl}&token=${rawToken}&email=${encodeURIComponent(email)}`;

  console.log("\n✅ Magic link gerado (válido por 24h):\n");
  console.log(magicLink);
  console.log("\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
