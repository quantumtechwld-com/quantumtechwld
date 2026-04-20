import { expect, test } from "@playwright/test";

test("home renderiza a navegacao principal", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('a[href="/portal"]').first()).toBeVisible();
  await expect(page.locator('a[href="#lead"]').first()).toBeVisible();
});