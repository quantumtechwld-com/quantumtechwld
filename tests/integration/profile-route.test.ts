import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
    },
  },
}));

import { GET, PATCH } from "@/app/api/profile/route";

describe("/api/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      user: {
        email: "client@example.com",
      },
    });
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      name: "Joao",
      email: "client@example.com",
      phone: "11999999999",
      company: "Quantum",
      role: "CLIENT",
    });
    mocks.userUpdate.mockResolvedValue({
      id: "user_1",
      name: "Joao Silva",
      email: "client@example.com",
      phone: "11999999999",
      company: "Quantum Tech",
    });
  });

  it("retorna 401 no GET quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna o perfil do utilizador autenticado", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user.email).toBe("client@example.com");
  });

  it("atualiza apenas os campos permitidos no PATCH", async () => {
    const response = await PATCH(new Request("http://localhost/api/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: "  Joao Silva  ",
        phone: " 11999999999 ",
        company: " Quantum Tech ",
        role: "ADMIN",
      }),
      headers: { "content-type": "application/json" },
    }) as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user.name).toBe("Joao Silva");
    expect(mocks.userUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        name: "Joao Silva",
        phone: "11999999999",
        company: "Quantum Tech",
      },
    }));
  });
});