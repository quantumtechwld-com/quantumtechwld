import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  transaction: vi.fn(),
  proposalFindUnique: vi.fn(),
  proposalUpdate: vi.fn(),
  briefingUpdate: vi.fn(),
  sendMail: vi.fn(),
  tplProposalSent: vi.fn(),
  tplProposalApproved: vi.fn(),
  tplProposalApprovedClient: vi.fn(),
  tplRevisionRequested: vi.fn(),
  appUrl: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    proposal: {
      findUnique: mocks.proposalFindUnique,
      update: mocks.proposalUpdate,
    },
    briefing: {
      update: mocks.briefingUpdate,
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendMail: mocks.sendMail,
  tplProposalSent: mocks.tplProposalSent,
  tplProposalApproved: mocks.tplProposalApproved,
  tplProposalApprovedClient: mocks.tplProposalApprovedClient,
  tplRevisionRequested: mocks.tplRevisionRequested,
}));

vi.mock("@/lib/app-url", () => ({
  appUrl: mocks.appUrl,
}));

import { GET, PATCH } from "@/app/api/proposal/[id]/route";

describe("/api/proposal/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      user: {
        email: "client@example.com",
        role: "CLIENT",
      },
    });
    mocks.proposalFindUnique.mockResolvedValue({
      id: "prop_1",
      briefingId: "brief_1",
      status: "SENT",
      costMin: 1000,
      costMax: 2000,
      hoursTotal: 40,
      briefing: {
        projectType: "Website institucional",
        user: { email: "client@example.com", name: "Joao" },
      },
    });
    mocks.proposalUpdate.mockResolvedValue({ id: "prop_1", status: "APPROVED" });
    mocks.briefingUpdate.mockResolvedValue({ id: "brief_1", status: "APPROVED" });
    mocks.transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[]));
    mocks.sendMail.mockResolvedValue(undefined);
    mocks.tplProposalSent.mockReturnValue("<html>sent</html>");
    mocks.tplProposalApproved.mockReturnValue("<html>approved admin</html>");
    mocks.tplProposalApprovedClient.mockReturnValue("<html>approved client</html>");
    mocks.tplRevisionRequested.mockReturnValue("<html>revision</html>");
    mocks.appUrl.mockReturnValue("https://quantumtechwld.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    process.env.EMAIL_SERVER_USER = "admin@example.com";
    process.env.N8N_WEBHOOK_URL = "https://example.test/webhook";
  });

  it("retorna 401 no GET quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/proposal/prop_1"), {
      params: Promise.resolve({ id: "prop_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna 403 no GET quando o utilizador nao pode aceder", async () => {
    mocks.auth.mockResolvedValue({
      user: { email: "other@example.com", role: "CLIENT" },
    });

    const response = await GET(new NextRequest("http://localhost/api/proposal/prop_1"), {
      params: Promise.resolve({ id: "prop_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Acesso negado.");
  });

  it("permite ao admin enviar proposta", async () => {
    mocks.auth.mockResolvedValue({
      user: { email: "admin@example.com", role: "ADMIN" },
    });
    mocks.proposalFindUnique.mockResolvedValue({
      id: "prop_1",
      briefingId: "brief_1",
      status: "DRAFT",
      costMin: 1000,
      costMax: 2000,
      hoursTotal: 40,
      briefing: {
        projectType: "Website institucional",
        user: { email: "client@example.com", name: "Joao" },
      },
    });
    mocks.proposalUpdate.mockResolvedValue({ id: "prop_1", status: "SENT" });
    mocks.briefingUpdate.mockResolvedValue({ id: "brief_1", status: "PROPOSAL_SENT" });

    const response = await PATCH(new NextRequest("http://localhost/api/proposal/prop_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "send" }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "prop_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.proposal.id).toBe("prop_1");
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("permite ao cliente aprovar proposta enviada", async () => {
    mocks.proposalUpdate.mockResolvedValue({ id: "prop_1", status: "APPROVED" });
    mocks.briefingUpdate.mockResolvedValue({ id: "brief_1", status: "APPROVED" });

    const response = await PATCH(new NextRequest("http://localhost/api/proposal/prop_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "approve" }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "prop_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.proposal.id).toBe("prop_1");
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("permite ao admin atualizar proposta em revisao", async () => {
    mocks.auth.mockResolvedValue({
      user: { email: "admin@example.com", role: "ADMIN" },
    });
    mocks.proposalFindUnique.mockResolvedValue({
      id: "prop_1",
      briefingId: "brief_1",
      status: "REVISION",
      costMin: 1000,
      costMax: 2000,
      hoursTotal: 40,
      briefing: {
        projectType: "Website institucional",
        user: { email: "client@example.com", name: "Joao" },
      },
    });
    mocks.proposalUpdate.mockResolvedValue({ id: "prop_1", status: "REVISION", summary: "Nova versao" });

    const response = await PATCH(new NextRequest("http://localhost/api/proposal/prop_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "update", summary: "Nova versao" }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "prop_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.proposal.summary).toBe("Nova versao");
  });
});