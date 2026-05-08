import { test, expect } from '@playwright/test'
import { injectCliWallet } from './fixtures/wallet'

test.describe('Create proposal — wallet gate', () => {
  test('shows connect wallet prompt when not connected', async ({ page }) => {
    await page.goto('/proposal/new')
    await expect(page.locator('.connect-gate')).toBeVisible()
    await expect(page.locator('.connect-gate-text')).toContainText('Connect a wallet')
  })

  test('form is not visible without wallet', async ({ page }) => {
    await page.goto('/proposal/new')
    await expect(page.locator('.proposal-form')).toBeHidden()
  })
})

test.describe('Create proposal — form', () => {
  test.beforeEach(async ({ page }) => {
    await injectCliWallet(page)
    await page.goto('/proposal/new')
  })

  test('form renders after wallet injected', async ({ page }) => {
    await expect(page.locator('.proposal-form')).toBeVisible()
  })

  test('submit is disabled with empty fields', async ({ page }) => {
    const btn = page.locator('.proposal-form-submit')
    await expect(btn).toBeDisabled()
  })

  test('form fields accept input', async ({ page }) => {
    await page.fill('input[placeholder*="Treasury"]',    'Test Proposal Alpha')
    await page.fill('textarea',                          'This is a test description.')
    await page.locator('input[placeholder*="Approve"]').fill('Option A')
    await page.locator('input[placeholder*="Reject"]').fill('Option B')

    await expect(page.locator('input[placeholder*="Treasury"]')).toHaveValue('Test Proposal Alpha')
    await expect(page.locator('textarea')).toHaveValue('This is a test description.')
  })

  test('submit button enables when all required fields filled', async ({ page }) => {
    const future = new Date(Date.now() + 7 * 86400 * 1000)
    const isoLocal = future.toISOString().slice(0, 16)

    await page.fill('input[placeholder*="Treasury"]',   'E2E Proposal')
    await page.locator('input[placeholder*="Approve"]').fill('Yes')
    await page.locator('input[placeholder*="Reject"]').fill('No')
    await page.locator('input[type="datetime-local"]').fill(isoLocal)

    await expect(page.locator('.proposal-form-submit')).toBeEnabled()
  })

  test('title field enforces 80 char max', async ({ page }) => {
    const input = page.locator('input[placeholder*="Treasury"]')
    await input.fill('x'.repeat(90))
    const val = await input.inputValue()
    expect(val.length).toBeLessThanOrEqual(80)
  })

  test('page title and subtitle visible', async ({ page }) => {
    await expect(page.locator('.new-proposal-title')).toContainText('Create a proposal')
    await expect(page.locator('.new-proposal-sub')).toBeVisible()
  })
})
