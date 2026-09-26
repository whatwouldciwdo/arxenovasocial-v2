import { expect, test, type Page } from '@playwright/test';

test.use({ video: 'on' });

async function ready(page: Page) {
  await expect(page.locator('.navbar_left_sound_btn')).toHaveAttribute('aria-pressed', /^(true|false)$/);
  await expect.poll(() => page.locator('.menu_overlay_close').evaluate(
    (element) => (element as HTMLElement).style.pointerEvents,
  )).toBe('none');
  // Initial Barba/preloader animation may still prevent navigation after init.
  await page.waitForTimeout(3000);
}

async function state(page: Page) {
  return page.evaluate(() => ({
    url: location.href,
    navigation: document.body.dataset.navigationStatus,
    about: document.body.dataset.aboutStatus,
    locked: document.body.classList.contains('overflow-hidden'),
    lenisPrevent: document.body.getAttribute('data-lenis-prevent'),
    focus: document.activeElement?.outerHTML.slice(0, 1000),
    focusInAbout: !!document.activeElement?.closest('.about_modal_wrap'),
    sound: localStorage.getItem('monolog_sound_enabled'),
  }));
}

test('closeout: sound enabled persistence after reload', async ({ page }, testInfo) => {
  await page.goto('/');
  await ready(page);
  const sound = page.locator('.navbar_left_sound_btn');
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await sound.focus();
  await expect(sound).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await ready(page);
  await testInfo.attach('sound-after-reload', { body: JSON.stringify(await state(page), null, 2), contentType: 'application/json' });
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
});

test('closeout: sound keyboard and client navigation persistence', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const sound = page.locator('.navbar_left_sound_btn');
  await sound.focus();
  await page.keyboard.press('Enter');
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await page.locator('a[href="/work"]:visible').first().click();
  await page.waitForURL(/\/work\/?$/);
  // Barba updates history before replacing the old container. Exercise the
  // destination control, not the outgoing Home button during leave animation.
  await expect(page.locator('[data-barba="container"][data-barba-namespace="work"]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => {
    const runtime = window as typeof window & { barba?: { transitions?: { isRunning: boolean } } };
    return runtime.barba?.transitions?.isRunning;
  })).toBe(false);
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await sound.focus();
  await page.keyboard.press('Space');
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await ready(page);
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
});

test('closeout: menu overlay and anchor navigation release scroll lock', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 767, height: 900 });
  await page.goto('/');
  await ready(page);
  const menu = page.locator('[data-menu-btn]');
  await menu.click();
  await expect(page.locator('body')).toHaveAttribute('data-navigation-status', 'is-open');
  await expect(page.locator('body')).toHaveClass(/overflow-hidden/);
  await page.locator('.menu_overlay_close').click({ position: { x: 5, y: 880 } });
  await expect(page.locator('body')).toHaveAttribute('data-navigation-status', 'is-closed');
  await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
  await menu.click();
  await page.locator('.menu_wrap a[href="#process"]:visible').click();
  await testInfo.attach('menu-after-anchor', { body: JSON.stringify(await state(page), null, 2), contentType: 'application/json' });
  await expect(page.locator('body')).toHaveAttribute('data-navigation-status', 'is-closed');
  await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
  await expect(page.locator('body')).not.toHaveAttribute('data-lenis-prevent', 'true');
  await expect(page.locator('[data-barba="container"]')).toHaveCount(1);
  await testInfo.attach('menu-after-navigation', { body: JSON.stringify(await state(page), null, 2), contentType: 'application/json' });
});

test('closeout: About overlay, Escape and focus observations', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await ready(page);
  const records = [];
  const opener = page.locator('[data-open-modal]:visible').first();
  await opener.focus();
  records.push({ phase: 'before', ...await state(page) });
  try {
    await opener.click();
    await expect(page.locator('body')).toHaveAttribute('data-about-status', 'is-open');
    await expect(page.locator('body')).toHaveClass(/overflow-hidden/);
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('.about_modal_wrap'))).toBe(true);
    const focusable = page.locator('.about_modal_wrap').locator('a[href],button,input,select,textarea,[tabindex]').filter({ visible: true });
    await focusable.last().focus();
    await page.keyboard.press('Tab');
    await expect(focusable.first()).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(focusable.last()).toBeFocused();
    records.push({ phase: 'open', ...await state(page) });
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).toHaveAttribute('data-about-status', 'is-closed');
    await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
    records.push({ phase: 'escape', ...await state(page) });
    await expect(opener).toBeFocused();
    await opener.click();
    await expect(page.locator('body')).toHaveAttribute('data-about-status', 'is-open');
    await page.locator('.about_overlay_close').click({ position: { x: 5, y: 450 } });
    await expect(page.locator('body')).toHaveAttribute('data-about-status', 'is-closed');
    await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
    await expect(page.locator('body')).not.toHaveAttribute('data-lenis-prevent', 'true');
    records.push({ phase: 'overlay', ...await state(page) });
    await expect(opener).toBeFocused();
  } finally {
    await testInfo.attach('about-focus-observations', { body: JSON.stringify(records, null, 2), contentType: 'application/json' });
  }
});