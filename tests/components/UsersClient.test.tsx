/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("lucide-react", () => ({
  Clock: () => <span>ClockIcon</span>,
}));

import UsersClient from "@/app/admin/users/UsersClient";

describe("UsersClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("renderiza pendentes e restantes, e envia convite com sucesso", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }));

    render(
      <UsersClient
        organizations={[]}
        users={[
          {
            id: "u1",
            name: "Joao",
            email: "joao@example.com",
            image: null,
            role: "CLIENT",
            status: "PENDING",
            company: "Empresa A",
            emailVerified: null,
            lastLoginAt: null,
            organization: null,
            _count: { briefings: 1, orders: 2, createdOrders: 0 },
          },
          {
            id: "u3",
            name: "Carla",
            email: "carla@example.com",
            image: null,
            role: "CLIENT",
            status: "ACTIVE",
            company: "Empresa C",
            emailVerified: new Date("2026-04-21T10:00:00.000Z"),
            lastLoginAt: null,
            organization: null,
            _count: { briefings: 2, orders: 1, createdOrders: 0 },
          },
          {
            id: "u2",
            name: "Maria",
            email: "maria@example.com",
            image: null,
            role: "ADMIN",
            status: "ACTIVE",
            company: "Empresa B",
            emailVerified: new Date("2026-04-21T10:00:00.000Z"),
            lastLoginAt: null,
            organization: null,
            _count: { briefings: 3, orders: 4, createdOrders: 5 },
          },
        ]}
      />
    );

    expect(screen.getByText(/Aguardam Aprovação \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Todos os Utilizadores \(2\)/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /\+ Pedido/i })).toHaveAttribute("href", "/admin/orders/new?clientId=u3");
    expect(screen.getByText("Criados: 5")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("email@cliente.com"), "novo@example.com");
    await user.click(screen.getByRole("button", { name: /Enviar Convite/i }));

    expect(await screen.findByText(/Convite enviado para novo@example.com/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/admin/users/invite", expect.objectContaining({ method: "POST" }));
  });

  it("aprova um utilizador pendente", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        user: { status: "ACTIVE", role: "CLIENT" },
      }),
    }));

    render(
      <UsersClient
        organizations={[]}
        users={[
          {
            id: "u1",
            name: "Joao",
            email: "joao@example.com",
            image: null,
            role: "CLIENT",
            status: "PENDING",
            company: "Empresa A",
            emailVerified: null,
            lastLoginAt: null,
            organization: null,
            _count: { briefings: 1, orders: 2, createdOrders: 0 },
          },
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Aprovar" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/admin/users/u1", expect.objectContaining({ method: "PATCH" }));
    });
    expect(screen.getAllByText("Ativo").length).toBeGreaterThan(0);
  });
});