import { expect, test } from "@playwright/test";

/**
 * Testa que o link "quick contact" na landing page aponta para a URL correta
 * em cada locale e que a página de contato carrega (200, sem 404).
 *
 * Locales e slugs esperados:
 *   pt  →  /portal/contato
 *   en  →  /portal/contact
 *   es  →  /portal/contacto
 */

const cases = [
  { locale: "pt", landingPath: "/",    expectedHref: "/portal/contato"  },
  { locale: "en", landingPath: "/en",  expectedHref: "/portal/contact"  },
  { locale: "es", landingPath: "/es",  expectedHref: "/portal/contacto" },
] as const;

for (const { locale, landingPath, expectedHref } of cases) {
  test(`[${locale}] link quick-contact aponta para ${expectedHref}`, async ({ page }) => {
    await page.goto(landingPath);

    // O link usa {t("lead.quickContact")} — localiza pelo href em vez do texto traduzido
    const link = page.locator(`a[href="${expectedHref}"]`).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", expectedHref);
  });

  test(`[${locale}] página ${expectedHref} carrega sem 404`, async ({ page }) => {
    const response = await page.goto(expectedHref);

    // A página redireciona para /portal/login (autenticação necessária) —
    // o importante é que NÃO retorne 404 nem 500.
    const status = response?.status() ?? 0;
    expect(status).not.toBe(404);
    expect(status).not.toBe(500);

    // Após o redirect para login, a URL não deve conter "/en/portal" nem "/es/portal"
    expect(page.url()).not.toMatch(/\/(en|es)\/portal/);
  });
}
