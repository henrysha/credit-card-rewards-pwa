import { Before, After, setDefaultTimeout, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium, type Browser, type BrowserContext, type Page, type ConsoleMessage } from '@playwright/test';

setDefaultTimeout(60_000);

// Store objects in the Cucumber world
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

declare module '@cucumber/cucumber' {
  interface World {
    browser: Browser;
    context: BrowserContext;
    page: Page;
    testDbId?: string;
  }
}

let browser: Browser;
let server: http.Server;
const PORT = 5175;
const BASE_URL = `http://localhost:${PORT}/credit-card-rewards-pwa/`;

BeforeAll(async function () {
  // Start a static server to serve the dist directory with the correct base path
  const distPath = path.resolve(process.cwd(), 'dist');
  
  server = http.createServer((req, res) => {
    let filePath = req.url || '/';
    
    // Handle the base path /credit-card-rewards-pwa/
    if (filePath.startsWith('/credit-card-rewards-pwa/')) {
      filePath = filePath.replace('/credit-card-rewards-pwa/', '/');
    } else {
      // If it doesn't start with base path, it's a 404 in this simulated environment
      res.writeHead(404);
      res.end();
      return;
    }

    if (filePath === '/') filePath = '/index.html';
    
    // Remove query params
    filePath = filePath.split('?')[0];
    
    const fullPath = path.join(distPath, filePath);
    
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const ext = path.extname(fullPath);
      let contentType = 'text/html';
      if (ext === '.js') contentType = 'application/javascript';
      if (ext === '.css') contentType = 'text/css';
      if (ext === '.webmanifest') contentType = 'application/manifest+json';
      if (ext === '.png') contentType = 'image/png';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(fullPath).pipe(res);
    } else {
      // SPA Fallback: serve index.html for unknown routes starting with base path
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(distPath, 'index.html')).pipe(res);
    }
  });

  await new Promise<void>((resolve) => server.listen(PORT, resolve));

  browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
});

AfterAll(async function () {
  await browser?.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

Before(async function (scenario) {
  const dbId = scenario.pickle.id.replace(/[^a-zA-Z0-9]/g, '_');
  this.testDbId = dbId;
  
  this.browser = browser;
  
  // Create context with notifications permission granted by default
  // This is more reliable than grantPermissions in some environments
  this.context = await browser.newContext({
    permissions: ['notifications']
  });
  
  this.page = await this.context.newPage();

  // Capture console logs for debugging
  this.page.on('console', (msg: ConsoleMessage) => {
    console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
  });

  // Unregister service workers to avoid stale cache issues in tests
  await this.page.goto(BASE_URL);
  await this.page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  });

  await this.page.goto(`${BASE_URL}?test_db=${dbId}`);
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
