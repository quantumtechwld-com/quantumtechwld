"use client";

import { useTranslations } from "next-intl";

export function PrintButton() {
  const t = useTranslations("portal");
  return (
    <button
      onClick={() => globalThis.print()}
      className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light print:hidden"
    >
      {t("invoicePrintBtn")}
    </button>
  );
}
