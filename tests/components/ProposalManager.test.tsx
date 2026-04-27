/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generate: vi.fn(),
  startEditing: vi.fn(),
  saveEdits: vi.fn(),
  rewriteWithAI: vi.fn(),
  sendProposal: vi.fn(),
  setPreview: vi.fn(),
  setEditing: vi.fn(),
  setEditForm: vi.fn(),
}));

vi.mock("@/app/admin/briefing/[id]/useProposalActions", () => ({
  useProposalActions: vi.fn(),
}));

vi.mock("@/app/portal/briefing/[id]/proposta/ProposalComments", () => ({
  default: () => <div>ProposalCommentsMock</div>,
}));

vi.mock("@/app/admin/briefing/[id]/ProposalEditForm", () => ({
  default: () => <div>ProposalEditFormMock</div>,
}));

import { useProposalActions } from "@/app/admin/briefing/[id]/useProposalActions";
import ProposalManager from "@/app/admin/briefing/[id]/ProposalManager";

describe("ProposalManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra mensagem quando ainda nao existe escopo", () => {
    vi.mocked(useProposalActions).mockReturnValue({
      proposal: null,
      loading: false,
      error: "",
      preview: false,
      setPreview: mocks.setPreview,
      editing: false,
      setEditing: mocks.setEditing,
      editForm: { summary: "", content: "", hoursTotal: 0, costMin: 0, costMax: 0 },
      setEditForm: mocks.setEditForm,
      rewriting: false,
      generate: mocks.generate,
      startEditing: mocks.startEditing,
      saveEdits: mocks.saveEdits,
      rewriteWithAI: mocks.rewriteWithAI,
      sendProposal: mocks.sendProposal,
    });

    render(<ProposalManager briefingId="brief_1" initialProposal={null} hasScope={false} />);

    expect(screen.getByText("Gere o escopo M2 antes de criar a proposta.")).toBeInTheDocument();
  });

  it("permite gerar rascunho quando ha escopo mas ainda nao ha proposta", async () => {
    const user = userEvent.setup();
    vi.mocked(useProposalActions).mockReturnValue({
      proposal: null,
      loading: false,
      error: "",
      preview: false,
      setPreview: mocks.setPreview,
      editing: false,
      setEditing: mocks.setEditing,
      editForm: { summary: "", content: "", hoursTotal: 0, costMin: 0, costMax: 0 },
      setEditForm: mocks.setEditForm,
      rewriting: false,
      generate: mocks.generate,
      startEditing: mocks.startEditing,
      saveEdits: mocks.saveEdits,
      rewriteWithAI: mocks.rewriteWithAI,
      sendProposal: mocks.sendProposal,
    });

    render(<ProposalManager briefingId="brief_1" initialProposal={null} hasScope={true} />);

    await user.click(screen.getByRole("button", { name: "Gerar rascunho" }));

    expect(mocks.generate).toHaveBeenCalledWith(false);
  });

  it("renderiza proposta existente e permite enviar ao cliente", async () => {
    const user = userEvent.setup();
    vi.mocked(useProposalActions).mockReturnValue({
      proposal: {
        id: "prop_1",
        version: 2,
        status: "DRAFT",
        summary: "Resumo executivo",
        content: "Conteudo da proposta",
        hoursTotal: 80,
        costCurrency: "BRL",
        costMin: 4000,
        costMax: 7000,
        clientNote: null,
        reviewedAt: null,
        createdAt: "2026-04-21T10:00:00.000Z",
      },
      loading: false,
      error: "",
      preview: false,
      setPreview: mocks.setPreview,
      editing: false,
      setEditing: mocks.setEditing,
      editForm: { summary: "", content: "", hoursTotal: 0, costMin: 0, costMax: 0 },
      setEditForm: mocks.setEditForm,
      rewriting: false,
      generate: mocks.generate,
      startEditing: mocks.startEditing,
      saveEdits: mocks.saveEdits,
      rewriteWithAI: mocks.rewriteWithAI,
      sendProposal: mocks.sendProposal,
    });

    render(<ProposalManager briefingId="brief_1" initialProposal={null} hasScope={true} />);

    expect(screen.getByText("Resumo executivo")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("ProposalCommentsMock")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Enviar ao cliente →" }));

    expect(mocks.sendProposal).toHaveBeenCalled();
  });
});