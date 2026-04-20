import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  orderFindMany: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: mocks.orderFindMany,
    },
  },
}));

import { GET } from "@/app/api/admin/orders/route";

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindMany.mockResolvedValue([{ id: "ord_1" }]);
  });

  it("retorna 401 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/admin/orders"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com", role: "CLIENT" } });

    const response = await GET(new NextRequest("http://localhost/api/admin/orders"));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Acesso negado.");
  });

  it("lista pedidos com filtros validos", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/orders?status=APPROVED&clientId=user_1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orders).toHaveLength(1);
    expect(mocks.orderFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "APPROVED", clientId: "user_1" },
      take: 100,
    }));
  });
});