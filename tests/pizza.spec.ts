import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';

type RoleType = { role: string };
  type User = {
    id: string;
    name: string;
    email: string;
    password?: string;
    roles: RoleType[];
  };
const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: 'diner' }] },
                                           'a@jwt.com': { id: '1', name: 'Admin User', email: 'a@jwt.com', password: 'a', roles: [{ role: 'admin'}] },
                                           'f@jwt.com': { id: '2', name: 'Franchise User', email: 'f@jwt.com', password: 'franchisee', roles: [{ role: 'Franchise'}] }};

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });
  await page.goto('/');
}

test('admin dashboard renders', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-token');
  });
  await page.route('**/api/user/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        name: 'Admin User',
        email: 'admin@test.com',
        roles: [{ role: 'admin' }],
      }),
    });
  });
  await page.route('**/api/franchise*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        franchises: [],
        more: false,
      }),
    });
  });
  await page.goto('/admin-dashboard');
  await expect(page.getByText('Franchises')).toBeVisible();
});

test('diner dashboard renders', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-token');
  });
  await page.route('**/api/user/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '2',
        name: 'Diner User',
        email: 'diner@test.com',
        roles: [{ role: 'diner' }],
      }),
    });
  });
  await page.route('**/api/order', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'history1',
        dinerId: '2',
        orders: [],
      }),
    });
  });
  await page.goto('/diner-dashboard');
  await expect(page.getByText(/order/i)).toBeVisible();
});

test('franchise dashboard renders', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-token');
  });
  await page.route('**/api/user/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '3',
        name: 'Franchise Owner',
        email: 'franchise@test.com',
        roles: [{ role: 'franchisee' }],
      }),
    });
  });
  await page.route('**/api/franchise/3', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'f1',
          name: 'Test Franchise',
          admins: [{ name: 'Franchise Owner', email: 'franchise@test.com' }],
          stores: [],
        },
      ]),
    });
  });
  await page.goto('/franchise-dashboard');
  await expect(page.getByRole('columnheader', { name: 'Franchise Fee' })).toBeVisible();
});

test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('button', { name: 'Order now' }).click();
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();
  await expect(page.getByText('0.008')).toBeVisible();
});

test('visit static pages', async ({ page }) => {
  const routes = ['/', '/about', '/docs', '/not-found'];
  for (const route of routes) {
    await page.goto(route);
    await expect(page).toHaveURL(route);
    await expect(page.locator('main')).toBeVisible();
  }
});

test('register page', async ({ page }) => {
  await page.goto('/register');
  await expect(page.locator('form')).toBeVisible();
});

test('visit menu and order', async ({ page }) => {
  await basicInit(page);
  await page.goto('/menu');
  await expect(page.locator('text=Veggie')).toBeVisible();
});

test('close franchise page renders', async ({ page }) => {
  await page.goto('/close-franchise');
  await expect(page.locator('body')).toBeVisible();
});

test('close store page renders', async ({ page }) => {
  await page.goto('/close-store');
  await expect(page.locator('body')).toBeVisible();
});

test('create franchise page renders', async ({ page }) => {
  await page.goto('/create-franchise');
  await expect(page.locator('body')).toBeVisible();
});

test('create store page renders', async ({ page }) => {
  await page.goto('/create-store');
  await expect(page.locator('body')).toBeVisible();
});

test('history page renders', async ({ page }) => {
  await page.goto('/history');
  await expect(page.locator('body')).toBeVisible();
});

test('logout page renders', async ({ page }) => {
  await page.goto('/logout');
  await expect(page.locator('body')).toBeVisible();
});