import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  orderFindUnique: vi.fn(),
  orderRatingCreate: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
    },
    orderRating: {
      create: mocks.orderRatingCreate,
    },
  },
}));

import { POST } from "@/app/api/orders/[id]/rating/route";

describe("POST /api/orders/[id]/rating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      user: {
        email: "client@example.com",
      },
    });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      status: "COMPLETED",
      rating: null,
      client: {
        email: "client@example.com",
      },
    });
    mocks.orderRatingCreate.mockResolvedValue({
      id: "rating_1",
      score: 5,
      comment: "Excelente",
    });
  });

  it("retorna 401 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/rating", {
      method: "POST",
      body: JSON.stringify({ score: 5 }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna 422 quando a pontuacao e invalida", async () => {
    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/rating", {
      method: "POST",
      body: JSON.stringify({ score: 0 }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Pontuação inválida (1–5).");
  });

  it("retorna 422 quando o pedido nao esta concluido", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      status: "IN_PRODUCTION",
      rating: null,
      client: {
        email: "client@example.com",
      },
    });

    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/rating", {
      method: "POST",
      body: JSON.stringify({ score: 5 }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Só é possível avaliar pedidos concluídos.");
  });

  it("retorna 409 quando o pedido ja foi avaliado", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      status: "COMPLETED",
      rating: { id: "rating_existing" },
      client: {
        email: "client@example.com",
      },
    });

    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/rating", {
      method: "POST",
      body: JSON.stringify({ score: 5 }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe("Este pedido já foi avaliado.");
  });

  it("cria a avaliacao quando o pedido esta elegivel", async () => {
    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/rating", {
      method: "POST",
      body: JSON.stringify({ score: 5, comment: "Excelente" }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe("rating_1");
    expect(mocks.orderRatingCreate).toHaveBeenCalledTimes(1);
  });
});