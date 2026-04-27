import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  financialFindMany: vi.fn(),
  financialFindUnique: vi.fn(),
  installmentUpdate: vi.fn(),
  installmentFindFirst: vi.fn(),
  financialUpdate: vi.fn(),
  orderUpdate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    orderFinancial: {
      findMany:   mocks.financialFindMany,
      findUnique: mocks.financialFindUnique,
      update:     mocks.financialUpdate,
    },
    paymentInstallment: {
      findFirst: mocks.installmentFindFirst,
      update:    mocks.installmentUpdate,
    },
    order: {
      update: mocks.orderUpdate,
    },
  },
}));

import { GET } from "@/app/api/admin/financial/route";
import { GET as GETDetail } from "@/app/api/admin/financial/[orderId]/route";
import { PATCH } from "@/app/api/admin/financial/[orderId]/installments/[installmentId]/route";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ADMIN_SESSION   = { user: { role: "ADMIN", id: "admin_1", email: "admin@example.com" } };
const CLIENT_SESSION  = { user: { role: "CLIENT", email: "c@e.com" } };
const ORDER_ID        = "ord_abc123";
const INSTALLMENT_ID  = "inst_1";

const SAMPLE_FINANCIAL = {
  id:               "fin_1",
  orderId:          ORDER_ID,
  totalAmountCents: 100000,
  downPaymentPct:   50,
  paidCents:        0,
  status:           "PENDING",
  installments: [
    { id: INSTALLMENT_ID, sequence: 1, amountCents: 50000, method: "MANUAL_PIX", status: "PENDING", paidAt: null, notes: null },
    { id: "inst_2",       sequence: 2, amountCents: 50000, method: "MANUAL_PIX", status: "PENDING", paidAt: null, notes: null },
  ],
  order: {
    id:     ORDER_ID,
    ref:    "QTA-001",
    type:   "new_project",
    status: "APPROVED",
    client: { id: "u1", name: "Maria", email: "m@e.com" },
  },
};

// ─── GET /api/admin/financial ─────────────────────────────────────────────────

describe("GET /api/admin/financial", () => {
  beforeEach(() => vi.clearAllMocks());

  it("403 para não-admin", async () => {
    mocks.auth.mockResolvedValue(CLIENT_SESSION);
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("200 com lista para admin", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.financialFindMany.mockResolvedValue([SAMPLE_FINANCIAL]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json() as typeof SAMPLE_FINANCIAL[];
    expect(body).toHaveLength(1);
    expect(body[0].orderId).toBe(ORDER_ID);
  });
});

// ─── GET /api/admin/financial/[orderId] ──────────────────────────────────────

describe("GET /api/admin/financial/[orderId]", () => {
  beforeEach(() => vi.clearAllMocks());

  const ctx = { params: Promise.resolve({ orderId: ORDER_ID }) };

  it("403 para não-admin", async () => {
    mocks.auth.mockResolvedValue(CLIENT_SESSION);
    const res = await GETDetail(new NextRequest("http://localhost/x"), ctx);
    expect(res.status).toBe(403);
  });

  it("404 quando não existe", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.financialFindUnique.mockResolvedValue(null);
    const res = await GETDetail(new NextRequest("http://localhost/x"), ctx);
    expect(res.status).toBe(404);
  });

  it("200 com detalhe", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.financialFindUnique.mockResolvedValue(SAMPLE_FINANCIAL);
    const res = await GETDetail(new NextRequest("http://localhost/x"), ctx);
    expect(res.status).toBe(200);
    const body = await res.json() as typeof SAMPLE_FINANCIAL;
    expect(body.totalAmountCents).toBe(100000);
    expect(body.installments).toHaveLength(2);
  });
});

// ─── PATCH helpers ────────────────────────────────────────────────────────────

