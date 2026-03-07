import { Before, After, setDefaultTimeout, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { type ChildProcess, spawn } from 'child_process';

setDefaultTimeout(30_000);

let browser: Browser;
let devServer: ChildProcess;

// Store objects in the Cucumber world
declare module '@cucumber/cucumber' {
  interface World {
    browser: Browser;
    context: BrowserContext;
    page: Page;
  }
}

async function waitForServer(url: string, timeoutMs = 20_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

BeforeAll(async function () {
  // Kill any lingering dev servers on our port
  try {
    const { execSync } = await import('child_process');
    execSync('lsof -ti :5174 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch { /* ignore */ }

  // Start dev server
  devServer = spawn('npx', ['vite', '--port', '5174', '--strictPort'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true,
  });

  // Wait for dev server to be ready by polling
  await waitForServer('http://localhost:5174');

  browser = await chromium.launch({ headless: true });
});

AfterAll(async function () {
  await browser?.close();
  if (devServer) {
    devServer.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
});

Before(async function () {
  this.browser = browser;
  this.context = await browser.newContext();
  this.page = await this.context.newPage();

  // Navigate first, then clear IndexedDB for clean state
  await this.page.goto('http://localhost:5174/credit-card-rewards-pwa/');
  await this.page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase('CreditCardRewardsDB');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => resolve();
    });
  });
  // Reload after clearing DB so the app re-initializes
  await this.page.reload();
  await this.page.waitForLoadState('networkidle');
});

After(async function ({ result }) {
  if (result?.status === 'FAILED') {
    const screenshot = await this.page?.screenshot();
    if (screenshot) {
      this.attach(screenshot, 'image/png');
    }
  }
  await this.context?.close();
});
