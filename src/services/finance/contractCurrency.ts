import "server-only";

import {
  getCurrencyForLocale,
  getExchangeRate,
  normalizeSupportedCurrency,
  type SupportedCurrency,
} from "@/lib/currency";

type ResolveContractCurrencyInput = {
  explicitCurrency?: string | null;
  organizationCurrency?: string | null;
  userCurrency?: string | null;
  locale?: string | null;
  fallbackCurrency?: SupportedCurrency;
};

type LockContractAmountInput = {
  baseAmount: number;
  baseCurrency?: SupportedCurrency;
  contractCurrency: SupportedCurrency;
};

type FinancialDueDates = {
  entry?: string | null;
  final?: string | null;
};

export function resolveContractCurrency(input: ResolveContractCurrencyInput): SupportedCurrency {
  const explicitCurrency = normalizeSupportedCurrency(input.explicitCurrency);
  if (explicitCurrency) return explicitCurrency;

  const organizationCurrency = normalizeSupportedCurrency(input.organizationCurrency);
  if (organizationCurrency) return organizationCurrency;

  const userCurrency = normalizeSupportedCurrency(input.userCurrency);
  if (userCurrency) return userCurrency;

  if (input.locale) {
    return getCurrencyForLocale(input.locale) as SupportedCurrency;
  }

  return input.fallbackCurrency ?? "EUR";
}

export async function lockContractAmount(input: LockContractAmountInput) {
  const baseCurrency = input.baseCurrency ?? "EUR";
  const contractFxRate = baseCurrency === input.contractCurrency
    ? 1
    : await getExchangeRate(baseCurrency, input.contractCurrency);
  const totalAmountCents = Math.round(input.baseAmount * contractFxRate * 100);

  return {
    contractCurrency: input.contractCurrency,
    contractFxRate,
    contractFxLockedAt: new Date(),
    estimatedValue: totalAmountCents / 100,
    totalAmountCents,
  };
}

export function validatePaymentMethodCurrency(method: string, currency: SupportedCurrency): string | null {
  if (method === "MANUAL_PIX" && currency !== "BRL") {
    return "PIX manual só pode ser usado quando a moeda contratual é BRL.";
  }

  return null;
}

export function buildInstallments(
  totalAmountCents: number,
  currency: SupportedCurrency,
  downPaymentPct: number,
  method: string,
  dueDates?: FinancialDueDates,
) {
  const entryCents = downPaymentPct > 0 ? Math.round(totalAmountCents * downPaymentPct / 100) : totalAmountCents;

  if (downPaymentPct > 0) {
    return [
      {
        sequence: 1,
        amountCents: entryCents,
        currency,
        method,
        dueDate: dueDates?.entry ? new Date(dueDates.entry) : null,
      },
      {
        sequence: 2,
        amountCents: totalAmountCents - entryCents,
        currency,
        method,
        dueDate: dueDates?.final ? new Date(dueDates.final) : null,
      },
    ];
  }

  return [{ sequence: 1, amountCents: totalAmountCents, currency, method, dueDate: null }];
}

export function getPersistedCurrency(...values: Array<string | null | undefined>): SupportedCurrency {
  for (const value of values) {
    const normalized = normalizeSupportedCurrency(value);
    if (normalized) return normalized;
  }

  return "EUR";
}