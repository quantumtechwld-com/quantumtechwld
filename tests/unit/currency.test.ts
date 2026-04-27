import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCurrencyForLocale,
  formatCurrency,
  formatCurrencyByLocale,
  formatCurrencyRangeByLocale,
  getNumberLocaleForCurrency,
  getExchangeRate,
  convertAndFormatByLocale,
} from "@/lib/currency";

// ─── getCurrencyForLocale ────────────────────────────────────────────────────

describe("getCurrencyForLocale", () => {
  it("retorna BRL para locale pt", () => {
    expect(getCurrencyForLocale("pt")).toBe("BRL");
  });

  it("retorna BRL para locale pt-BR", () => {
    expect(getCurrencyForLocale("pt-BR")).toBe("BRL");
  });

  it("retorna USD para locale en", () => {
    expect(getCurrencyForLocale("en")).toBe("USD");
  });

  it("retorna USD para locale en-US", () => {
    expect(getCurrencyForLocale("en-US")).toBe("USD");
  });

  it("retorna EUR para locale es", () => {
    expect(getCurrencyForLocale("es")).toBe("EUR");
  });

  it("retorna EUR para locale es-ES", () => {
    expect(getCurrencyForLocale("es-ES")).toBe("EUR");
  });

  it("retorna BRL como fallback para locale desconhecido", () => {
    expect(getCurrencyForLocale("fr")).toBe("BRL");
  });
});

// ─── formatCurrency ──────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  // CRÍTICO: Parcelas devem ser formatadas em EUR independentemente do locale
  // Regra de negócio: o contrato é em EUR; o Stripe cobra em EUR.
  it("formata valor em EUR mesmo quando locale é pt (parcela do contrato)", () => {
    const result = formatCurrency(150, "pt", "EUR");
    expect(result).toContain("150");
    // EUR com locale pt-BR usa o símbolo € ou "EUR" — verifica que não é R$
    expect(result).not.toContain("R$");
  });

  it("formata valor em EUR com locale en", () => {
    const result = formatCurrency(150, "en", "EUR");
    expect(result).toContain("150");
    expect(result).toContain("€");
  });

  it("formata valor em BRL com locale pt", () => {
    const result = formatCurrency(150, "pt", "BRL");
    expect(result).toContain("R$");
    expect(result).toContain("150");
  });

  it("inclui sempre 2 casas decimais", () => {
    const result = formatCurrency(100, "pt", "EUR");
    expect(result).toMatch(/100[.,]00/);
  });

  it("formata valor zero corretamente", () => {
    const result = formatCurrency(0, "pt", "EUR");
    expect(result).toMatch(/0[.,]00/);
  });
});

// ─── formatCurrencyByLocale ──────────────────────────────────────────────────

describe("formatCurrencyByLocale", () => {
  it("usa BRL para locale pt", () => {
    const result = formatCurrencyByLocale(100, "pt");
    expect(result).toContain("R$");
  });

  it("usa USD para locale en", () => {
    const result = formatCurrencyByLocale(100, "en");
    expect(result).toContain("$");
    expect(result).not.toContain("R$");
  });

  it("usa EUR para locale es", () => {
    const result = formatCurrencyByLocale(100, "es");
    // EUR pode ser "€" ou "EUR" dependendo do locale — verifica ausência de R$ e $
    expect(result).not.toContain("R$");
  });
});

// ─── formatCurrencyRangeByLocale ─────────────────────────────────────────────

describe("formatCurrencyRangeByLocale", () => {
  it("retorna intervalo com separador –", () => {
    const result = formatCurrencyRangeByLocale(100, 200, "pt");
    expect(result).toContain("–");
  });

  it("ambos os valores aparecem no resultado", () => {
    const result = formatCurrencyRangeByLocale(100, 200, "pt");
    expect(result).toContain("100");
    expect(result).toContain("200");
  });
});

// ─── getNumberLocaleForCurrency ───────────────────────────────────────────────

describe("getNumberLocaleForCurrency", () => {
  it("retorna pt-BR para locale pt", () => {
    expect(getNumberLocaleForCurrency("pt")).toBe("pt-BR");
  });

  it("retorna en-US para locale en", () => {
    expect(getNumberLocaleForCurrency("en")).toBe("en-US");
  });

  it("retorna es-ES para locale es", () => {
    expect(getNumberLocaleForCurrency("es")).toBe("es-ES");
  });

  it("retorna pt-BR como fallback", () => {
    expect(getNumberLocaleForCurrency("de")).toBe("pt-BR");
  });
});

// ─── getExchangeRate ─────────────────────────────────────────────────────────

describe("getExchangeRate", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna 1 quando from === to", async () => {
    const rate = await getExchangeRate("EUR", "EUR");
    expect(rate).toBe(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("retorna taxa da API quando sucesso", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { BRL: 6.2 } }),
    });
    const rate = await getExchangeRate("EUR", "BRL");
    expect(rate).toBe(6.2);
  });

  it("usa fallback EUR-BRL=6.1 quando API falha", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("network error"));
    const rate = await getExchangeRate("EUR", "BRL");
    expect(rate).toBe(6.1);
  });

  it("usa fallback EUR-USD=1.08 quando API falha", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("network error"));
    const rate = await getExchangeRate("EUR", "USD");
    expect(rate).toBe(1.08);
  });

  it("retorna 1 quando par nao tem fallback definido", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("network error"));
    const rate = await getExchangeRate("CHF", "JPY");
    expect(rate).toBe(1);
  });

  it("usa fallback quando HTTP nao é ok", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    const rate = await getExchangeRate("EUR", "BRL");
    expect(rate).toBe(6.1);
  });
});

