import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  verifyCsrf: vi.fn(),
  isRateLimited: vi.fn(),
  sendMail: vi.fn(),
  contactCreate: vi.fn(),
}));

vi.mock("@/lib/csrf", () => ({
  verifyCsrf: mocks.verifyCsrf,
}));

vi.mock("@/lib/rateLimit", () => ({
  createRateLimiter: vi.fn(() => mocks.isRateLimited),
}));

vi.mock("@/lib/email", () => ({
  sendMail: mocks.sendMail,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactMessage: {
      create: mocks.contactCreate,
    },
  },
}));

import { POST } from "@/app/api/contact/route";

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyCsrf.mockReturnValue(true);
    mocks.isRateLimited.mockReturnValue(false);
    mocks.contactCreate.mockResolvedValue({ id: "contact_1" });
    mocks.sendMail.mockResolvedValue(undefined);
    process.env.ADMIN_EMAIL = "admin@example.com";
  });

  it("retorna 403 quando o CSRF e invalido", async () => {
    mocks.verifyCsrf.mockReturnValue(false);

    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Invalid CSRF token.");
  });

  it("retorna 429 quando o rate limit e atingido", async () => {
    mocks.isRateLimited.mockReturnValue(true);

    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Joao Silva",
        email: "joao@example.com",
        subject: "Contato comercial",
        message: "Mensagem valida",
      }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toBe("Too many requests. Please try again later.");
  });

  it("retorna 422 quando o payload e invalido", async () => {
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "", email: "invalido" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Campos obrigatórios em falta ou inválidos.");
  });

  it("persiste o contato e envia email quando o payload e valido", async () => {
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Joao Silva",
        email: "joao@example.com",
        subject: "Contato comercial",
        message: "Gostaria de falar sobre um novo projeto.",
      }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mocks.contactCreate).toHaveBeenCalledTimes(1);
    // 2 emails: notificação ao admin + confirmação ao utilizador
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "admin@example.com" }));
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "joao@example.com" }));
  });

  it("envia email ao admin com assunto em ingles quando locale e en", async () => {
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "John",
        email: "john@example.com",
        subject: "Pricing question",
        message: "How much does it cost?",
        locale: "en",
      }),
      headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.2" },
    });

    await POST(request);

    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "[Contact] Pricing question — John" })
    );
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "✅ We received your message" })
    );
  });

  it("envia email ao admin com assunto em espanhol quando locale e es", async () => {
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Juan",
        email: "juan@example.com",
        subject: "Consulta de precios",
        message: "¿Cuánto cuesta?",
        locale: "es",
      }),
      headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.3" },
    });

    await POST(request);

    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "[Contacto] Consulta de precios — Juan" })
    );
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "✅ Recibimos tu mensaje" })
    );
  });

  it("retorna sucesso mesmo quando o email falha", async () => {
    mocks.sendMail.mockRejectedValue(new Error("smtp offline"));

    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Joao Silva",
        email: "joao@example.com",
        subject: "Contato comercial",
        message: "Gostaria de falar sobre um novo projeto.",
      }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mocks.contactCreate).toHaveBeenCalledTimes(1);
  });
});