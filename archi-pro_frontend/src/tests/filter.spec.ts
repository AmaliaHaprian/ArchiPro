// Playwright E2E tests for 3 important features: Add, Edit, Delete Project
import { test, expect } from '@playwright/test';
import type { Project } from "../models/Project";
const baseUrl = 'http://localhost:5173';

test.describe('Filter and search functionalities', () => {
    test('Search Projects by Title', async ({ page }) => {
    await page.goto(`${baseUrl}/overview`);
    await page.fill('input[placeholder="Search..."]', 'Metro');
    await expect(page.locator('.project-cell').nth(0)).toHaveText('Metro Station');
  });

  test('Filter Projects by Category', async ({ page }) => {
    await page.goto(`${baseUrl}/overview`);
    const categoryFilter = page.locator('#category-filter');
    await categoryFilter.selectOption('Landscape');
    await expect(page.locator('.project-cell').nth(0)).toHaveText('Urban Park');
  });

});