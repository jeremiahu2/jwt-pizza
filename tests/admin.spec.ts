import { test, expect } from 'playwright-test-coverage';

test.beforeEach(async ({ page }) => {
  let users = [
    {
      id: 1,
      name: 'Service Tester',
      email: 'tester@test.com',
      roles: [{ role: 'diner' }]
    }
  ];
  await page.route('**/api/auth', async route => {
    const method = route.request().method();
    if (method === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 999,
            name: 'Admin User',
            email: 'a@jwt.com',
            roles: [{ role: 'admin' }]
          },
          token: 'fake-token'
        })
      });
      return;
    }
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 2,
            name: body.name,
            email: body.email,
            roles: [{ role: 'diner' }]
          },
          token: 'fake-token'
        })
      });
      return;
    }
    if (method === 'DELETE') {
      await route.fulfill({ status: 200, body: '{}' });
      return;
    }
  });
  await page.route('**/api/user/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 999,
        name: 'Admin User',
        email: 'a@jwt.com',
        roles: [{ role: 'admin' }]
      })
    });
  });
  await page.route('**/api/user*', async route => {
    const method = route.request().method();
    const url = route.request().url();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users })
      });
      return;
    }
    if (method === 'DELETE') {
      const id = Number(url.split('/').pop());
      users = users.filter(u => u.id !== id);
      await route.fulfill({
        status: 200,
        body: '{}'
      });
      return;
    }
    if (method === 'PUT') {
      const body = route.request().postDataJSON();
      users = users.map(u => (u.id === body.id ? body : u));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: body,
          token: 'fake-token'
        })
      });
    }
  });
});

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
  const userRow = page.locator('table').getByRole('row').filter({
    hasText: 'Service Tester'
  });
  await userRow.getByRole('button', { name: 'Delete' }).click();
  await expect(userRow).toHaveCount(0);
});