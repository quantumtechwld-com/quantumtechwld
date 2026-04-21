import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdate: vi.fn(),
  sendMail: vi.fn(),
  tplOrderProposalSent: vi.fn(),
  tplOrderApprovedAdmin: vi.fn(),
  tplOrderRevisionAdmin: vi.fn(),
  tplOrderInProduction: vi.fn(),
  tplOrderCompleted: vi.fn(),
  tplOrderInReview: vi.fn(),
  tplOrderReviewApprovedAdmin: vi.fn(),
  appUrl: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
      update: mocks.orderUpdate,
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendMail: mocks.sendMail,
  tplOrderProposalSent: mocks.tplOrderProposalSent,
  tplOrderApprovedAdmin: mocks.tplOrderApprovedAdmin,
  tplOrderRevisionAdmin: mocks.tplOrderRevisionAdmin,
  tplOrderInProduction: mocks.tplOrderInProduction,
  tplOrderCompleted: mocks.tplOrderCompleted,
  tplOrderInReview: mocks.tplOrderInReview,
  tplOrderReviewApprovedAdmin: mocks.tplOrderReviewApprovedAdmin,
}));

vi.mock("@/lib/app-url", () => ({
  appUrl: mocks.appUrl,
}));

import { GET, PATCH } from "@/app/api/orders/[id]/route";

