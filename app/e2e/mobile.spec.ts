import { test, expect } from '@playwright/test'

const MOBILE = { width: 375, height: 812 }
const TABLET = { width: 768, height: 1024 }

test.describe('Mobile layout', () => {
  test('hamburger visible, desktop nav hidden at 375px', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
    await expect(page.locator('.nav-hamburger')).toBeVisible()
    await expect(page.locator('.nav-right')).toBeHidden()
  })

  test('hero layout stacks to single column at 375px', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
    const hero = page.locator('.hero-layout')
    const box  = await hero.boundingBox()
    // At 375px, hero should not be wider than the viewport
    expect(box?.width).toBeLessThanOrEqual(375)
  })

  test('proof panel hidden at 375px', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
    await expect(page.locator('.proof-panel')).toBeHidden()
  })

  test('stats strip scrollable at mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
    const strip = page.locator('.stats-strip')
    await expect(strip).toBeVisible()
    const overflow = await strip.evaluate(el =>
      window.getComputedStyle(el).overflowX
    )
    expect(['auto', 'scroll']).toContain(overflow)
  })

  test('proposal layout stacks at 768px', async ({ page }) => {
    await page.setViewportSize(TABLET)
    await page.goto('/proposal/1')
    const layout = page.locator('.proposal-layout')
    if (await layout.isVisible({ timeout: 8000 })) {
      const cols = await layout.evaluate(el =>
        window.getComputedStyle(el).gridTemplateColumns
      )
      expect(cols).toBe('1fr')
    }
  })

  test('docs steps stack to single column at 375px', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/docs')
    const grid = page.locator('.steps-grid')
    const cols = await grid.evaluate(el =>
      window.getComputedStyle(el).gridTemplateColumns
    )
    expect(cols).toBe('1fr')
  })

  test('new proposal form accessible at 375px', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/proposal/new')
    await expect(page.locator('.new-proposal-title')).toBeVisible()
    // No horizontal overflow
    const body = await page.evaluate(() => document.body.scrollWidth)
    expect(body).toBeLessThanOrEqual(375 + 2)
  })

  test('modal fits within mobile viewport', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/proposal/1')
    const badge = page.locator('.badge-voting')
    if (await badge.isVisible({ timeout: 8000 })) {
      await page.locator('.commit-btn').click()
      const modal = page.locator('.modal-inner')
      const box   = await modal.boundingBox()
      expect(box?.width).toBeLessThanOrEqual(MOBILE.width)
    }
  })
})
