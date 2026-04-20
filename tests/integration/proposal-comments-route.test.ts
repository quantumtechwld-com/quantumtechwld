import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  proposalFindUnique: vi.fn(),
  proposalCommentFindMany: vi.fn(),
  proposalCommentCreate: vi.fn(),
  proposalCommentFindFirst: vi.fn(),
  proposalCommentUpdate: vi.fn(),
  userFindUnique: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    proposal: {
      findUnique: mocks.proposalFindUnique,
    },
    proposalComment: {
      findMany: mocks.proposalCommentFindMany,
      create: mocks.proposalCommentCreate,
      findFirst: mocks.proposalCommentFindFirst,
      update: mocks.proposalCommentUpdate,
    },
    user: {
      findUnique: mocks.userFindUnique,
    },
  },
}));

import { GET, POST, PATCH } from "@/app/api/proposal/[id]/comments/route";

describe("/api/proposal/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      user: {
        email: "client@example.com",
        role: "CLIENT",
      },
    });
    mocks.proposalFindUnique.mockResolvedValue({
      id: "prop_1",
      briefing: {
        user: { email: "client@example.com" },
      },
    });
    mocks.proposalCommentFindMany.mockResolvedValue([{ id: "comment_1" }]);
    mocks.userFindUnique.mockResolvedValue({ id: "user_1" });
    mocks.proposalCommentCreate.mockResolvedValue({ id: "comment_1", body: "Ajustar secao" });
    mocks.proposalCommentFindFirst.mockResolvedValue({ id: "comment_1", proposalId: "prop_1" });
    mocks.proposalCommentUpdate.mockResolvedValue({ id: "comment_1", resolved: true });
  });

  it("lista comentarios para utilizador autorizado", async () => {
    const response = await GET(new NextRequest("http://localhost/api/proposal/prop_1/comments"), {
      params: Promise.resolve({ id: "prop_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.comments).toHaveLength(1);
  });

  it("retorna 422 quando o comentario esta vazio", async () => {
    const response = await POST(new NextRequest("http://localhost/api/proposal/prop_1/comments", {
      method: "POST",
      body: JSON.stringify({ body: "   " }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "prop_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("O comentário não pode estar vazio.");
  });

  it("cria comentario quando payload e valido", async () => {
    const response = await POST(new NextRequest("http://localhost/api/proposal/prop_1/comments", {
      method: "POST",
      body: JSON.stringify({ excerpt: "Hero", body: "Ajustar secao" }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "prop_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.comment.id).toBe("comment_1");
    expect(mocks.proposalCommentCreate).toHaveBeenCalledTimes(1);
  });

  it("permite ao admin resolver comentario", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    const response = await PATCH(new NextRequest("http://localhost/api/proposal/prop_1/comments", {
      method: "PATCH",
      body: JSON.stringify({ commentId: "comment_1" }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "prop_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.comment.resolved).toBe(true);
  });
});