/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BriefingStatus } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

import AdminStatusForm from "@/app/admin/briefing/[id]/AdminStatusForm";

const statusLabels: Record<BriefingStatus, string> = {
  RECEIVED: "Recebido",
  IN_ANALYSIS: "Em análise",
  PROPOSAL_SENT: "Proposta enviada",
  IN_NEGOTIATION: "Em negociação",
  APPROVED: "Aprovado",
  IN_PROGRESS: "Em progresso",
  DELIVERED: "Entregue",
};

describe("AdminStatusForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mantem o botao desabilitado quando o estado nao mudou", () => {
    render(<AdminStatusForm briefingId="brief_1" currentStatus="RECEIVED" statusLabels={statusLabels} />);

    expect(screen.getByRole("button", { name: "Guardar Estado" })).toBeDisabled();
  });

  it("envia alteracao de estado e mostra sucesso", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }));

    render(<AdminStatusForm briefingId="brief_1" currentStatus="RECEIVED" statusLabels={statusLabels} />);

    await user.selectOptions(screen.getByLabelText("Estado do Briefing"), "APPROVED");
    await user.click(screen.getByRole("button", { name: "Guardar Estado" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/admin/briefing/brief_1", expect.objectContaining({ method: "PATCH" }));
    });
    expect(await screen.findByText("Estado actualizado com sucesso.")).toBeInTheDocument();
    expect(mocks.refresh).toHaveBeenCalled();
  });
});