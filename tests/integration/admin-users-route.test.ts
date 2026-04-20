import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  userUpdate: vi.fn(),
  userDelete: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: mocks.userUpdate,
      delete: mocks.userDelete,
    },
  },
}));

import { PATCH, DELETE } from "@/app/api/admin/users/[id]/route";

describe("/api/admin/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });
    mocks.userUpdate.mockResolvedValue({ id: "user_1", role: "CLIENT", status: "ACTIVE", image: null });
    mocks.userDelete.mockResolvedValue({ id: "user_1" });
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "CLIENT" } });

    const response = await PATCH(new NextRequest("http://localhost/api/admin/users/user_1", {
      method: "PATCH",
      body: JSON.stringify({ status: "ACTIVE" }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "user_1" }) });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Não autorizado.");
  });

  it("retorna 400 para status invalido", async () => {
    const response = await PATCH(new NextRequest("http://localhost/api/admin/users/user_1", {
      method: "PATCH",
      body: JSON.stringify({ status: "INVALID" }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "user_1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Status inválido.");
  });

  it("atualiza dados validos do utilizador", async () => {
    const response = await PATCH(new NextRequest("http://localhost/api/admin/users/user_1", {
      method: "PATCH",
      body: JSON.stringify({ status: "ACTIVE", role: "CLIENT" }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "user_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user.id).toBe("user_1");
    expect(mocks.userUpdate).toHaveBeenCalledTimes(1);
  });

  it("impede o admin de apagar a propria conta", async () => {
    const response = await DELETE(new NextRequest("http://localhost/api/admin/users/admin_1", {
      method: "DELETE",
    }), { params: Promise.resolve({ id: "admin_1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Não pode excluir a sua própria conta.");
  });
});