function makePatchReq(body: unknown) {
  return new NextRequest("http://localhost/x", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── PATCH /api/admin/financial/[orderId]/installments/[installmentId] ────────

describe("PATCH confirm_manual installment", () => {
  beforeEach(() => vi.clearAllMocks());

  const ctx = {
    params: Promise.resolve({ orderId: ORDER_ID, installmentId: INSTALLMENT_ID }),
  };

  it("403 para não-admin", async () => {
    mocks.auth.mockResolvedValue(CLIENT_SESSION);
    const res = await PATCH(makePatchReq({ action: "confirm_manual" }), ctx);
    expect(res.status).toBe(403);
  });

  it("400 para ação inválida", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    const res = await PATCH(makePatchReq({ action: "unknown" }), ctx);
    expect(res.status).toBe(400);
  });

  it("404 quando parcela não existe", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.installmentFindFirst.mockResolvedValue(null);
    const res = await PATCH(makePatchReq({ action: "confirm_manual" }), ctx);
    expect(res.status).toBe(404);
  });

  it("409 quando parcela já está paga", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.installmentFindFirst.mockResolvedValue({
      ...SAMPLE_FINANCIAL.installments[0],
      status: "PAID",
      financial: SAMPLE_FINANCIAL,
    });
    const res = await PATCH(makePatchReq({ action: "confirm_manual" }), ctx);
    expect(res.status).toBe(409);
  });

  it("200 confirma pagamento e recalcula paidCents", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.installmentFindFirst.mockResolvedValue({
      id: INSTALLMENT_ID,
      sequence: 1,
      amountCents: 50000,
      method: "MANUAL_PIX",
      status: "PENDING",
      paidAt: null,
      financial: {
        ...SAMPLE_FINANCIAL,
        paidCents: 0,
        installments: SAMPLE_FINANCIAL.installments,
      },
    });
    mocks.installmentUpdate.mockResolvedValue({});
    mocks.financialUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});

    const res = await PATCH(makePatchReq({ action: "confirm_manual", notes: "PIX confirmado" }), ctx);
    expect(res.status).toBe(200);

    const body = await res.json() as { ok: boolean; paidCents: number; status: string };
    expect(body.ok).toBe(true);
    expect(body.paidCents).toBe(50000);
    expect(body.status).toBe("PARTIAL");

    // Verifica que installment foi atualizado
    expect(mocks.installmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: INSTALLMENT_ID },
        data: expect.objectContaining({ status: "PAID", notes: "PIX confirmado" }),
      }),
    );

    // Verifica que pedido avançou para IN_PRODUCTION (era seq=1, paidCents=0)
    expect(mocks.orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ORDER_ID },
        data:  { status: "IN_PRODUCTION" },
      }),
    );
  });
});

// ─── PATCH set_due_date ──────────────────────────────────────────────────────────────────

describe("PATCH set_due_date installment", () => {
  beforeEach(() => vi.clearAllMocks());

  const ctx = {
    params: Promise.resolve({ orderId: ORDER_ID, installmentId: INSTALLMENT_ID }),
  };

  it("200 define dueDate válido na parcela", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.installmentFindFirst.mockResolvedValue({
      ...SAMPLE_FINANCIAL.installments[0],
      financial: SAMPLE_FINANCIAL,
    });
    mocks.installmentUpdate.mockResolvedValue({});

    const res = await PATCH(makePatchReq({ action: "set_due_date", dueDate: "2026-05-15" }), ctx);
    expect(res.status).toBe(200);

    expect(mocks.installmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: INSTALLMENT_ID },
        data:  { dueDate: new Date("2026-05-15") },
      }),
    );
  });

  it("200 limpa dueDate quando dueDate é null", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.installmentFindFirst.mockResolvedValue({
      ...SAMPLE_FINANCIAL.installments[0],
      financial: SAMPLE_FINANCIAL,
    });
    mocks.installmentUpdate.mockResolvedValue({});

    const res = await PATCH(makePatchReq({ action: "set_due_date", dueDate: null }), ctx);
    expect(res.status).toBe(200);

    expect(mocks.installmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: INSTALLMENT_ID },
        data:  { dueDate: null },
      }),
    );
  });

  it("422 quando dueDate é string inválida", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.installmentFindFirst.mockResolvedValue({
      ...SAMPLE_FINANCIAL.installments[0],
      financial: SAMPLE_FINANCIAL,
    });

    const res = await PATCH(makePatchReq({ action: "set_due_date", dueDate: "not-a-date" }), ctx);
    expect(res.status).toBe(422);

    const body = await res.json() as { error: string };
    expect(body.error).toBe("Data inválida.");
    expect(mocks.installmentUpdate).not.toHaveBeenCalled();
  });

  it("403 para não-admin em set_due_date", async () => {
    mocks.auth.mockResolvedValue(CLIENT_SESSION);
    const res = await PATCH(makePatchReq({ action: "set_due_date", dueDate: "2026-05-01" }), ctx);
    expect(res.status).toBe(403);
    expect(mocks.installmentUpdate).not.toHaveBeenCalled();
  });
});

