import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  userUpsert: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
  signIn: mocks.signIn,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: mocks.userUpsert,
    },
  },
}));

import { POST } from "@/app/api/admin/users/invite/route";

describe("POST /api/admin/users/invite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.userUpsert.mockResolvedValue({ id: "user_1" });
    mocks.signIn.mockResolvedValue(undefined);
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "CLIENT" } });

    const response = await POST(new NextRequest("http://localhost/api/admin/users/invite", {
      method: "POST",
      body: JSON.stringify({ email: "client@example.com" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Não autorizado.");
  });

  it("retorna 400 quando o email e invalido", async () => {
    const response = await POST(new NextRequest("http://localhost/api/admin/users/invite", {
      method: "POST",
      body: JSON.stringify({ email: "invalido" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Email inválido.");
  });

  it("cria ou ativa utilizador e envia convite com callbackUrl absoluto", async () => {
    const response = await POST(new NextRequest("http://localhost/api/admin/users/invite", {
      method: "POST",
      body: JSON.stringify({ email: "CLIENT@EXAMPLE.COM", name: "Joao", locale: "en" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mocks.userUpsert).toHaveBeenCalledTimes(1);

    // redirectTo deve ser URL absoluta — NextAuth v5 rejeita URLs relativas em produção.
    // Em teste: NEXTAUTH_URL não está definida, fallback usa header host="localhost".
    const call = mocks.signIn.mock.calls[0];
    expect(call[0]).toBe("nodemailer");
    expect(call[1]).toMatchObject({ email: "client@example.com", redirect: false });
    expect(call[1].redirectTo).toMatch(/^https?:\/\/.+\/portal\?invite_locale=en$/);
  });
});