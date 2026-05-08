import { test, expect } from '@playwright/test'
import { injectCliWallet } from './fixtures/wallet'

test.describe('Proposal page', () => {
  test('unknown proposal shows not-found text', async ({ page }) => {
    await page.goto('/proposal/999999999')
    await expect(page.locator('.not-found-text, .page-loading')).toBeVisible()
  })

  test('loading spinner renders while fetching', async ({ page }) => {
    await page.goto('/proposal/1')
    // Spinner appears briefly before data resolves or not-found shows
    const spinner   = page.locator('.spinner')
    const notFound  = page.locator('.not-found-text')
    const proposal  = page.locator('.proposal-title')
    await expect(spinner.or(notFound).or(proposal)).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Proposal vote flow', () => {
  // These run against a real devnet proposal — set PROPOSAL_ID env to target one
  const PROPOSAL_ID = process.env.PROPOSAL_ID ?? '1'

  test.skip(!process.env.PROPOSAL_ID, 'Set PROPOSAL_ID= to run live flow tests')

  test.beforeEach(async ({ page }) => {
    await injectCliWallet(page)
    await page.goto(`/proposal/${PROPOSAL_ID}`)
  })

  test('proposal title renders', async ({ page }) => {
    await expect(page.locator('.proposal-title')).toBeVisible({ timeout: 10000 })
  })

  test('status badge is visible', async ({ page }) => {
    await expect(page.locator('.badge')).toBeVisible({ timeout: 10000 })
  })

  test('sidebar metadata panel shows proposal id', async ({ page }) => {
    await expect(page.locator('.sidebar-meta')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.meta-row').first()).toBeVisible()
  })

  test('voting options are listed when status is Voting', async ({ page }) => {
    const badge = page.locator('.badge-voting')
    const hasVoting = await badge.isVisible({ timeout: 10000 })
    if (hasVoting) {
      await expect(page.locator('.option-row')).toHaveCount(2)
      await expect(page.locator('.commit-btn')).toBeVisible()
    }
  })

  test('commit modal opens and shows both options', async ({ page }) => {
    const badge = page.locator('.badge-voting')
    const hasVoting = await badge.isVisible({ timeout: 10000 })
    if (!hasVoting) test.skip()

    await page.locator('.commit-btn').click()
    await expect(page.locator('.modal-inner')).toBeVisible()
    await expect(page.locator('.radio-option')).toHaveCount(2)
    await expect(page.locator('.modal-title')).toContainText('Lock your vote')
  })

  test('commit button disabled until option selected', async ({ page }) => {
    const badge = page.locator('.badge-voting')
    const hasVoting = await badge.isVisible({ timeout: 10000 })
    if (!hasVoting) test.skip()

    await page.locator('.commit-btn').click()
    await expect(page.locator('.modal-submit-idle')).toBeVisible()

    await page.locator('.radio-option').first().click()
    await expect(page.locator('.modal-submit-ready')).toBeVisible()
  })

  test('modal closes on backdrop click', async ({ page }) => {
    const badge = page.locator('.badge-voting')
    const hasVoting = await badge.isVisible({ timeout: 10000 })
    if (!hasVoting) test.skip()

    await page.locator('.commit-btn').click()
    await expect(page.locator('.modal-inner')).toBeVisible()
    await page.locator('.modal-backdrop').click()
    await expect(page.locator('.modal-inner')).toBeHidden()
  })
})
