// ATENCAO: helpers baseados em locale servem apenas para EXIBICAO de estimativas
// e propostas. Eles NAO devem ser usados para Stripe, invoices ou qualquer fluxo
// de cobranca real sem uma moeda persistida e, idealmente, conversao cambial.

export function getCurrencyForLocale(locale: string): "BRL" | "USD" | "EUR" {
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("en")) return "USD";
  if (normalized.startsWith("es")) return "EUR";
  return "BRL";
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

export function formatCurrencyRangeByLocale(min: number, max: number, locale: string): string {
  return `${formatCurrencyByLocale(min, locale)}–${formatCurrencyByLocale(max, locale)}`;
}