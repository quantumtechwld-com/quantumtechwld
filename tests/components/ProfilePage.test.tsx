/**
 * @vitest-environment jsdom
 */

import type { ComponentPropsWithoutRef } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  userFindUnique: vi.fn(),
  briefingCount: vi.fn(),
  orderCount: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
    },
    briefing: {
      count: mocks.briefingCount,
    },
    order: {
      count: mocks.orderCount,
    },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock("@/app/portal/(app)/profile/ProfileForm", () => ({
  ProfileForm: ({ user }: { user: { email: string | null; company: string | null } }) => (
    <div>ProfileFormMock:{user.email}:{user.company}</div>
  ),
}));

import ProfilePage from "@/app/portal/(app)/profile/page";

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com" } });
    mocks.userFindUnique.mockResolvedValue({
      name: "Joao",
      email: "client@example.com",
      phone: "+351 999999999",
      company: "Quantum Client",
      role: "CLIENT",
    });
    mocks.briefingCount.mockResolvedValue(3);
    mocks.orderCount.mockResolvedValue(5);
  });

  it("renderiza estatisticas e formulario do perfil", async () => {
    render(await ProfilePage());

    expect(screen.getByText("profileTitle")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("ProfileFormMock:client@example.com:Quantum Client")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "profileSignOut" })).toHaveAttribute("href", "/api/auth/signout");
  });
});