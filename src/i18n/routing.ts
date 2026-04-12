import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
  // PT em /, EN em /en/, ES em /es/
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
