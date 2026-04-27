import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  createProposal: vi.fn(),
  sendProposal: vi.fn(),
  createRevision: vi.fn(),
  respondToProposal: vi.fn(),
  getProposalHistory: vi.fn(),
  getActiveProposal: vi.fn(),
  canAccessOrder: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/services/proposals/ProposalService", () => ({
  createProposal: mocks.createProposal,
  sendProposal: mocks.sendProposal,
  createRevision: mocks.createRevision,
  respondToProposal: mocks.respondToProposal,
  getProposalHistory: mocks.getProposalHistory,
  getActiveProposal: mocks.getActiveProposal,
  getLatestProposal: vi.fn(),
}));

vi.mock("@/lib/auth/canAccessOrder", () => ({
  canAccessOrder: mocks.canAccessOrder,
}));

import { POST, GET } from "@/app/api/admin/orders/[id]/proposals/route";
import { POST as ClientPOST, GET as ClientGET } from "@/app/api/orders/[id]/proposals/route";

describe("/api/admin/orders/[id]/proposals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST - Admin criar e enviar proposta", () => {
    it("deve retornar 401 se não estiver autenticado", async () => {
      mocks.auth.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/admin/orders/ord_1/proposals", {
        method: "POST",
        body: JSON.stringify({
          productionInfo: "Desenvolvimento em Next.js",
          estimatedValue: 5000,
          action: "send",
        }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "ord_1" }) });
      expect(res.status).toBe(401);
    });

    it("deve retornar 401 se o usuário não for admin", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "user_1", email: "client@example.com", role: "CLIENT" },
      });

      const req = new NextRequest("http://localhost/api/admin/orders/ord_1/proposals", {
        method: "POST",
        body: JSON.stringify({
          productionInfo: "Desenvolvimento em Next.js",
          estimatedValue: 5000,
          action: "send",
        }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "ord_1" }) });
      expect(res.status).toBe(401);
    });

    it("deve criar proposta em rascunho quando action=draft", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "admin_1", email: "admin@example.com", role: "ADMIN" },
      });

      const mockProposal = {
        id: "prop_1",
        version: 1,
        status: "DRAFT",
        productionInfo: "Desenvolvimento em Next.js",
        estimatedValue: 5000,
        sentAt: null,
      };

      mocks.createProposal.mockResolvedValue(mockProposal);

      const req = new NextRequest("http://localhost/api/admin/orders/ord_1/proposals", {
        method: "POST",
        body: JSON.stringify({
          productionInfo: "Desenvolvimento em Next.js",
          estimatedValue: 5000,
          action: "draft",
        }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "ord_1" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.proposal.status).toBe("DRAFT");
      expect(mocks.createProposal).toHaveBeenCalledWith({
        orderId: "ord_1",
        productionInfo: "Desenvolvimento em Next.js",
        estimatedValue: 5000,
        adminNote: undefined,
        createdByAdminId: "admin_1",
      });
      expect(mocks.sendProposal).not.toHaveBeenCalled();
    });

    it("deve criar e enviar proposta quando action=send", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "admin_1", email: "admin@example.com", role: "ADMIN" },
      });

      const mockDraftProposal = {
        id: "prop_1",
        version: 1,
        status: "DRAFT",
        productionInfo: "Desenvolvimento em Next.js",
        estimatedValue: 5000,
        sentAt: null,
      };

      const mockSentProposal = {
        ...mockDraftProposal,
        status: "SENT",
        sentAt: new Date("2026-04-27T10:00:00Z"),
      };

      mocks.createProposal.mockResolvedValue(mockDraftProposal);
      mocks.sendProposal.mockResolvedValue(mockSentProposal);

      const req = new NextRequest("http://localhost/api/admin/orders/ord_1/proposals", {
        method: "POST",
        body: JSON.stringify({
          productionInfo: "Desenvolvimento em Next.js",
          estimatedValue: 5000,
          action: "send",
        }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "ord_1" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.proposal.status).toBe("SENT");
      expect(data.proposal.sentAt).toBeTruthy();
      expect(mocks.sendProposal).toHaveBeenCalledWith({ proposalId: "prop_1" });
    });

    it("deve validar dados de entrada", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "admin_1", email: "admin@example.com", role: "ADMIN" },
      });

      const req = new NextRequest("http://localhost/api/admin/orders/ord_1/proposals", {
        method: "POST",
        body: JSON.stringify({
          productionInfo: "Curto",
          estimatedValue: -100,
        }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "ord_1" }) });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("GET - Admin listar histórico", () => {
    it("deve retornar histórico de propostas", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "admin_1", email: "admin@example.com", role: "ADMIN" },
      });

      const mockHistory = [
        {
          id: "prop_2",
          version: 2,
          status: "SENT",
          productionInfo: "Versão revisada",
          estimatedValue: 4500,
          sentAt: new Date("2026-04-27T12:00:00Z"),
          createdByAdmin: { name: "Admin", email: "admin@example.com" },
          createdAt: new Date("2026-04-27T12:00:00Z"),
          updatedAt: new Date("2026-04-27T12:00:00Z"),
        },
        {
          id: "prop_1",
          version: 1,
          status: "SUPERSEDED",
          productionInfo: "Versão inicial",
          estimatedValue: 5000,
          sentAt: new Date("2026-04-27T10:00:00Z"),
          createdByAdmin: { name: "Admin", email: "admin@example.com" },
          createdAt: new Date("2026-04-27T10:00:00Z"),
          updatedAt: new Date("2026-04-27T10:00:00Z"),
        },
      ];

      mocks.getProposalHistory.mockResolvedValue(mockHistory);

      const req = new NextRequest("http://localhost/api/admin/orders/ord_1/proposals");
      const res = await GET(req, { params: Promise.resolve({ id: "ord_1" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.proposals).toHaveLength(2);
      expect(data.proposals[0].version).toBe(2);
    });

    it("deve retornar 401 se não for admin", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "user_1", email: "client@example.com", role: "CLIENT" },
      });

      const req = new NextRequest("http://localhost/api/admin/orders/ord_1/proposals");
      const res = await GET(req, { params: Promise.resolve({ id: "ord_1" }) });

      expect(res.status).toBe(401);
    });
  });
});

