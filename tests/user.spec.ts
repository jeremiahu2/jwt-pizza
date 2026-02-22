import { test, expect } from 'playwright-test-coverage';

test('updateUser', async ({ page }) => {
  let currentUser = {
    name: 'pizza diner',
    email: '',
    role: 'diner'
  };
  await page.route('**/api/auth', async route => {
    const body = route.request().postDataJSON();
    currentUser.email = body.email;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-token',
        user: currentUser
      })
    });
  });
  await page.route('**/api/user', async route => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      currentUser.name = body.name;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentUser)
      });
    }
  });
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'pd' }).click();
  await expect(page.getByRole('main')).toContainText('pizza diner');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});