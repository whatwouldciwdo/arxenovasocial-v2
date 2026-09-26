import { expect, test } from '@playwright/test';

// Keep this audit independent of the complete interaction capture so failures
// elsewhere cannot obscure the menu's breakpoint and keyboard contract.
for (const width of [1920, 1440, 1024, 992, 991, 768, 767, 375]) {
  test(`menu audit: visibility and keyboard at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const menu = page.locator('[data-menu-btn]');
    await expect(menu).toHaveCount(1);
    // These inline styles are set by the menu initializer itself, not sound.
    await expect.poll(() => page.locator('.menu_overlay_close').evaluate((element) => ({
      pointerEvents: (element as HTMLElement).style.pointerEvents,
      visibility: (element as HTMLElement).style.visibility,
    }))).toEqual({ pointerEvents: 'none', visibility: 'hidden' });

    await menu.focus();
    const evidence = await menu.evaluate((element) => ({
      viewport: { width: innerWidth, height: innerHeight },
      tag: element.tagName,
      display: getComputedStyle(element).display,
      rectangle: element.getBoundingClientRect().toJSON(),
      focused: document.activeElement === element,
      initialStatus: document.body.dataset.navigationStatus,
    }));
    await testInfo.attach('menu-before-input', {
      body: JSON.stringify(evidence, null, 2), contentType: 'application/json',
    });

    if (width >= 768) {
      await expect(menu).toBeHidden();
      await expect(menu).not.toBeFocused();
      expect(evidence.display).toBe('none');
      await page.keyboard.press('Enter');
      await expect(page.locator('body')).toHaveAttribute('data-navigation-status', 'is-close');
      return;
    }

    await expect(menu).toBeVisible();
    await expect(menu).toBeFocused();
    for (const key of ['Enter', 'Space']) {
      await menu.focus();
      await expect(menu).toBeFocused();
      await page.keyboard.press(key);
      await expect(page.locator('body')).toHaveAttribute('data-navigation-status', 'is-open');
      await expect(page.locator('body')).toHaveClass(/overflow-hidden/);
      await expect(page.locator('body')).toHaveAttribute('data-lenis-prevent', 'true');
      await page.keyboard.press('Escape');
      await expect(page.locator('body')).toHaveAttribute('data-navigation-status', 'is-closed');
      await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
      await expect(page.locator('body')).not.toHaveAttribute('data-lenis-prevent', 'true');
    }
  });
}