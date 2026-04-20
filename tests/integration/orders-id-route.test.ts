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
});