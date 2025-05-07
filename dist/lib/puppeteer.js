"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHeadlessMode = setHeadlessMode;
exports.initializeBrowser = initializeBrowser;
exports.closeBrowser = closeBrowser;
exports.getNewPage = getNewPage;
const puppeteer_1 = __importDefault(require("puppeteer"));
let browserInstance = null;
let headlessMode = true; // Default to headless
function setHeadlessMode(headless) {
    headlessMode = headless;
}
async function initializeBrowser(headless = headlessMode) {
    if (browserInstance) {
        return browserInstance;
    }
    browserInstance = await puppeteer_1.default.launch({
        headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended for server environments
    });
    return browserInstance;
}
async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}
// Basic function to get a new page
async function getNewPage() {
    const browser = await initializeBrowser();
    const page = await browser.newPage();
    // You might want to add default page settings here
    // e.g., page.setUserAgent(...)
    return page;
}
//# sourceMappingURL=puppeteer.js.map