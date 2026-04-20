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
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
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