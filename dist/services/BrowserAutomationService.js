"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserAutomationService = void 0;
const puppeteer_1 = require("puppeteer");
const puppeteer_2 = require("../lib/puppeteer");
const ElementAnalyzer_1 = require("../analyzer/ElementAnalyzer");
// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
class BrowserAutomationService {
    constructor(headless = true) {
        this.browser = null;
        this.currentPage = null;
        this.headless = true;
        this.headless = headless;
        (0, puppeteer_2.setHeadlessMode)(this.headless);
    }
    setHeadlessMode(headless) {
        this.headless = headless;
        (0, puppeteer_2.setHeadlessMode)(headless);
    }
    async start() {
        this.browser = await (0, puppeteer_2.initializeBrowser)(this.headless);
        // Optionally get a page immediately
        // this.currentPage = await this.getNewPage();
        console.log('Browser automation service started.');
    }
    async stop() {
        if (this.currentPage) {
            try {
                await this.currentPage.close();
            }
            catch (error) {
                console.error('Error closing current page:', error);
            }
            this.currentPage = null;
        }
        await (0, puppeteer_2.closeBrowser)();
        this.browser = null; // Ensure browser instance is cleared
        console.log('Browser automation service stopped.');
    }
    async getNewPage() {
        if (!this.browser) {
            throw new Error('Browser not initialized. Call start() first.');
        }
        // Close existing page before creating a new one, or manage multiple pages
        if (this.currentPage) {
            try {
                await this.currentPage.close();
            }
            catch (error) {
                console.warn('Could not close previous page, it might have already been closed:', error);
            }
        }
        this.currentPage = await this.browser.newPage();
        // Add any default page setup here (e.g., user agent, viewport)
        return this.currentPage;
    }
    getCurrentPage() {
        return this.currentPage;
    }
    getBrowser() {
        return this.browser;
    }
    // --- Core Automation Methods with Error Handling & Retries ---
    async navigate(url) {
        await this.retryOperation(async () => {
            if (!this.currentPage)
                throw new Error('Current page is not available for navigate.');
            console.log(`Navigating to ${url}...`);
            await this.currentPage.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Increased timeout
            console.log(`Navigation to ${url} successful.`);
        }, `navigate to ${url}`);
    }
    async click(selector) {
        await this.retryOperation(async () => {
            if (!this.currentPage)
                throw new Error('Current page is not available for click.');
            console.log(`Clicking selector ${selector}...`);
            await this.currentPage.waitForSelector(selector, { visible: true, timeout: 15000 });
            await this.currentPage.click(selector);
            console.log(`Clicked selector ${selector} successfully.`);
        }, `click selector ${selector}`);
    }
    async type(selector, text) {
        await this.retryOperation(async () => {
            if (!this.currentPage)
                throw new Error('Current page is not available for type.');
            console.log(`Typing into selector ${selector}...`);
            await this.currentPage.waitForSelector(selector, { visible: true, timeout: 15000 });
            // Consider clearing the field first if necessary: await this.currentPage.click(selector, { clickCount: 3 });
            await this.currentPage.type(selector, text, { delay: 50 });
            console.log(`Typed into selector ${selector} successfully.`);
        }, `type into selector ${selector}`);
    }
    async waitForSelector(selector, timeout = 30000) {
        await this.retryOperation(async () => {
            if (!this.currentPage)
                throw new Error('Current page is not available for waitForSelector.');
            console.log(`Waiting for selector ${selector}...`);
            await this.currentPage.waitForSelector(selector, { visible: true, timeout });
            console.log(`Selector ${selector} found.`);
        }, `wait for selector ${selector}`);
    }
    async screenshot(path) {
        // Retries might not be suitable for screenshots unless specifically needed
        try {
            if (!this.currentPage)
                throw new Error('Current page is not available for screenshot.');
            console.log(`Taking screenshot: ${path}...`);
            await this.currentPage.screenshot({ path, fullPage: true });
            console.log(`Screenshot saved to ${path}.`);
        }
        catch (error) {
            console.error(`Error taking screenshot ${path}:`, error);
            throw error; // Re-throw error for screenshot failures
        }
    }
    async getPageContent() {
        // Retries might not be suitable here either
        try {
            if (!this.currentPage)
                throw new Error('Current page is not available for getPageContent.');
            return await this.currentPage.content();
        }
        catch (error) {
            console.error(`Error getting page content:`, error);
            throw error;
        }
    }
    // --- Error Handling & Retry Logic ---
    async retryOperation(operation, description, maxRetries = 3, initialDelayMs = 500) {
        let attempts = 0;
        while (attempts < maxRetries) {
            try {
                attempts++;
                // console.log(`Attempt ${attempts}/${maxRetries} for: ${description}`);
                return await operation();
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorName = error instanceof Error ? error.constructor.name : 'UnknownError';
                console.warn(`Attempt ${attempts} failed for: ${description}. Error (${errorName}): ${errorMessage}`);
                if (attempts >= maxRetries) {
                    console.error(`Operation failed after ${maxRetries} attempts: ${description}. Last error: ${errorName} - ${errorMessage}`);
                    // Consider throwing a custom error with more context
                    throw error; // Re-throw the last error
                }
                // Identify specific retryable errors
                const isTimeoutError = error instanceof puppeteer_1.TimeoutError;
                const isNetworkError = errorMessage.includes('net::'); // Common prefix for network errors
                const isContextDestroyed = errorMessage.includes('Execution context was destroyed');
                const isTargetClosed = errorMessage.includes('Target closed'); // e.g., page closed unexpectedly
                if (isTimeoutError || isNetworkError || isContextDestroyed || isTargetClosed) {
                    const delayMs = initialDelayMs * Math.pow(2, attempts - 1);
                    console.log(`Retryable error (${errorName}) detected. Retrying '${description}' in ${delayMs}ms...`);
                    await delay(delayMs);
                }
                else {
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
    async analyzeElements() {
        if (!this.currentPage)
            throw new Error('Current page is not available for analysis.');
        const analyzer = new ElementAnalyzer_1.ElementAnalyzer(this.currentPage);
        return await analyzer.analyzeCurrentPage();
    }
}
exports.BrowserAutomationService = BrowserAutomationService;
//# sourceMappingURL=BrowserAutomationService.js.map