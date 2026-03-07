import { Before, After, setDefaultTimeout, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';

setDefaultTimeout(60_000);

// Store objects in the Cucumber world
declare module '@cucumber/cucumber' {
  interface World {
    browser: Browser;
    context: BrowserContext;
    page: Page;
    testDbId?: string;
  }
}

let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
});

AfterAll(async function () {
  await browser?.close();
});

Before(async function (scenario) {
  const dbId = scenario.pickle.id.replace(/[^a-zA-Z0-9]/g, '_');
  this.testDbId = dbId;
  
  this.browser = browser;
  this.context = await browser.newContext();
  this.page = await this.context.newPage();

  // Navigate with the test_db parameter to isolate IndexedDB
  await this.page.goto(`http://localhost:5174/credit-card-rewards-pwa/?test_db=${dbId}`);
  await this.page.evaluate((id: string) => {
    sessionStorage.setItem('test_db', id);
  }, dbId);
  await this.page.waitForLoadState('networkidle');
});

After(async function (scenario) {
  if (scenario.result?.status === 'FAILED') {
    const screenshot = await this.page?.screenshot();
    if (screenshot) {
      this.attach(screenshot, 'image/png');
    }
  }

  // Clean up the dynamic DB to avoid bloating the test environment
  if (this.page && this.testDbId) {
    const dbName = `CCRewards_Test_${this.testDbId}`;
    await this.page.evaluate((name: string) => {
      return new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase(name);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    }, dbName);
  }

  await this.context?.close();
});
