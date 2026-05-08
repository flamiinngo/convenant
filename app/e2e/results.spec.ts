import { test, expect } from '@playwright/test'

test.describe('Results page', () => {
  test('unknown results shows loading or not found', async ({ page }) => {
    await page.goto('/results/999999999')
    await expect(
      page.locator('.spinner, .not-found-text')
    ).toBeVisible({ timeout: 8000 })
  })

  test.describe('Live results', () => {
    const PROPOSAL_ID = process.env.FINALIZED_PROPOSAL_ID

    test.skip(!PROPOSAL_ID, 'Set FINALIZED_PROPOSAL_ID= to run results tests')

    test.beforeEach(async ({ page }) => {
      await page.goto(`/results/${PROPOSAL_ID}`)
    })

    test('results title renders', async ({ page }) => {
      await expect(page.locator('.results-title')).toBeVisible({ timeout: 10000 })
    })

    test('vote bars render', async ({ page }) => {
      await expect(page.locator('.vote-row')).toHaveCount(2, { timeout: 10000 })
    })

    test('winner announcement shows', async ({ page }) => {
      await expect(page.locator('.vote-winner')).toBeVisible({ timeout: 10000 })
    })

    test('back to proposal link works', async ({ page }) => {
      await page.locator('.results-back').click()
      await expect(page).toHaveURL(`/proposal/${PROPOSAL_ID}`)
    })

    test('ZK proof panel renders if proof exists', async ({ page }) => {
      const panel = page.locator('.zk-panel')
      const exists = await panel.isVisible({ timeout: 10000 })
      if (exists) {
        await expect(page.locator('.zk-stat')).toHaveCount(3)
        await expect(page.locator('.zk-hash-val')).toBeVisible()
      }
    })
  })
})
