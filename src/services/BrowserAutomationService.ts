import { Browser, Page, TimeoutError } from 'puppeteer';
import { initializeBrowser, closeBrowser, getNewPage, setHeadlessMode } from '../lib/puppeteer';
import { ElementAnalyzer, AnalysisResult } from '../analyzer/ElementAnalyzer';

// Helper function for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class BrowserAutomationService {
  private browser: Browser | null = null;
  private currentPage: Page | null = null;
  private headless: boolean = true;

  constructor(headless: boolean = true) {
    this.headless = headless;
    setHeadlessMode(this.headless);
  }

  setHeadlessMode(headless: boolean) {
    this.headless = headless;
    setHeadlessMode(headless);
  }

  async start(): Promise<void> {
    this.browser = await initializeBrowser(this.headless);
    // Optionally get a page immediately
    // this.currentPage = await this.getNewPage();
    console.log('Browser automation service started.');
  }

  async stop(): Promise<void> {
    if (this.currentPage) {
      try {
        await this.currentPage.close();
      } catch (error) {
        console.error('Error closing current page:', error);
      }
      this.currentPage = null;
    }
    await closeBrowser();
    this.browser = null; // Ensure browser instance is cleared
    console.log('Browser automation service stopped.');
  }

  async getNewPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call start() first.');
    }
    // Close existing page before creating a new one, or manage multiple pages
    if (this.currentPage) {
       try {
         await this.currentPage.close();
       } catch (error) {
         console.warn('Could not close previous page, it might have already been closed:', error);
       }
    }
    this.currentPage = await this.browser.newPage();
    // Add any default page setup here (e.g., user agent, viewport)
    return this.currentPage;
  }

  getCurrentPage(): Page | null {
      return this.currentPage;
  }

  getBrowser(): Browser | null {
      return this.browser;
  }

  // --- Core Automation Methods with Error Handling & Retries ---

  async navigate(url: string): Promise<void> {
    await this.retryOperation(async () => {
      if (!this.currentPage) throw new Error('Current page is not available for navigate.');
      console.log(`Navigating to ${url}...`);
      await this.currentPage.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Increased timeout
      console.log(`Navigation to ${url} successful.`);
    }, `navigate to ${url}`);
  }

  async click(selector: string): Promise<void> {
    await this.retryOperation(async () => {
      if (!this.currentPage) throw new Error('Current page is not available for click.');
      console.log(`Clicking selector ${selector}...`);
      await this.currentPage.waitForSelector(selector, { visible: true, timeout: 15000 });
      await this.currentPage.click(selector);
      console.log(`Clicked selector ${selector} successfully.`);
    }, `click selector ${selector}`);
  }

  async type(selector: string, text: string): Promise<void> {
    await this.retryOperation(async () => {
      if (!this.currentPage) throw new Error('Current page is not available for type.');
      console.log(`Typing into selector ${selector}...`);
      await this.currentPage.waitForSelector(selector, { visible: true, timeout: 15000 });
      // Consider clearing the field first if necessary: await this.currentPage.click(selector, { clickCount: 3 });
      await this.currentPage.type(selector, text, { delay: 50 });
      console.log(`Typed into selector ${selector} successfully.`);
    }, `type into selector ${selector}`);
  }

  async waitForSelector(selector: string, timeout: number = 30000): Promise<void> {
     await this.retryOperation(async () => {
        if (!this.currentPage) throw new Error('Current page is not available for waitForSelector.');
        console.log(`Waiting for selector ${selector}...`);
        await this.currentPage.waitForSelector(selector, { visible: true, timeout });
        console.log(`Selector ${selector} found.`);
     }, `wait for selector ${selector}`);
  }

  async screenshot(path: string): Promise<void> {
    // Retries might not be suitable for screenshots unless specifically needed
    try {
        if (!this.currentPage) throw new Error('Current page is not available for screenshot.');
        console.log(`Taking screenshot: ${path}...`);
        await this.currentPage.screenshot({ path, fullPage: true });
        console.log(`Screenshot saved to ${path}.`);
    } catch (error) {
        console.error(`Error taking screenshot ${path}:`, error);
        throw error; // Re-throw error for screenshot failures
    }
  }

  async getPageContent(): Promise<string> {
      // Retries might not be suitable here either
      try {
        if (!this.currentPage) throw new Error('Current page is not available for getPageContent.');
        return await this.currentPage.content();
      } catch (error) {
          console.error(`Error getting page content:`, error);
          throw error;
      }
  }

  // --- Error Handling & Retry Logic ---

  private async retryOperation<T>(
    operation: () => Promise<T>,
    description: string,
    maxRetries = 3,
    initialDelayMs = 500
  ): Promise<T> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        attempts++;
        // console.log(`Attempt ${attempts}/${maxRetries} for: ${description}`);
        return await operation();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorName = error instanceof Error ? error.constructor.name : 'UnknownError';

        console.warn(`Attempt ${attempts} failed for: ${description}. Error (${errorName}): ${errorMessage}`);

        if (attempts >= maxRetries) {
          console.error(`Operation failed after ${maxRetries} attempts: ${description}. Last error: ${errorName} - ${errorMessage}`);
          // Consider throwing a custom error with more context
          throw error; // Re-throw the last error
        }

        // Identify specific retryable errors
        const isTimeoutError = error instanceof TimeoutError;
        const isNetworkError = errorMessage.includes('net::'); // Common prefix for network errors
        const isContextDestroyed = errorMessage.includes('Execution context was destroyed');
        const isTargetClosed = errorMessage.includes('Target closed'); // e.g., page closed unexpectedly

        if (isTimeoutError || isNetworkError || isContextDestroyed || isTargetClosed) {
            const delayMs = initialDelayMs * Math.pow(2, attempts - 1);
            console.log(`Retryable error (${errorName}) detected. Retrying '${description}' in ${delayMs}ms...`);
            await delay(delayMs);
        } else {
            // Don't retry other errors (e.g., selector syntax errors, fatal protocol errors)
            console.error(`Non-retryable error (${errorName}) encountered during: ${description}. Failing operation.`);
            throw error;
        }
      }
    }
    // This line should theoretically be unreachable due to throws, but satisfies TypeScript
    throw new Error(`Operation failed after ${maxRetries} attempts: ${description}`);
  }

  // Placeholder for Electron Bridge (Task 3.23)
  // setupIpcHandlers(): void { ... }
  // sendStatusUpdate(status: string): void { ... }

  async analyzeElements(): Promise<AnalysisResult> {
    if (!this.currentPage) throw new Error('Current page is not available for analysis.');
    const analyzer = new ElementAnalyzer(this.currentPage);
    return await analyzer.analyzeCurrentPage();
  }

} 