// ATENCAO: helpers baseados em locale servem apenas para EXIBICAO de estimativas
// e propostas. Eles NAO devem ser usados para Stripe, invoices ou qualquer fluxo
// de cobranca real sem uma moeda persistida e, idealmente, conversao cambial.

export const SUPPORTED_CURRENCIES = ["BRL", "EUR", "USD"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function normalizeSupportedCurrency(value?: string | null): SupportedCurrency | null {
  if (!value) return null;
  const normalized = value.toUpperCase();
  return SUPPORTED_CURRENCIES.includes(normalized as SupportedCurrency)
    ? (normalized as SupportedCurrency)
    : null;
}

export function getCurrencyForLocale(locale: string): "BRL" | "USD" | "EUR" {
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("en")) return "USD";
  if (normalized.startsWith("es")) return "EUR";
  return "BRL";
}

export function getNumberLocaleForCurrencyCode(currency: string): string {
  switch (currency.toUpperCase()) {
    case "BRL": return "pt-BR";
    case "USD": return "en-US";
    default: return "pt-PT";
  }
}

export function getNumberLocaleForCurrency(locale: string): string {
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("en")) return "en-US";
  if (normalized.startsWith("es")) return "es-ES";
  return "pt-BR";
}

export function formatCurrencyByLocale(value: number, locale: string): string {
  const currency = getCurrencyForLocale(locale);
  const numberLocale = getNumberLocaleForCurrency(locale);

  return value.toLocaleString(numberLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrency(value: number, locale: string, currency: string): string {
  const numberLocale = getNumberLocaleForCurrency(locale);

  return value.toLocaleString(numberLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrencyByCode(value: number, currency: string): string {
  const numberLocale = getNumberLocaleForCurrencyCode(currency);
  return value.toLocaleString(numberLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrencyRangeByCode(min: number, max: number, currency: string): string {
  return `${formatCurrencyByCode(min, currency)} - ${formatCurrencyByCode(max, currency)}`;
}

export function formatCurrencyRangeByLocale(min: number, max: number, locale: string): string {
  return `${formatCurrencyByLocale(min, locale)}–${formatCurrencyByLocale(max, locale)}`;
}

// ─── Conversão de câmbio em tempo real ──────────────────────────────────────
// Utiliza frankfurter.app (sem API key). Next.js faz cache automático 1 hora.

const FALLBACK_RATES: Record<string, number> = {
  "EUR-BRL": 6.1,
  "EUR-USD": 1.08,
  "USD-BRL": 5.65,
  "USD-EUR": 0.93,
  "BRL-EUR": 0.16,
  "BRL-USD": 0.18,
};

export async function getExchangeRate(from: string, to: string): Promise<number> {
  const fromUpper = from.toUpperCase();
  const toUpper   = to.toUpperCase();
  if (fromUpper === toUpper) return 1;

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${fromUpper}&to=${toUpper}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { rates: Record<string, number> };
    const rate = data.rates[toUpper];
    if (typeof rate !== "number") throw new Error(`Rate missing for ${toUpper}`);
    return rate;
  } catch {
    return FALLBACK_RATES[`${fromUpper}-${toUpper}`] ?? 1;
  }
}

/**
 * Converte `amount` de `fromCurrency` para a moeda do locale do utilizador
 * e formata o resultado. Usa taxas de câmbio em tempo real (cache 1 h).
 */
export async function convertAndFormatByLocale(
  amount: number,
  fromCurrency: string,
  locale: string,
): Promise<string> {
  const toCurrency = getCurrencyForLocale(locale);
  const fromUpper  = fromCurrency.toUpperCase();
  if (fromUpper === toCurrency) return formatCurrency(amount, locale, toCurrency);

  const rate      = await getExchangeRate(fromUpper, toCurrency);
  const converted = amount * rate;
  return formatCurrency(converted, locale, toCurrency);
}