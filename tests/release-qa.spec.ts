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
  const foodImageSources = await page.locator(".food-card img").evaluateAll(images => images.map(image => (image as HTMLImageElement).currentSrc));
  expect(new Set(foodImageSources).size).toBe(36);

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


test("authenticated central demo console updates private order tracking", async ({ page }) => {
  const healthResponse = await page.request.get("/api/health");
  expect(healthResponse.ok()).toBe(true);
  const health = await healthResponse.json();
  expect(health.ok).toBe(true);
  expect(typeof health.voiceConfigured).toBe("boolean");
  expect(["supabase-central-demo", "not-configured"]).toContain(health.orderStorage);
  expect(health.realPaymentsEnabled).toBe(false);
  expect(health.realFulfilmentEnabled).toBe(false);

  let status = "confirmed";
  const fixture = {
    reference: "A1B2C3D4",
    items: [{ name: "Penne Arrabbiata", quantity: 2, unitPrice: 18000, lineTotal: 36000 }],
    totalTsh: 36000,
    specialInstructions: "No extra chilli",
    status,
    createdAt: "2026-11-20T12:00:00.000Z",
  };

  await page.route("**/api/admin/session", route => route.fulfill({ status: 401, json: { authenticated: false } }));
  await page.route("**/api/admin/login", route => route.fulfill({ status: 200, json: { ok: true, email: "admin@example.com" } }));
  await page.route("**/api/admin/orders", async route => {
    if (route.request().method() === "PATCH") {
      const body = route.request().postDataJSON() as { status: string };
      status = body.status;
      return route.fulfill({ status: 200, json: { ok: true } });
    }
    return route.fulfill({ status: 200, json: { orders: [{ ...fixture, status }] } });
  });
  await page.route("**/api/orders/track?**", route => route.fulfill({
    status: 200,
    json: { order: { ...fixture, status } },
  }));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo-console");
  await expect(page.locator("h1")).toContainText("Admin");
  await page.getByLabel("ADMIN EMAIL").fill("admin@example.com");
  await page.getByLabel("PASSWORD").fill("test-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator(".console-order")).toContainText("A1B2C3D4");
  await expect(page.locator(".console-order")).toContainText("TSh 36,000");
  const consoleA11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(consoleA11y.violations).toEqual([]);
  await page.getByRole("button", { name: "Mark completed" }).click();
  await expect(page.locator(".console-status")).toHaveText("completed");
  const consoleOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(consoleOverflow).toBe(false);

  await page.goto("/track");
  await page.getByLabel("ORDER REFERENCE").fill("A1B2C3D4");
  await page.getByLabel("PRIVATE TRACKING KEY").fill("a".repeat(64));
  await page.getByRole("button", { name: "Find demo order" }).click();
  await expect(page.locator(".track-status")).toContainText("Demo order marked complete");
  await expect(page.locator(".track-receipt")).toContainText("Penne Arrabbiata");
  await expect(page.locator(".track-receipt")).toContainText("TSh 36,000");
});
