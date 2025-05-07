const puppeteer = require('puppeteer');

class BrowserAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async launch() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  }

  async goto(url) {
    if (!this.page) throw new Error('Browser not launched. Call launch() first.');
    await this.page.goto(url);
  }

  async getTitle() {
    if (!this.page) throw new Error('No page available.');
    return await this.page.title();
  }

  async click(selector) {
    if (!this.page) throw new Error('No page available.');
    await this.page.click(selector);
  }

  async type(selector, text) {
    if (!this.page) throw new Error('No page available.');
    await this.page.type(selector, text);
  }

  async waitForSelector(selector, options) {
    if (!this.page) throw new Error('No page available.');
    await this.page.waitForSelector(selector, options);
  }

  async screenshot(path) {
    if (!this.page) throw new Error('No page available.');
    await this.page.screenshot({ path });
  }

  async select(selector, value) {
    if (!this.page) throw new Error('No page available.');
    await this.page.select(selector, value);
  }

  async hover(selector) {
    if (!this.page) throw new Error('No page available.');
    await this.page.hover(selector);
  }

  async scroll(x, y) {
    if (!this.page) throw new Error('No page available.');
    await this.page.evaluate((x, y) => window.scrollTo(x, y), x, y);
  }

  async waitForNavigation(options) {
    if (!this.page) throw new Error('No page available.');
    await this.page.waitForNavigation(options);
  }

  async getElementText(selector) {
    if (!this.page) throw new Error('No page available.');
    return await this.page.$eval(selector, el => el.textContent);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

module.exports = BrowserAutomation; 