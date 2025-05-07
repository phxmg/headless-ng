import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;
let headlessMode: boolean = true; // Default to headless

export function setHeadlessMode(headless: boolean) {
  headlessMode = headless;
}

export async function initializeBrowser(headless: boolean = headlessMode): Promise<Browser> {
  if (browserInstance) {
    return browserInstance;
  }
  browserInstance = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended for server environments
  });
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// Basic function to get a new page
export async function getNewPage() {
  const browser = await initializeBrowser();
  const page = await browser.newPage();
  // You might want to add default page settings here
  // e.g., page.setUserAgent(...)
  return page;
} 