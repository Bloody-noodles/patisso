import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("desktop and mobile release QA: layout, images, links and accessibility", async ({ page }, testInfo) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toContainText("Take a taste");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    document.querySelectorAll("img").forEach(image => { (image as HTMLImageElement).loading = "eager"; });
  });

  await page.waitForFunction(() => {
    const images = Array.from(document.images);
    return images.length >= 32 && images.every(image => image.complete && image.naturalWidth > 0);
  }, null, { timeout: 180_000 });

  const imageAudit = await page.locator("img").evaluateAll(images =>
    images.map(image => ({
      alt: image.getAttribute("alt") ?? "",
      src: (image as HTMLImageElement).currentSrc,
      width: (image as HTMLImageElement).naturalWidth,
    }))
  );
  expect(imageAudit).toHaveLength(32);
  expect(imageAudit.filter(image => !image.alt.trim())).toEqual([]);
  expect(await page.locator(".food-card").count()).toBe(28);
  expect(await page.locator(".food-card img").count()).toBe(28);

  const expectedLinks = [
    'a[href^="https://www.instagram.com/rigid_mayor"]',
    'a[href="https://vm.tiktok.com/ZS9PjaE9CtbNU-Nc38V/"]',
    'a[href="mailto:femiwaya183@gmail.com"]',
    'a[href="https://wa.me/2348135466718"]',
  ];
  for (const selector of expectedLinks) await expect(page.locator(selector).first()).toBeVisible();
  await expect(page.locator("footer")).toContainText("Zanzibar");
  expect(await page.locator('a[href="#"]').count()).toBe(0);

  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(desktopOverflow).toBe(false);
  const desktopA11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(desktopA11y.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("patisso-desktop.png"), fullPage: true, animations: "disabled" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(mobileOverflow).toBe(false);
  await expect(page.locator(".site-nav")).toBeVisible();
  await expect(page.locator(".food-gallery")).toHaveCSS("grid-template-columns", /\d+px\s+\d+px/);
  await page.screenshot({ path: testInfo.outputPath("patisso-mobile.png"), fullPage: true, animations: "disabled" });

  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  expect(pageErrors).toEqual([]);
});
