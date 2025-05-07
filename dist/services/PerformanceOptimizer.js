"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizer = void 0;
const os = __importStar(require("os"));
class PerformanceOptimizer {
    constructor(options = {}) {
        this.browser = null;
        // Default to number of CPU cores (but at least 2)
        this.maxConcurrentPages = options.maxConcurrentPages || Math.max(os.cpus().length, 2);
        this.memoryWarningThreshold = options.memoryWarningThreshold || 1024; // Default: 1GB
        this.cpuWarningThreshold = options.cpuWarningThreshold || 80; // Default: 80%
        this.currentPages = new Set();
    }
    setBrowser(browser) {
        this.browser = browser;
    }
    /**
     * Register a page for monitoring
     */
    registerPage(page) {
        this.currentPages.add(page);
        // Clean up when the page is closed
        page.once('close', () => {
            this.currentPages.delete(page);
        });
    }
    /**
     * Unregister a page from monitoring
     */
    unregisterPage(page) {
        this.currentPages.delete(page);
    }
    /**
     * Get current resource usage info
     */
    async getResourceUsage() {
        const totalMem = os.totalmem() / (1024 * 1024); // Convert to MB
        const freeMem = os.freemem() / (1024 * 1024); // Convert to MB
        const usedMem = totalMem - freeMem;
        const percentUsed = (usedMem / totalMem) * 100;
        // We don't have a direct way to get process CPU in Node.js
        // This is a simplified approximation that could be improved
        const cpuUsage = process.cpuUsage();
        const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000) * 10; // Rough estimate
        return {
            memory: {
                total: Math.round(totalMem),
                free: Math.round(freeMem),
                used: Math.round(usedMem),
                percentUsed: Math.round(percentUsed)
            },
            cpu: Math.min(Math.round(cpuPercent), 100), // Cap at 100%
            pages: this.currentPages.size
        };
    }
    /**
     * Check if we can create a new page based on current resource usage
     */
    async canCreateNewPage() {
        if (this.currentPages.size >= this.maxConcurrentPages) {
            console.warn(`Maximum concurrent pages (${this.maxConcurrentPages}) reached.`);
            return false;
        }
        const usage = await this.getResourceUsage();
        // Check memory usage
        if (usage.memory.percentUsed > this.cpuWarningThreshold) {
            console.warn(`Memory usage is high (${usage.memory.percentUsed.toFixed(1)}%). Consider closing unused pages.`);
            return false;
        }
        return true;
    }
    /**
     * Optimize a page for better performance
     */
    async optimizePage(page) {
        if (!page)
            return;
        try {
            // Close unnecessary network connections
            await page.evaluate(() => {
                // Close WebSockets and other connections
                // This is just an example - be careful with this in real apps
                // as it might break functionality
                if (window.performance && window.performance.memory) {
                    // Just logging for now
                    console.log('Memory:', window.performance.memory);
                }
                // Remove event listeners from elements we no longer need
                // Example (commented out as it needs real elements to clean):
                // document.querySelectorAll('.inactive').forEach(el => {
                //   el.replaceWith(el.cloneNode(true));
                // });
            });
            // Reduce memory usage
            if (this.currentPages.size > 1) {
                // Aggressive garbage collection for inactive tabs
                await page.evaluate(() => {
                    // Release large objects
                    if (window.gc) {
                        window.gc();
                    }
                });
            }
        }
        catch (error) {
            console.error('Error optimizing page:', error);
        }
    }
    /**
     * Clean up resources and release memory
     */
    async cleanUp() {
        const pages = [...this.currentPages];
        // Only keep the most recently used pages if we're over limit
        if (pages.length > this.maxConcurrentPages) {
            // Sort by lastUsed (would need to track this in a real implementation)
            const pagesToClose = pages.slice(this.maxConcurrentPages);
            for (const page of pagesToClose) {
                try {
                    this.currentPages.delete(page);
                    await page.close();
                }
                catch (error) {
                    console.error('Error closing page during cleanup:', error);
                }
            }
        }
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
    }
}
exports.PerformanceOptimizer = PerformanceOptimizer;
//# sourceMappingURL=PerformanceOptimizer.js.map