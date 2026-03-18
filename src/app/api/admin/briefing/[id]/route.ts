import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { BriefingStatus } from "@prisma/client";

const VALID_STATUSES = new Set<BriefingStatus>([
  "RECEIVED",
  "IN_ANALYSIS",
  "PROPOSAL_SENT",
  "IN_NEGOTIATION",
  "APPROVED",
  "IN_PROGRESS",
  "DELIVERED",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;

  let body: { status?: string };
  try {
    body = (await req.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { status } = body;

  if (!status || !VALID_STATUSES.has(status as BriefingStatus)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const briefing = await prisma.briefing.findUnique({ where: { id } });
  if (!briefing) {
    return NextResponse.json({ error: "Briefing não encontrado." }, { status: 404 });
  }

  const updated = await prisma.briefing.update({
    where: { id },
    data: { status: status as BriefingStatus },
    select: { id: true, status: true },
  });

  return NextResponse.json({ briefing: updated });
}
