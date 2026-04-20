import { describe, expect, it } from "vitest";
import { computeComplexity } from "@/lib/complexity";

describe("computeComplexity", () => {
  it("usa base fallback quando o tipo do projeto nao existe no mapa", () => {
    const result = computeComplexity("unknown", [], "");

    expect(result.hoursMin).toBe(80);
    expect(result.hoursMax).toBe(200);
    expect(result.score).toBeGreaterThan(0);
  });

  it("aumenta a estimativa com funcionalidades conhecidas e briefing livre longo", () => {
    const result = computeComplexity(
      "website",
      ["Autenticação de usuários", "Pagamentos online"],
      "Precisamos de um painel de onboarding, regras de acesso e integrações adicionais para o fluxo comercial.",
    );

    expect(result.hoursMin).toBe(100);
    expect(result.hoursMax).toBe(270);
    expect(result.label).toBe("Simples");
  });
});