/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import ProposalActions from "@/app/portal/(app)/briefing/[id]/proposta/ProposalActions";

describe("ProposalActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aprova proposta e refresca a página", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }));

    render(<ProposalActions proposalId="prop_1" briefingId="brief_1" />);

    await user.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/proposal/prop_1", expect.objectContaining({ method: "PATCH" }));
    });
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("exige nota ao solicitar revisão", async () => {
    const user = userEvent.setup();

    render(<ProposalActions proposalId="prop_1" briefingId="brief_1" />);

    await user.click(screen.getByRole("button", { name: "requestRevision" }));
    await user.click(screen.getByRole("button", { name: "sendRevision" }));

    expect(screen.getByText("revisionRequired")).toBeInTheDocument();
  });
});