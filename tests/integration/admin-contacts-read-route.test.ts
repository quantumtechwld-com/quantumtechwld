import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  contactUpdate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactMessage: {
      update: mocks.contactUpdate,
    },
  },
}));

import { POST } from "@/app/api/admin/contacts/[id]/read/route";

describe("POST /api/admin/contacts/[id]/read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.contactUpdate.mockResolvedValue({ id: "contact_1", read: true });
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "CLIENT" } });

    const response = await POST(new NextRequest("http://localhost/api/admin/contacts/contact_1/read", {
      method: "POST",
    }), { params: Promise.resolve({ id: "contact_1" }) });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Forbidden");
  });

  it("marca a mensagem como lida e redireciona", async () => {
    const response = await POST(new NextRequest("http://localhost/api/admin/contacts/contact_1/read", {
      method: "POST",
    }), { params: Promise.resolve({ id: "contact_1" }) });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/admin/contacts");
    expect(mocks.contactUpdate).toHaveBeenCalledTimes(1);
  });
});