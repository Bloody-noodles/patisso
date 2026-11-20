import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";

test("desktop and mobile release QA: layout, images, links and accessibility", async ({ page }, testInfo) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    (window as Window & { __lcp?: number }).__lcp = 0;
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      (window as Window & { __lcp?: number }).__lcp = entries[entries.length - 1]?.startTime ?? 0;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toContainText("Take a taste");
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.evaluate(() => {
    document.querySelectorAll("img").forEach(image => { (image as HTMLImageElement).loading = "eager"; });
  });

  await page.waitForFunction(() => {
    const images = Array.from(document.images);
    return images.length >= 42 && images.every(image => image.complete);
  }, null, { timeout: 180_000 });

  const imageAudit = await page.locator("img").evaluateAll(images =>
    images.map(image => ({
      alt: image.getAttribute("alt") ?? "",
      src: (image as HTMLImageElement).currentSrc,
      width: (image as HTMLImageElement).naturalWidth,
      loaded: (image as HTMLImageElement).naturalWidth > 0,
    }))
  );
  expect(imageAudit).toHaveLength(42);
  expect(imageAudit.filter(image => !image.loaded)).toEqual([]);
  expect(imageAudit.filter(image => !image.alt.trim())).toEqual([]);
  expect(await page.locator(".food-card").count()).toBe(36);
  expect(await page.locator(".food-card img").count()).toBe(36);

  const expectedLinks = [
    'a[href^="https://www.instagram.com/rigid_mayor"]',
    'a[href="https://vm.tiktok.com/ZS9PjaE9CtbNU-Nc38V/"]',
    'a[href="mailto:femiwaya183@gmail.com"]',
    'a[href="https://wa.me/2348135466718"]',
  ];
  for (const selector of expectedLinks) await expect(page.locator(selector).first()).toBeVisible();
  await expect(page.locator("footer")).toContainText("Zanzibar");
  expect(await page.locator('a[href="#"]').count()).toBe(0);

  const revealPage = async () => {
    const revealTargets = await page.locator("[data-reveal]").all();
    for (const target of revealTargets) {
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(450);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(450);
  };
  await revealPage();

  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(desktopOverflow).toBe(false);
  const desktopA11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  await page.screenshot({ path: testInfo.outputPath("patisso-desktop-viewport.png"), fullPage: false, animations: "disabled" });
  await page.screenshot({ path: testInfo.outputPath("patisso-desktop.png"), fullPage: true, animations: "disabled" });

  const performanceSnapshot = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return {
      largestContentfulPaintMs: (window as Window & { __lcp?: number }).__lcp ?? 0,
      timeToFirstByteMs: Math.round(navigation.responseStart),
      domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
      loadEventMs: Math.round(navigation.loadEventEnd),
      sameOriginTransferBytes: resources.reduce((sum, item) => sum + item.transferSize, 0),
      imageResourceCount: resources.filter(item => item.initiatorType === "img").length,
      resourceCount: resources.length,
    };
  });
  await testInfo.attach("desktop-performance.json", {
    body: JSON.stringify(performanceSnapshot, null, 2),
    contentType: "application/json",
  });
  await writeFile(testInfo.outputPath("desktop-performance.json"), JSON.stringify(performanceSnapshot, null, 2));
  console.log("PATISSO_PERFORMANCE_METRICS", JSON.stringify(performanceSnapshot));
  expect(performanceSnapshot.largestContentfulPaintMs).toBeGreaterThan(0);
  expect(performanceSnapshot.largestContentfulPaintMs).toBeLessThan(3_000);
  expect(performanceSnapshot.domContentLoadedMs).toBeLessThan(2_000);
  expect(performanceSnapshot.sameOriginTransferBytes).toBeLessThan(1_500_000);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await revealPage();
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(mobileOverflow).toBe(false);
  await expect(page.locator(".site-nav")).toBeVisible();
  const mobileNavFits = await page.locator(".site-nav").evaluate(element => element.scrollWidth <= element.clientWidth + 1);
  expect(mobileNavFits).toBe(true);
  const mobileGridColumns = await page.locator(".food-gallery").first().evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  expect(mobileGridColumns).toBe(2);
  const mobileA11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  await page.screenshot({ path: testInfo.outputPath("patisso-mobile-viewport.png"), fullPage: false, animations: "disabled" });
  await page.screenshot({ path: testInfo.outputPath("patisso-mobile.png"), fullPage: true, animations: "disabled" });

  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  expect(desktopA11y.violations).toEqual([]);
  expect(mobileA11y.violations).toEqual([]);
  expect(pageErrors).toEqual([]);
});