describe("/api/orders/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      user: {
        email: "client@example.com",
        role: "CLIENT",
      },
    });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "PROPOSAL_SENT",
      estimatedValue: 5000,
      productionInfo: "Entrega em 20 dias",
      client: {
        id: "user_1",
        name: "Joao Silva",
        email: "client@example.com",
      },
    });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "PROPOSAL_SENT",
      estimatedValue: 5000,
      productionInfo: "Entrega em 20 dias",
      client: {
        id: "user_1",
        name: "Joao Silva",
        email: "client@example.com",
      },
    });
    mocks.tplOrderProposalSent.mockReturnValue("<html>proposal</html>");
    mocks.tplOrderApprovedAdmin.mockReturnValue("<html>approved</html>");
    mocks.tplOrderRevisionAdmin.mockReturnValue("<html>revision</html>");
    mocks.tplOrderInProduction.mockReturnValue("<html>production</html>");
    mocks.tplOrderCompleted.mockReturnValue("<html>completed</html>");
    mocks.tplOrderInReview.mockReturnValue("<html>in-review</html>");
    mocks.tplOrderReviewApprovedAdmin.mockReturnValue("<html>review-approved-admin</html>");
    mocks.sendMail.mockResolvedValue(undefined);
    mocks.appUrl.mockReturnValue("https://quantumtechwld.com");
    process.env.ADMIN_EMAIL = "admin@example.com";
  });

  it("retorna 401 no GET quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/orders/ord_1"), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna 403 no GET quando o utilizador nao e dono nem admin", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        email: "other@example.com",
        role: "CLIENT",
      },
    });

    const response = await GET(new NextRequest("http://localhost/api/orders/ord_1"), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Acesso negado.");
  });

  it("permite ao admin enviar proposta no PATCH", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "ADMIN",
      },
    });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "PROPOSAL_SENT",
      estimatedValue: 5000,
      productionInfo: "Entrega em 20 dias",
      client: {
        id: "user_1",
        name: "Joao Silva",
        email: "client@example.com",
      },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({
        action: "propose",
        productionInfo: "Entrega em 20 dias",
        estimatedValue: 5000,
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.order.id).toBe("ord_1");
    expect(mocks.orderUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });

  it("permite ao cliente aprovar a proposta no PATCH", async () => {
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "APPROVED",
      client: {
        id: "user_1",
        name: "Joao Silva",
        email: "client@example.com",
      },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "approve" }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.order.status).toBe("APPROVED");
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });

  it("retorna 422 quando o cliente tenta aprovar sem proposta enviada", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "PENDING",
      client: {
        id: "user_1",
        name: "Joao Silva",
        email: "client@example.com",
      },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "approve" }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Só é possível aprovar uma proposta enviada.");
  });

  // ─── submit_review ────────────────────────────────────────────────────────

  it("permite ao admin entregar para revisao (submit_review)", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "IN_PRODUCTION",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "IN_REVIEW",
      deliveryNote: "Tudo implementado conforme briefing.",
      deliveryLinks: ["https://staging.example.com"],
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({
        action: "submit_review",
        deliveryNote: "Tudo implementado conforme briefing.",
        deliveryLinks: ["https://staging.example.com"],
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.order.status).toBe("IN_REVIEW");
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });

  it("retorna 422 em submit_review quando deliveryNote esta ausente", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "IN_PRODUCTION",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "submit_review", deliveryNote: "   " }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Descrição do trabalho realizado é obrigatória.");
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  // ─── approve_review ───────────────────────────────────────────────────────

  it("permite ao cliente aprovar a entrega (approve_review)", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "IN_REVIEW",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "REVIEW_APPROVED",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "approve_review" }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.order.status).toBe("REVIEW_APPROVED");
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });

  it("retorna 422 em approve_review quando pedido nao esta IN_REVIEW", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "PROPOSAL_SENT",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "approve_review" }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Só é possível aprovar uma entrega em revisão.");
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  // ─── request_correction ───────────────────────────────────────────────────

  it("permite ao cliente pedir correcao (request_correction)", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "IN_REVIEW",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "IN_PRODUCTION",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "request_correction", adminNote: "Faltou ajustar o formulário." }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.order.status).toBe("IN_PRODUCTION");
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });

  it("retorna 422 em request_correction quando pedido nao esta IN_REVIEW", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "COMPLETED",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "request_correction" }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Só é possível pedir correção de uma entrega em revisão.");
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  // ─── reopen ───────────────────────────────────────────────────────────────

  it("permite ao admin reabrir pedido rejeitado (reopen)", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "REJECTED",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "REVISION",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "reopen" }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.order.status).toBe("REVISION");
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  // ─── complete com finalDeliveryUrl ────────────────────────────────────────

  it("permite ao admin finalizar pedido com URL de entrega final (complete)", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "REVIEW_APPROVED",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "COMPLETED",
      finalDeliveryUrl: "https://cliente.example.com",
      finalDeliveryNote: "Entrega final aprovada.",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({
        action: "complete",
        finalDeliveryUrl: "https://cliente.example.com",
        finalDeliveryNote: "Entrega final aprovada.",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.order.status).toBe("COMPLETED");
    expect(body.order.finalDeliveryUrl).toBe("https://cliente.example.com");
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });

  // ─── segurança: validação de URL ─────────────────────────────────────────

  it("rejeita submit_review com link javascript: (XSS via URL)", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "IN_PRODUCTION",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({
        action: "submit_review",
        deliveryNote: "Trabalho concluído.",
        deliveryLinks: ["javascript:alert(1)"],
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Todos os links devem começar com https:// ou http://.");
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("rejeita submit_review com link data: URI", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "IN_PRODUCTION",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({
        action: "submit_review",
        deliveryNote: "Trabalho concluído.",
        deliveryLinks: ["data:text/html,<script>alert(1)</script>"],
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Todos os links devem começar com https:// ou http://.");
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("rejeita complete com finalDeliveryUrl usando javascript:", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "REVIEW_APPROVED",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({
        action: "complete",
        finalDeliveryUrl: "javascript:alert(document.cookie)",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("URL do resultado final inválida. Use https:// ou http://.");
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });

  it("aceita submit_review com links https validos", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      status: "IN_PRODUCTION",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1", type: "new_feature", title: "Nova funcionalidade", status: "IN_REVIEW",
      client: { id: "user_1", name: "Joao Silva", email: "client@example.com" },
    });

    const request = new NextRequest("http://localhost/api/orders/ord_1", {
      method: "PATCH",
      body: JSON.stringify({
        action: "submit_review",
        deliveryNote: "Entrega pronta.",
        deliveryLinks: ["https://staging.exemplo.com", "http://localhost:3000/demo"],
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "ord_1" }) });
    expect(response.status).toBe(200);
  });
});