// ─── Serialização de datas (regressão) ──────────────────────────────────────
// Reproduz o bug "Application error" causado por Date objects sendo passados
// ao Client Component sem serialização prévia para ISO string.

describe("PATCH confirm_manual — parcela com datas preenchidas", () => {
  beforeEach(() => vi.clearAllMocks());

  const ctx = {
    params: Promise.resolve({ orderId: ORDER_ID, installmentId: INSTALLMENT_ID }),
  };

  it("200 confirma parcela que já tinha dueDate definido (regressão serialização)", async () => {
    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.installmentFindFirst.mockResolvedValue({
      id: INSTALLMENT_ID,
      sequence: 1,
      amountCents: 50000,
      method: "MANUAL_PIX",
      status: "PENDING",
      paidAt: null,
      dueDate: new Date("2026-04-30"),   // ← dueDate preenchido (ISO no DB = Date object)
      notes: null,
      financial: {
        ...SAMPLE_FINANCIAL,
        paidCents: 0,
        installments: [
          { id: INSTALLMENT_ID, sequence: 1, amountCents: 50000, method: "MANUAL_PIX", status: "PENDING", paidAt: null, dueDate: new Date("2026-04-30"), notes: null },
          { id: "inst_2",       sequence: 2, amountCents: 50000, method: "MANUAL_PIX", status: "PENDING", paidAt: null, dueDate: null,                    notes: null },
        ],
      },
    });
    mocks.installmentUpdate.mockResolvedValue({});
    mocks.financialUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});

    const res = await PATCH(makePatchReq({ action: "confirm_manual" }), ctx);
    expect(res.status).toBe(200);

    const body = await res.json() as { ok: boolean; paidCents: number };
    expect(body.ok).toBe(true);
    expect(body.paidCents).toBe(50000);
  });

  it("200 confirma parcela que já tinha paidAt preenchido em parcela anterior (2ª parcela)", async () => {
    const INST2_ID = "inst_2";
    const ctx2 = { params: Promise.resolve({ orderId: ORDER_ID, installmentId: INST2_ID }) };

    mocks.auth.mockResolvedValue(ADMIN_SESSION);
    mocks.installmentFindFirst.mockResolvedValue({
      id: INST2_ID,
      sequence: 2,
      amountCents: 50000,
      method: "MANUAL_PIX",
      status: "PENDING",
      paidAt: null,
      dueDate: new Date("2026-06-01"),
      notes: null,
      financial: {
        ...SAMPLE_FINANCIAL,
        paidCents: 50000,
        installments: [
          { id: INSTALLMENT_ID, sequence: 1, amountCents: 50000, method: "MANUAL_PIX", status: "PAID",    paidAt: new Date("2026-04-01"), dueDate: null, notes: "entrada" },
          { id: INST2_ID,       sequence: 2, amountCents: 50000, method: "MANUAL_PIX", status: "PENDING", paidAt: null,                  dueDate: new Date("2026-06-01"), notes: null },
        ],
      },
    });
    mocks.installmentUpdate.mockResolvedValue({});
    mocks.financialUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});

    const res = await PATCH(makePatchReq({ action: "confirm_manual", notes: "PIX final confirmado" }), ctx2);
    expect(res.status).toBe(200);

    const body = await res.json() as { ok: boolean; paidCents: number; status: string };
    expect(body.ok).toBe(true);
    expect(body.paidCents).toBe(100000); // ambas pagas
    expect(body.status).toBe("PAID");    // financeiro totalmente pago
  });
});
