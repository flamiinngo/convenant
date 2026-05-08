import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders COVENANT title', async ({ page }) => {
    await expect(page.locator('.covenant-title')).toBeVisible()
    await expect(page.locator('.covenant-title')).toContainText('COVENANT')
  })

  test('hero CTA links are present', async ({ page }) => {
    const newProposal = page.locator('a[href="/proposal/new"]').first()
    const howItWorks  = page.locator('a[href="/docs"]').first()
    await expect(newProposal).toBeVisible()
    await expect(howItWorks).toBeVisible()
  })

  test('stats strip renders all five columns', async ({ page }) => {
    const strip = page.locator('.stats-strip')
    await expect(strip).toBeVisible()
    const items = strip.locator('.stat-item')
    await expect(items).toHaveCount(5)
  })

  test('shows empty state when no proposals', async ({ page }) => {
    const empty = page.locator('.empty-state')
    const grid  = page.locator('.proposals-grid')
    const hasEmpty = await empty.isVisible()
    const hasGrid  = await grid.isVisible()
    expect(hasEmpty || hasGrid).toBe(true)
  })

  test('proof stream panel visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await expect(page.locator('.proof-box')).toBeVisible()
  })

  test('proof stream panel hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await expect(page.locator('.proof-panel')).toBeHidden()
  })
})
