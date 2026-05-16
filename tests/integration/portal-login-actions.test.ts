import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  userFindUnique: vi.fn(),
  headersGet: vi.fn(),
}));

vi.mock("@/auth", () => ({
  signIn: mocks.signIn,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: mocks.headersGet,
  }),
}));

import { sendMagicLink } from "@/app/portal/(public)/login/actions";

describe("sendMagicLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headersGet.mockImplementation((key: string) => {
      if (key === "host") return "localhost:3000";
      return null;
    });
    // NextAuth lança NEXT_REDIRECT em Server Actions quando redirect não é false
    mocks.signIn.mockImplementation(() => {
      throw Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;replace;/portal" });
    });
  });

  it("retorna NOT_FOUND quando o utilizador nao existe", async () => {
    mocks.userFindUnique.mockResolvedValue(null);

    const result = await sendMagicLink("inexistente@example.com");

    expect(result).toEqual({ ok: false, code: "NOT_FOUND" });
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("retorna PENDING quando o utilizador esta com status pendente", async () => {
    mocks.userFindUnique.mockResolvedValue({ status: "PENDING", role: "CLIENT" });

    const result = await sendMagicLink("pending@example.com");

    expect(result).toEqual({ ok: false, code: "PENDING" });
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("retorna SUSPENDED quando o utilizador esta suspenso", async () => {
    mocks.userFindUnique.mockResolvedValue({ status: "SUSPENDED", role: "CLIENT" });

    const result = await sendMagicLink("suspended@example.com");

    expect(result).toEqual({ ok: false, code: "SUSPENDED" });
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("envia magic link com redirectTo absoluto para cliente ACTIVE", async () => {
    mocks.userFindUnique.mockResolvedValue({ status: "ACTIVE", role: "CLIENT" });

    const result = await sendMagicLink("CLIENTE@EXAMPLE.COM");

    expect(result).toEqual({ ok: true });
    expect(mocks.signIn).toHaveBeenCalledTimes(1);

    // redirectTo deve ser URL absoluta — NextAuth v5 rejeita URLs relativas em produção.
    // Em teste: NEXTAUTH_URL não está definida, fallback usa header host="localhost:3000".
    const call = mocks.signIn.mock.calls[0];
    expect(call[0]).toBe("nodemailer");
    expect(call[1].email).toBe("cliente@example.com");
    expect(call[1].redirectTo).toMatch(/^https?:\/\/.+\/portal$/);
  });

  it("envia magic link com redirectTo absoluto para ADMIN ACTIVE", async () => {
    mocks.userFindUnique.mockResolvedValue({ status: "ACTIVE", role: "ADMIN" });

    const result = await sendMagicLink("admin@example.com");

    expect(result).toEqual({ ok: true });

    const call = mocks.signIn.mock.calls[0];
    expect(call[1].redirectTo).toMatch(/^https?:\/\/.+\/admin$/);
  });

  it("normaliza o email para lowercase antes de enviar", async () => {
    mocks.userFindUnique.mockResolvedValue({ status: "ACTIVE", role: "CLIENT" });

    await sendMagicLink("UPPER@EXAMPLE.COM");

    const call = mocks.signIn.mock.calls[0];
    expect(call[1].email).toBe("upper@example.com");
  });
});
