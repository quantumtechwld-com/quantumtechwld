import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  orderFindUnique: vi.fn(),
  orderMessageFindMany: vi.fn(),
  orderMessageCreate: vi.fn(),
  sendMail: vi.fn(),
  tplOrderNewMessage: vi.fn(),
  appUrl: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
    },
    orderMessage: {
      findMany: mocks.orderMessageFindMany,
      create: mocks.orderMessageCreate,
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendMail: mocks.sendMail,
  tplOrderNewMessage: mocks.tplOrderNewMessage,
}));

vi.mock("@/lib/app-url", () => ({
  appUrl: mocks.appUrl,
}));

import { GET, POST } from "@/app/api/orders/[id]/messages/route";

describe("/api/orders/[id]/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      user: {
        id: "user_1",
        email: "client@example.com",
        role: "CLIENT",
      },
    });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      client: {
        id: "user_1",
        name: "Joao Silva",
        email: "client@example.com",
      },
    });
    mocks.orderMessageFindMany.mockResolvedValue([{ id: "msg_1" }]);
    mocks.orderMessageCreate.mockResolvedValue({
      id: "msg_1",
      body: "Nova mensagem",
      author: {
        id: "user_1",
        name: "Joao Silva",
        email: "client@example.com",
        role: "CLIENT",
      },
    });
    mocks.tplOrderNewMessage.mockReturnValue("<html>message</html>");
    mocks.sendMail.mockResolvedValue(undefined);
    mocks.appUrl.mockReturnValue("https://quantumtechwld.com");
    process.env.EMAIL_ADMIN = "admin@example.com";
  });

  it("retorna 401 no GET quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/orders/ord_1/messages"), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("lista mensagens para o dono do pedido", async () => {
    const response = await GET(new NextRequest("http://localhost/api/orders/ord_1/messages"), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.messages).toHaveLength(1);
    expect(mocks.orderMessageFindMany).toHaveBeenCalledTimes(1);
  });

  it("retorna 400 quando a mensagem e invalida", async () => {
    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/messages", {
      method: "POST",
      body: JSON.stringify({ body: "" }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Mensagem inválida (1–2000 caracteres)");
  });

  it("cria mensagem do cliente e notifica admin", async () => {
    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/messages", {
      method: "POST",
      body: JSON.stringify({ body: "Nova mensagem" }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message.id).toBe("msg_1");
    expect(mocks.orderMessageCreate).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.tplOrderNewMessage).toHaveBeenCalledWith(expect.objectContaining({
      senderRole: "client",
      orderUrl: "https://quantumtechwld.com/admin/orders/ord_1",
    }));
  });

  it("cria mensagem do admin e notifica cliente", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        id: "admin_1",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });
    mocks.orderMessageCreate.mockResolvedValue({
      id: "msg_2",
      body: "Resposta do admin",
      author: {
        id: "admin_1",
        name: "Admin",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/messages", {
      method: "POST",
      body: JSON.stringify({ body: "Resposta do admin" }),
      headers: { "content-type": "application/json" },
    }), {
      params: Promise.resolve({ id: "ord_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message.id).toBe("msg_2");
    expect(mocks.tplOrderNewMessage).toHaveBeenCalledWith(expect.objectContaining({
      senderRole: "admin",
      orderUrl: "https://quantumtechwld.com/portal/orders/ord_1",
    }));
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });
});