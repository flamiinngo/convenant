import { test, expect } from '@playwright/test'

test.describe('Docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs')
  })

  test('renders page title', async ({ page }) => {
    await expect(page.locator('.docs-title')).toContainText('How Covenant works')
  })

  test('renders all 6 protocol steps', async ({ page }) => {
    const steps = page.locator('.step-card')
    await expect(steps).toHaveCount(6)
  })

  test('step cards show on-chain instruction code', async ({ page }) => {
    const codes = page.locator('.step-code')
    await expect(codes.first()).toBeVisible()
  })

  test('MPC section is present', async ({ page }) => {
    await expect(page.locator('.mpc-section')).toBeVisible()
    await expect(page.locator('.mpc-title')).toContainText('multi-party computation')
  })

  test('MPC diagram shows 7 rows', async ({ page }) => {
    const rows = page.locator('.mpc-row')
    await expect(rows).toHaveCount(7)
  })

  test('security properties grid has 4 cards', async ({ page }) => {
    const props = page.locator('.prop-card')
    await expect(props).toHaveCount(4)
  })

  test('CTA links to proposal creation', async ({ page }) => {
    const cta = page.locator('.docs-cta a[href="/proposal/new"]')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText('Create a proposal')
  })

  test('no icons rendered anywhere on page', async ({ page }) => {
    const svgs = page.locator('svg')
    const count = await svgs.count()
    expect(count).toBe(0)
  })
})
