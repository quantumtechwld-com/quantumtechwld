import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/proposal/[id]/comments ─────────────────────────────────────────
// Retorna todos os comentários da proposta.

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const proposal = await db.proposal.findUnique({
      where: { id },
      include: { briefing: { include: { user: { select: { email: true } } } } },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
    }

    if (
      session.user.role !== "ADMIN" &&
      proposal.briefing.user.email !== session.user.email
    ) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const comments = await db.proposalComment.findMany({
      where: { proposalId: id },
      include: { author: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/proposal/[id]/comments]", err);
    return NextResponse.json(
      {
        error: "Erro ao carregar comentários.",
        detail: process.env.NODE_ENV === "production" ? undefined : msg,
      },
      { status: 500 },
    );
  }
}

// ─── POST /api/proposal/[id]/comments ────────────────────────────────────────
// Adiciona um comentário. Corpo: { excerpt, body }

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const payload = (await request.json()) as { excerpt?: string; body?: string };

    if (!payload.body?.trim()) {
      return NextResponse.json({ error: "O comentário não pode estar vazio." }, { status: 422 });
    }

    const proposal = await db.proposal.findUnique({
      where: { id },
      include: { briefing: { include: { user: { select: { email: true } } } } },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
    }

    if (
      session.user.role !== "ADMIN" &&
      proposal.briefing.user.email !== session.user.email
    ) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
    }

    const comment = await db.proposalComment.create({
      data: {
        proposalId: id,
        authorId: user.id,
        excerpt: payload.excerpt ?? "",
        body: payload.body.trim(),
      },
      include: { author: { select: { name: true, email: true, role: true } } },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/proposal/[id]/comments]", err);
    return NextResponse.json(
      {
        error: "Erro ao guardar comentário. Tente novamente.",
        detail: process.env.NODE_ENV === "production" ? undefined : msg,
      },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/proposal/[id]/comments ───────────────────────────────────────
// Resolve um comentário. Corpo: { commentId }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas admin pode resolver comentários." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { commentId?: string };

  if (!body.commentId) {
    return NextResponse.json({ error: "commentId obrigatório." }, { status: 422 });
  }

  let comment;
  try {
    comment = await db.proposalComment.findFirst({
      where: { id: body.commentId, proposalId: id },
    });
  } catch (err) {
    console.error("[PATCH /api/proposal/[id]/comments]", err);
    return NextResponse.json({ error: "Erro ao aceder ao comentário." }, { status: 500 });
  }

  if (!comment) {
    return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
  }

  const updated = await db.proposalComment.update({
    where: { id: body.commentId },
    data: { resolved: true },
  });

  return NextResponse.json({ comment: updated });
}