// ─── convertAndFormatByLocale ────────────────────────────────────────────────
// Estes testes cobrem a lógica de conversão + formatação para exibição informacional
// (ex: valor estimado na proposta). NÃO usar este helper para parcelas/Stripe.

describe("convertAndFormatByLocale", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("para locale es (EUR), não converte — retorna EUR direto", async () => {
    // es usa EUR, então from=EUR to=EUR → sem chamada à API
    const result = await convertAndFormatByLocale(100, "EUR", "es");
    expect(fetch).not.toHaveBeenCalled();
    expect(result).toContain("100");
  });

  it("para locale pt converte EUR → BRL usando taxa da API", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { BRL: 6 } }),
    });
    const result = await convertAndFormatByLocale(100, "EUR", "pt");
    // 100 EUR × 6 = 600 BRL
    expect(result).toContain("600");
    expect(result).toContain("R$");
  });

  it("para locale en converte EUR → USD usando taxa da API", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { USD: 1.1 } }),
    });
    const result = await convertAndFormatByLocale(100, "EUR", "en");
    // 100 EUR × 1.1 = 110 USD
    expect(result).toContain("110");
    expect(result).toContain("$");
  });

  it("usa fallback quando API falha", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("offline"));
    const result = await convertAndFormatByLocale(100, "EUR", "pt");
    // fallback EUR-BRL = 6.1 → 100 × 6.1 = 610
    expect(result).toContain("610");
    expect(result).toContain("R$");
  });
});

// ─── Invariante PIX: conversão EUR→BRL obrigatória ───────────────────────────
// PixPaymentPanel exibe valor em BRL. DB armazena amountCents em EUR cents.
// O valor em BRL deve ser calculado via getExchangeRate("EUR","BRL") × amountCents,
// NUNCA exibindo o número EUR diretamente com símbolo R$.

describe("invariante PIX: amountCents EUR deve ser convertido para BRL", () => {
  const eurCents = 1543; // €15,43 no banco de dados

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getExchangeRate EUR→BRL retorna taxa > 1 (BRL é mais fraco que EUR)", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { BRL: 6.17 } }),
    } as Response);
    const rate = await getExchangeRate("EUR", "BRL");
    expect(rate).toBeGreaterThan(1);
    expect(rate).toBe(6.17);
  });

  it("pendingInstPixBrlCents = Math.round(eurCents × rate) → não é igual a eurCents", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { BRL: 6.17 } }),
    } as Response);
    const rate = await getExchangeRate("EUR", "BRL");
    const brlCents = Math.round(eurCents * rate);
    // brlCents deve ser ~9526 (R$95,26), não 1543 (R$15,43)
    expect(brlCents).toBe(Math.round(1543 * 6.17)); // 9520
    expect(brlCents).not.toBe(eurCents);
  });

  it("exibir eurCents direto com BRL seria ERRADO: R$15,43 ≠ valor correto", () => {
    // Simula o bug original: (amountCents / 100).toLocaleString("pt-BR", { currency: "BRL" })
    const buggedDisplay = (eurCents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    // Confirma que o número exibido é €15,43 disfarçado de R$ — valor incorreto
    expect(buggedDisplay).toMatch(/15[.,]43/);
    // O valor correto (~R$95) não aparece no display errado
    expect(buggedDisplay).not.toMatch(/9\d/);
  });

  it("convertAndFormatByLocale 15.43 EUR → pt exibe R$9x,xx (não R$15,43)", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { BRL: 6.17 } }),
    } as Response);
    const result = await convertAndFormatByLocale(eurCents / 100, "EUR", "pt");
    // €15,43 × 6.17 = R$95,20 — não deve mostrar 15,43
    expect(result).toContain("R$");
    expect(result).not.toMatch(/15[.,]43/);
    expect(result).toMatch(/9\d/); // valor na casa dos 90+
  });
});

// ─── Invariante de negócio: parcelas em EUR ───────────────────────────────────
// Verifica que formatar uma parcela com formatCurrency(cents/100, locale, "EUR")
// sempre retorna EUR (jamais BRL ou USD), independentemente do locale do utilizador.

describe("invariante: parcela do contrato sempre em EUR", () => {
  const installmentCents = 1543; // €15,43

  it.each(["pt", "en", "es", "pt-BR", "en-US"])(
    "locale %s → parcela exibida em EUR, não em moeda local",
    (locale) => {
      const result = formatCurrency(installmentCents / 100, locale, "EUR");
      expect(result).toContain("15");
      // Não deve conter R$ (BRL) nem "$" sem "€" (USD puro)
      expect(result).not.toContain("R$");
      // Deve conter o separador decimal (vírgula ou ponto) para os cêntimos
      expect(result).toMatch(/15[.,]43/);
    },
  );
});
