/**
 * Executa migração de dados via raw SQL
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const sqlPath = path.join(process.cwd(), "scripts", "migrate-order-proposals.sql");
const sql = fs.readFileSync(sqlPath, "utf-8");

console.log("🔄 Executando migração de dados via Prisma...\n");

try {
  // Executar via prisma db execute
  const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = execFileSync(npxBin, ["prisma", "db", "execute", "--stdin"], {
    input: sql,
    encoding: "utf-8",
  });
  
  console.log(result);
  console.log("\n✅ Migração concluída com sucesso!");
} catch (error) {
  console.error("❌ Erro ao executar migração:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
