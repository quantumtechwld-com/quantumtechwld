import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = ["PENDING", "ACTIVE", "SUSPENDED"] as const;
const ALLOWED_ROLE   = ["CLIENT", "ADMIN", "DEVELOPER"]     as const;
const MAX_IMAGE_BYTES = 300 * 1024;
const IMAGE_MIME_RE   = /^data:image\/(jpeg|png|webp|gif);base64,/;

type PatchData = Record<string, string | null>;

function validateStatus(status: string): string | null {
  if (!ALLOWED_STATUS.includes(status as (typeof ALLOWED_STATUS)[number]))
    return "Status inválido.";
  return null;
}

function validateRole(role: string, userId: string, sessionId: string): string | null {
  if (!ALLOWED_ROLE.includes(role as (typeof ALLOWED_ROLE)[number]))
    return "Role inválida.";
  if (userId === sessionId && role !== "ADMIN" && role !== "DEVELOPER")
    return "Não pode remover a sua própria role de ADMIN.";
  return null;
}

function validateImage(image: string | null | undefined): string | null {
  if (image === null || image === undefined) return null;
  if (typeof image !== "string" || !IMAGE_MIME_RE.test(image))
    return "Formato de imagem inválido. Use JPEG, PNG ou WebP.";
  if (image.length > MAX_IMAGE_BYTES)
    return "Imagem demasiado grande. Máximo 225 KB.";
  return null;
}

// PATCH /api/admin/users/[id] — atualiza role, status ou imagem de um utilizador
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string; role?: string; image?: string | null };
  const data: PatchData = {};

  if (body.status) {
    const err = validateStatus(body.status);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    data.status = body.status;
  }

  if (body.role) {
    const err = validateRole(body.role, id, session.user.id ?? "");
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    data.role = body.role;
  }

  if ("image" in body) {
    const err = validateImage(body.image);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    data.image = body.image ?? null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, status: true, image: true },
  });

  return NextResponse.json({ user });
}

// DELETE /api/admin/users/[id] — remove permanentemente um utilizador
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "Não pode excluir a sua própria conta." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
