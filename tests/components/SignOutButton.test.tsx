/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SignOutButton } from "@/components/SignOutButton";

const mockSignOut = vi.fn();

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

describe("SignOutButton", () => {
  it("dispara signOut com callback para a home", async () => {
    const user = userEvent.setup();
    render(<SignOutButton label="Encerrar sessão" />);

    await user.click(screen.getByRole("button", { name: "Encerrar sessão" }));

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});