describe("/api/orders/[id]/proposals/respond", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST - Cliente responder proposta", () => {
    it("deve retornar 401 se não estiver autenticado", async () => {
      mocks.auth.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/orders/ord_1/proposals/respond", {
        method: "POST",
        body: JSON.stringify({ response: "approved" }),
      });

      const res = await ClientPOST(req, { params: Promise.resolve({ id: "ord_1" }) });
      expect(res.status).toBe(401);
    });

    it("deve retornar 403 se o cliente não tiver acesso ao pedido", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "user_1", email: "client@example.com", role: "CLIENT" },
      });
      mocks.canAccessOrder.mockResolvedValue(false);

      const req = new NextRequest("http://localhost/api/orders/ord_1/proposals/respond", {
        method: "POST",
        body: JSON.stringify({ response: "approved" }),
      });

      const res = await ClientPOST(req, { params: Promise.resolve({ id: "ord_1" }) });
      expect(res.status).toBe(403);
    });

    it("deve aprovar proposta com sucesso", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "user_1", email: "client@example.com", role: "CLIENT" },
      });
      mocks.canAccessOrder.mockResolvedValue(true);

      const mockActiveProposal = {
        id: "prop_1",
        status: "SENT",
        version: 1,
      };

      const mockApprovedProposal = {
        id: "prop_1",
        status: "APPROVED",
        clientResponse: "approved",
        reviewedAt: new Date("2026-04-27T15:00:00Z"),
      };

      mocks.getActiveProposal.mockResolvedValue(mockActiveProposal);
      mocks.respondToProposal.mockResolvedValue(mockApprovedProposal);

      const req = new NextRequest("http://localhost/api/orders/ord_1/proposals/respond", {
        method: "POST",
        body: JSON.stringify({ response: "approved" }),
      });

      const res = await ClientPOST(req, { params: Promise.resolve({ id: "ord_1" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.proposal.status).toBe("APPROVED");
      expect(data.message).toContain("Proposta aprovada com sucesso");
    });

    it("deve solicitar revisão com nota", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "user_1", email: "client@example.com", role: "CLIENT" },
      });
      mocks.canAccessOrder.mockResolvedValue(true);

      const mockActiveProposal = {
        id: "prop_1",
        status: "SENT",
        version: 1,
      };

      const mockRevisionProposal = {
        id: "prop_1",
        status: "REVISION",
        clientResponse: "revision",
        reviewedAt: new Date("2026-04-27T15:00:00Z"),
      };

      mocks.getActiveProposal.mockResolvedValue(mockActiveProposal);
      mocks.respondToProposal.mockResolvedValue(mockRevisionProposal);

      const req = new NextRequest("http://localhost/api/orders/ord_1/proposals/respond", {
        method: "POST",
        body: JSON.stringify({
          response: "revision",
          clientNote: "Preciso de ajustes no prazo",
        }),
      });

      const res = await ClientPOST(req, { params: Promise.resolve({ id: "ord_1" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.message).toContain("Solicitação de revisão enviada");
      expect(mocks.respondToProposal).toHaveBeenCalledWith({
        proposalId: "prop_1",
        response: "revision",
        clientNote: "Preciso de ajustes no prazo",
      });
    });

    it("deve retornar 404 se não houver proposta ativa", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "user_1", email: "client@example.com", role: "CLIENT" },
      });
      mocks.canAccessOrder.mockResolvedValue(true);
      mocks.getActiveProposal.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/orders/ord_1/proposals/respond", {
        method: "POST",
        body: JSON.stringify({ response: "approved" }),
      });

      const res = await ClientPOST(req, { params: Promise.resolve({ id: "ord_1" }) });
      expect(res.status).toBe(404);
    });
  });

  describe("GET - Cliente visualizar proposta ativa", () => {
    it("deve retornar proposta ativa", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "user_1", email: "client@example.com", role: "CLIENT" },
      });
      mocks.canAccessOrder.mockResolvedValue(true);

      const mockProposal = {
        id: "prop_1",
        version: 1,
        status: "SENT",
        productionInfo: "Desenvolvimento completo",
        estimatedValue: 5000,
        sentAt: new Date("2026-04-27T10:00:00Z"),
        createdAt: new Date("2026-04-27T10:00:00Z"),
      };

      mocks.getActiveProposal.mockResolvedValue(mockProposal);

      const req = new NextRequest("http://localhost/api/orders/ord_1/proposals");
      const res = await ClientGET(req, { params: Promise.resolve({ id: "ord_1" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.proposal.version).toBe(1);
      expect(data.proposal.status).toBe("SENT");
    });

    it("não deve mostrar rascunhos para clientes", async () => {
      mocks.auth.mockResolvedValue({
        user: { id: "user_1", email: "client@example.com", role: "CLIENT" },
      });
      mocks.canAccessOrder.mockResolvedValue(true);

      const mockDraftProposal = {
        id: "prop_1",
        status: "DRAFT",
      };

      mocks.getActiveProposal.mockResolvedValue(mockDraftProposal);

      const req = new NextRequest("http://localhost/api/orders/ord_1/proposals");
      const res = await ClientGET(req, { params: Promise.resolve({ id: "ord_1" }) });

      expect(res.status).toBe(404);
    });
  });
});
