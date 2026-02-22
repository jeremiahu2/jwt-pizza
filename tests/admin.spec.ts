import { test, expect } from 'playwright-test-coverage';

test('admin can list users', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.getByText('Service Tester')).toBeVisible();
});

test('admin can delete a user', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  const userRow = page.locator('table').getByRole('row').filter({
    hasText: 'Service Tester'
  }).first();
  const deleteButton = userRow.getByRole('button', { name: 'Delete' });
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  await expect(userRow).toHaveCount(0);
});

//testing