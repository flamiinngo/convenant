import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('navbar is sticky and renders logo', async ({ page }) => {
    await page.goto('/')
    const navbar = page.locator('.navbar')
    await expect(navbar).toBeVisible()
    await expect(page.locator('.nav-logo')).toContainText('COVENANT')
  })

  test('navigates to docs page', async ({ page }) => {
    await page.goto('/')
    await page.locator('.nav-link[href="/docs"], a[href="/docs"]').first().click()
    await expect(page).toHaveURL('/docs')
    await expect(page.locator('.docs-title')).toBeVisible()
  })

  test('navigates back to home from docs', async ({ page }) => {
    await page.goto('/docs')
    await page.locator('.nav-logo').click()
    await expect(page).toHaveURL('/')
  })

  test('active link indicator on home', async ({ page }) => {
    await page.goto('/')
    const homeLink = page.locator('.nav-link.active')
    await expect(homeLink).toBeVisible()
  })

  test('active link indicator on docs', async ({ page }) => {
    await page.goto('/docs')
    const docsLink = page.locator('.nav-link.active')
    await expect(docsLink).toContainText('How it works')
  })

  test.describe('Mobile hamburger', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('hamburger button visible on mobile', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('.nav-hamburger')).toBeVisible()
    })

    test('desktop nav links hidden on mobile', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('.nav-right')).toBeHidden()
    })

    test('drawer opens and closes', async ({ page }) => {
      await page.goto('/')
      const hamburger = page.locator('.nav-hamburger')
      const drawer    = page.locator('.mobile-drawer')

      await expect(drawer).toBeHidden()
      await hamburger.click()
      await expect(drawer).toBeVisible()
      await hamburger.click()
      await expect(drawer).toBeHidden()
    })

    test('clicking a drawer link closes it', async ({ page }) => {
      await page.goto('/')
      await page.locator('.nav-hamburger').click()
      await page.locator('.mobile-nav-link[href="/docs"]').click()
      await expect(page).toHaveURL('/docs')
      await expect(page.locator('.mobile-drawer')).toBeHidden()
    })
  })
})
