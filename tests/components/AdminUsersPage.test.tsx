/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  userFindMany: vi.fn(),
  organizationFindMany: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: mocks.userFindMany,
    },
    organization: {
      findMany: mocks.organizationFindMany,
    },
  },
}));

vi.mock("@/app/admin/users/UsersClient", () => ({
  default: ({ users }: { users: Array<{ id: string }> }) => <div>UsersClientMock:{users.length}</div>,
}));

import AdminUsersPage from "@/app/admin/users/page";

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.userFindMany.mockResolvedValue([{ id: "user_1" }, { id: "user_2" }]);
    mocks.organizationFindMany.mockResolvedValue([]);
  });

  it("carrega utilizadores e renderiza o client component", async () => {
    render(await AdminUsersPage());

    expect(screen.getByText("UsersClientMock:2")).toBeInTheDocument();
    expect(mocks.userFindMany).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.objectContaining({
        _count: { select: { briefings: true, orders: true, createdOrders: true } },
      }),
    }));
  });
});