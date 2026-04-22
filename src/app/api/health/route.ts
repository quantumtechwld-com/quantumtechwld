import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/health
// Rota pública — sem autenticação.
// Usada por monitores externos (Better Stack, UptimeRobot, etc.) para verificar
// se a aplicação está respondendo e com acesso ao banco de dados.
//
// 200 → { status: "ok",    timestamp, uptime }
// 503 → { status: "error", error: "db_unreachable" }

export async function GET(): Promise<NextResponse> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: Date.now(),
        uptime: Math.floor(process.uptime()),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { status: "error", error: "db_unreachable" },
      { status: 503 },
    );
  }
}
