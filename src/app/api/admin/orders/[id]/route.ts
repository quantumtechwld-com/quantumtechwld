import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VALID_ORDER_TYPES, VALID_ORDER_URGENCIES } from "@/services/orders/createOrder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteContext = { params: Promise<{ id: string }> };

type EditOrderBody = {
  type?: string;
  title?: string;
  description?: string;
  urgency?: string;
};

// Edição de campos básicos apenas enquanto o pedido não avançou além de EVALUATING.
const EDITABLE_STATUSES = ["PENDING", "EVALUATING"] as const;

function validateType(type: string): { error: string; status: number } | null {
  if (!VALID_ORDER_TYPES.includes(type as typeof VALID_ORDER_TYPES[number])) {
    return { error: "Tipo de pedido inválido.", status: 422 };
  }
  return null;
}

function validateTitle(title: string): { error: string; status: number } | null {
  const trimmed = title.trim();
  if (!trimmed || trimmed.length > 120) {
    return { error: "Título obrigatório (máx. 120 caracteres).", status: 422 };
  }
  return null;
}

function validateDescription(description: string): { error: string; status: number } | null {
  if (!description.trim()) {
    return { error: "A descrição é obrigatória.", status: 422 };
  }
  return null;
}

function validateUrgency(urgency: string): { error: string; status: number } | null {
  if (!VALID_ORDER_URGENCIES.includes(urgency as typeof VALID_ORDER_URGENCIES[number])) {
    return { error: "Urgência inválida.", status: 422 };
  }
  return null;
}

function buildUpdateData(body: EditOrderBody): Record<string, unknown> | { error: string; status: number } {
  const data: Record<string, unknown> = {};

  if (body.type !== undefined) {
    const err = validateType(body.type);
    if (err) return err;
    data.type = body.type;
  }

  if (body.title !== undefined) {
    const err = validateTitle(body.title);
    if (err) return err;
    data.title = body.title.trim();
  }

  if (body.description !== undefined) {
    const err = validateDescription(body.description);
    if (err) return err;
    data.description = body.description.trim();
  }

  if (body.urgency !== undefined) {
    const err = validateUrgency(body.urgency);
    if (err) return err;
    data.urgency = body.urgency;
  }

  return data;
}

function isValidationError(v: Record<string, unknown> | { error: string; status: number }): v is { error: string; status: number } {
  return "error" in v;
}

// ─── PATCH /api/admin/orders/[id] ────────────────────────────────────────────
// Permite ao admin editar type/title/description/urgency enquanto o pedido
// está em PENDING ou EVALUATING (antes de proposta enviada ao cliente).
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as EditOrderBody;

    const order = await db.order.findUnique({ where: { id }, select: { status: true } });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    if (!(EDITABLE_STATUSES as readonly string[]).includes(order.status)) {
      return NextResponse.json(
        { error: "Só é possível editar pedidos em estado Pendente ou Em análise." },
        { status: 422 },
      );
    }

    const result = buildUpdateData(body);

    if (isValidationError(result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (Object.keys(result).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 422 });
    }

    const updated = await db.order.update({ where: { id }, data: result });

    return NextResponse.json({ order: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/admin/orders/[id]]", err);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}
