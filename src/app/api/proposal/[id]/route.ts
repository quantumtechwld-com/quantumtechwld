import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  sendMail,
  tplProposalSent,
  tplProposalApproved,
  tplProposalApprovedClient,
  tplRevisionRequested,
} from "@/lib/email";

type ProposalStatus = "DRAFT" | "SENT" | "REVISION" | "APPROVED" | "REJECTED";

type ProposalDoc = {
  id: string;
  briefingId: string;
  status: ProposalStatus;
  costMin: number;
  costMax: number;
  hoursTotal: number;
  briefing: {
    projectType: string;
    user: { email: string; name?: string | null };
  };
};

type RouteContext = { params: Promise<{ id: string }> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// ─── GET /api/proposal/[id] ───────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
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

  return NextResponse.json({ proposal });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function handleSend(proposal: ProposalDoc) {
  if (proposal.status !== "DRAFT" && proposal.status !== "REVISION") {
    return NextResponse.json({ error: "Proposta já foi enviada." }, { status: 422 });
  }

  const updated = await db.proposal.update({
    where: { id: proposal.id },
    data: { status: "SENT" as ProposalStatus },
  });

  await prisma.briefing.update({
    where: { id: proposal.briefingId },
    data: { status: "PROPOSAL_SENT" as never },
  });

  // E-mail ao cliente
  const clientEmail: string = proposal.briefing.user.email;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const proposalUrl = `${baseUrl}/portal/briefing/${proposal.briefingId}/proposta`;

  await sendMail({
    to: clientEmail,
    subject: `A sua proposta para "${proposal.briefing.projectType}" está pronta`,
    html: tplProposalSent({
      clientName: proposal.briefing.user.name ?? "",
      projectType: proposal.briefing.projectType,
      proposalUrl,
      costMin: proposal.costMin,
      costMax: proposal.costMax,
      hoursTotal: proposal.hoursTotal,
    }),
  }).catch(() => { /* falha silenciosa de e-mail não bloqueia a resposta */ });

  // Webhook n8n
  await triggerN8n("proposal_sent", {
    briefingId: proposal.briefingId,
    proposalId: proposal.id,
    clientEmail,
    projectType: proposal.briefing.projectType,
    proposalUrl,
    costMin: proposal.costMin,
    costMax: proposal.costMax,
    hoursTotal: proposal.hoursTotal,
  });

  return NextResponse.json({ proposal: updated });
}

async function handleApprove(proposal: ProposalDoc) {
  if (proposal.status !== "SENT") {
    return NextResponse.json({ error: "Proposta não está em estado SENT." }, { status: 422 });
  }

  const updated = await db.proposal.update({
    where: { id: proposal.id },
    data: { status: "APPROVED" as ProposalStatus, reviewedAt: new Date() },
  });

  await prisma.briefing.update({
    where: { id: proposal.briefingId },
    data: { status: "APPROVED" as never },
  });

  const clientEmail: string = proposal.briefing.user.email;
  const adminEmail = process.env.EMAIL_SERVER_USER ?? "";
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const adminUrl = `${baseUrl}/admin/briefing/${proposal.briefingId}`;

  // E-mail ao admin
  await sendMail({
    to: adminEmail,
    subject: `✅ Proposta aprovada — ${proposal.briefing.projectType}`,
    html: tplProposalApproved({
      adminEmail,
      clientEmail,
      projectType: proposal.briefing.projectType,
      adminUrl,
    }),
  }).catch(() => {});

  // E-mail ao cliente
  await sendMail({
    to: clientEmail,
    subject: "Proposta aprovada — bem-vindo a bordo!",
    html: tplProposalApprovedClient({
      clientName: proposal.briefing.user.name ?? "",
      projectType: proposal.briefing.projectType,
    }),
  }).catch(() => {});

  // Webhook n8n
  await triggerN8n("proposal_approved", {
    briefingId: proposal.briefingId,
    proposalId: proposal.id,
    clientEmail,
    projectType: proposal.briefing.projectType,
    adminUrl,
  });

  return NextResponse.json({ proposal: updated });
}

async function handleRevision(proposal: ProposalDoc, note: string | undefined) {
  if (proposal.status !== "SENT") {
    return NextResponse.json({ error: "Proposta não está em estado SENT." }, { status: 422 });
  }

  const updated = await db.proposal.update({
    where: { id: proposal.id },
    data: {
      status: "REVISION" as ProposalStatus,
      clientNote: note ?? "",
      reviewedAt: new Date(),
    },
  });

  await prisma.briefing.update({
    where: { id: proposal.briefingId },
    data: { status: "IN_NEGOTIATION" as never },
  });

  const adminEmail = process.env.EMAIL_SERVER_USER ?? "";
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const adminUrl = `${baseUrl}/admin/briefing/${proposal.briefingId}`;

  await sendMail({
    to: adminEmail,
    subject: `🔄 Revisão solicitada — ${proposal.briefing.projectType}`,
    html: tplRevisionRequested({
      adminEmail,
      projectType: proposal.briefing.projectType,
      clientNote: note ?? "",
      adminUrl,
    }),
  }).catch(() => {});

  await triggerN8n("proposal_revision_requested", {
    briefingId: proposal.briefingId,
    proposalId: proposal.id,
    clientEmail: proposal.briefing.user.email,
    projectType: proposal.briefing.projectType,
    clientNote: note ?? "",
    adminUrl,
  });

  return NextResponse.json({ proposal: updated });
}

async function handleUpdate(
  proposal: ProposalDoc,
  body: {
    content?: string;
    summary?: string;
    hoursTotal?: number;
    costMin?: number;
    costMax?: number;
  }
) {
  if (proposal.status !== "DRAFT" && proposal.status !== "REVISION") {
    return NextResponse.json({ error: "Só é possível editar propostas em Rascunho ou Revisão." }, { status: 422 });
  }

  const { content, summary, hoursTotal, costMin, costMax } = body;
  const updated = await db.proposal.update({
    where: { id: proposal.id },
    data: {
      ...(content !== undefined && { content }),
      ...(summary !== undefined && { summary }),
      ...(hoursTotal !== undefined && { hoursTotal: Number(hoursTotal) }),
      ...(costMin !== undefined && { costMin: Number(costMin) }),
      ...(costMax !== undefined && { costMax: Number(costMax) }),
    },
  });

  return NextResponse.json({ proposal: updated });
}

async function triggerN8n(event: string, payload: Record<string, unknown>) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, ...payload }),
  }).catch(() => {});
}

// ─── PATCH /api/proposal/[id] ─────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    action: string;
    note?: string;
    content?: string;
    summary?: string;
    hoursTotal?: number;
    costMin?: number;
    costMax?: number;
  };

  const proposal = await db.proposal.findUnique({
    where: { id },
    include: {
      briefing: {
        include: { user: { select: { email: true, name: true } } },
      },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = proposal.briefing.user.email === session.user.email;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  switch (body.action) {
    case "send":
      if (!isAdmin) return NextResponse.json({ error: "Apenas admin pode enviar." }, { status: 403 });
      return handleSend(proposal);

    case "approve":
      if (isAdmin) return NextResponse.json({ error: "Apenas o cliente pode aprovar." }, { status: 403 });
      return handleApprove(proposal);

    case "request_revision":
      if (isAdmin) return NextResponse.json({ error: "Apenas o cliente pode pedir revisão." }, { status: 403 });
      return handleRevision(proposal, body.note);

    case "update":
      if (!isAdmin) return NextResponse.json({ error: "Apenas admin pode editar." }, { status: 403 });
      return handleUpdate(proposal, body);

    default:
      return NextResponse.json({ error: `Ação inválida: ${body.action}` }, { status: 400 });
  }
}

