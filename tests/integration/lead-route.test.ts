import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  verifyCsrf: vi.fn(),
  isRateLimited: vi.fn(),
  computeComplexity: vi.fn(),
  sendMail: vi.fn(),
  userUpsert: vi.fn(),
  briefingCreate: vi.fn(),
}));

vi.mock("@/lib/csrf", () => ({
  verifyCsrf: mocks.verifyCsrf,
}));

vi.mock("@/lib/rateLimit", () => ({
  createRateLimiter: vi.fn(() => mocks.isRateLimited),
}));

vi.mock("@/lib/complexity", () => ({
  computeComplexity: mocks.computeComplexity,
}));

vi.mock("@/lib/email", () => ({
  sendMail: mocks.sendMail,
  tplLeadConfirmation: vi.fn(() => ({
    subject: "✅ Recebemos sua solicitação",
    html: "<div>Confirmação enviada</div>",
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: mocks.userUpsert,
    },
    briefing: {
      create: mocks.briefingCreate,
    },
  },
}));

import { POST } from "@/app/api/lead/route";

describe("POST /api/lead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyCsrf.mockReturnValue(true);
    mocks.isRateLimited.mockReturnValue(false);
    mocks.computeComplexity.mockReturnValue({
      score: 2,
      hoursMin: 40,
      hoursMax: 120,
      label: "Simples",
      color: "green",
    });
    mocks.userUpsert.mockResolvedValue({ 
      id: "user_1", 
      name: "Joao Silva", 
      email: "joao@example.com", 
      organization: null 
    });
    mocks.briefingCreate.mockResolvedValue({ id: "brief_1" });
    mocks.sendMail.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue("ok"),
      status: 200,
      statusText: "OK",
    }));
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.N8N_WEBHOOK_URL = "https://example.test/webhook/lead";
  });

  it("retorna 429 quando o rate limit e atingido", async () => {
    mocks.isRateLimited.mockReturnValue(true);

    const request = new NextRequest("http://localhost/api/lead", {
      method: "POST",
      body: JSON.stringify({
        name: "Joao Silva",
        email: "joao@example.com",
        service: "website",
        budget: "10k-20k",
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
    expect(body.error).toBe("Muitas tentativas. Tente novamente em alguns minutos.");
  });

  it("retorna 403 quando o CSRF e invalido", async () => {
    mocks.verifyCsrf.mockReturnValue(false);

    const request = new NextRequest("http://localhost/api/lead", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Invalid CSRF token.");
  });

  it("retorna 400 quando o payload e invalido", async () => {
    const request = new NextRequest("http://localhost/api/lead", {
      method: "POST",
      body: JSON.stringify({ name: "", email: "invalido" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Dados do lead incompletos.");
  });

  it("processa um lead valido e dispara persistencia, email e webhook", async () => {
    const request = new NextRequest("http://localhost/api/lead", {
      method: "POST",
      body: JSON.stringify({
        name: "Joao Silva",
        email: "joao@example.com",
        company: "Quantum",
        service: "website",
        budget: "10k-20k",
        message: "Precisamos de um novo website institucional.",
        features: ["Autenticação de usuários"],
        timeline: "30 dias",
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
    expect(mocks.userUpsert).toHaveBeenCalledTimes(1);
    expect(mocks.briefingCreate).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(2); // Admin + confirmação ao lead
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retorna sucesso local quando o webhook do n8n nao esta configurado", async () => {
    delete process.env.N8N_WEBHOOK_URL;

    const request = new NextRequest("http://localhost/api/lead", {
      method: "POST",
      body: JSON.stringify({
        name: "Joao Silva",
        email: "joao@example.com",
        service: "website",
        budget: "10k-20k",
        message: "Precisamos de um novo website institucional.",
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
    expect(body.message).toContain("Lead recebido localmente");
    expect(fetch).not.toHaveBeenCalled();
  });
});