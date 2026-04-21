/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  contactFindMany: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactMessage: {
      findMany: mocks.contactFindMany,
    },
  },
}));

vi.mock("lucide-react", () => ({
  Mail: () => <span>MailIcon</span>,
  MailOpen: () => <span>MailOpenIcon</span>,
}));

import AdminContactsPage from "@/app/admin/contacts/page";

describe("AdminContactsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.contactFindMany.mockResolvedValue([]);
  });

  it("renderiza estado vazio quando nao existem mensagens", async () => {
    render(await AdminContactsPage());

    expect(screen.getByText("Mensagens de Contato")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma mensagem recebida ainda.")).toBeInTheDocument();
  });

  it("renderiza mensagens e contador de nao lidas", async () => {
    mocks.contactFindMany.mockResolvedValue([
      {
        id: "c1",
        name: "Joao",
        email: "joao@example.com",
        subject: "Projeto novo",
        message: "Quero falar sobre um novo produto.",
        read: false,
        createdAt: new Date("2026-04-21T10:00:00.000Z"),
      },
    ]);

    render(await AdminContactsPage());

    expect(screen.getByText("1 não lida")).toBeInTheDocument();
    expect(screen.getByText("Projeto novo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "joao@example.com" })).toHaveAttribute("href", "mailto:joao@example.com");
    expect(screen.getByRole("button", { name: "Marcar como lida" })).toBeInTheDocument();
  });
});