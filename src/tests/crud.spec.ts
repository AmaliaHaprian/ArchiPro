// Playwright E2E tests for 3 important features: Add, Edit, Delete Project
import { test, expect } from '@playwright/test';
import type { Project } from "../models/Project";
const baseUrl = 'http://localhost:5173'; // Change if your dev server runs elsewhere

test.describe('Project Management E2E', () => {
  test('Add Project', async ({ page }) => {
    await page.goto(`${baseUrl}/addproject`);
    await page.fill('input[placeholder="Enter the project title"]', 'Test Project');
    await page.fill('input[placeholder="Residential"]', 'Test Category');
    await page.locator('input[placeholder="dd/mm/yyyy"]').nth(0).fill('2026-03-28');
    await page.locator('input[placeholder="dd/mm/yyyy"]').nth(1).fill('2026-04-28');
    await page.fill('input[placeholder="Write a short description"]', 'Test Description');
    await page.click('.add-project-button');
    await expect(page).toHaveURL(`${baseUrl}/overview`);
    await expect(page.locator('.project-cell').nth(0)).toHaveText('Test Project');
  });

  test('Edit Project', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto(`${baseUrl}/overview`, { waitUntil: 'domcontentloaded' });
    
    // Wait for project row to be visible
    await page.locator('.project-row').nth(0).waitFor({ timeout: 15000 });
    
    const projectRow = await page.locator('.project-row').nth(0);
    const id = await projectRow.getAttribute('data-project-id');

    // Navigate to edit page directly
    await page.goto(`${baseUrl}/edit/${id}`, { waitUntil: 'domcontentloaded' });
    
    // Wait for the form to load
    const titleInput = page.locator('input[placeholder="Enter the project title"]');
    await titleInput.waitFor({ timeout: 10000 });
    
    // Fill in the form
    await titleInput.clear();
    await titleInput.fill('Test Project Edited');
    
    // Click edit button
    const editButton = page.locator('button.edit-project-button');
    await editButton.waitFor({ timeout: 5000 });
    await editButton.click();
    
    // Wait for navigation to /project/:id page (where it redirects after editing)
    await page.waitForURL(`**/project/${id}`, { timeout: 20000 });
  });

  test('Delete Project', async ({ page }) => {
    await page.goto(`${baseUrl}/overview`);
    const projectRow= await page.locator('.project-row').nth(0);
    const projectTitle = await projectRow.locator('.project-cell').nth(0).textContent();
    const id = await projectRow.getAttribute('data-project-id');

    await page.click(`[aria-label="Open ${projectTitle}"]`);
    await expect(page.url()).toContain(`/project/${id}`);

    await page.click('button:has-text("Delete")');
    await expect(page).toHaveURL(`${baseUrl}/overview`);

    const projectRow2= await page.locator('.project-row').nth(0);
    const id2 = await projectRow2.getAttribute('data-project-id');
    expect(id).not.toBe(id2);
  });

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
