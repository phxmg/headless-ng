import { Browser, Page } from 'puppeteer';
import * as os from 'os';

export class PerformanceOptimizer {
  private maxConcurrentPages: number;
  private currentPages: Set<Page>;
  private browser: Browser | null = null;
  private memoryWarningThreshold: number; // in MB
  private cpuWarningThreshold: number; // in percentage

  constructor(options: {
    maxConcurrentPages?: number;
    memoryWarningThreshold?: number; // in MB
    cpuWarningThreshold?: number; // in percentage
  } = {}) {
    // Default to number of CPU cores (but at least 2)
    this.maxConcurrentPages = options.maxConcurrentPages || Math.max(os.cpus().length, 2);
    this.memoryWarningThreshold = options.memoryWarningThreshold || 1024; // Default: 1GB
    this.cpuWarningThreshold = options.cpuWarningThreshold || 80; // Default: 80%
    this.currentPages = new Set();
  }

  setBrowser(browser: Browser): void {
    this.browser = browser;
  }

  /**
   * Register a page for monitoring
   */
  registerPage(page: Page): void {
    this.currentPages.add(page);
    
    // Clean up when the page is closed
    page.once('close', () => {
      this.currentPages.delete(page);
    });
  }

  /**
   * Unregister a page from monitoring
   */
  unregisterPage(page: Page): void {
    this.currentPages.delete(page);
  }

  /**
   * Get current resource usage info
   */
  async getResourceUsage(): Promise<{
    memory: { total: number; free: number; used: number; percentUsed: number };
    cpu: number;
    pages: number;
  }> {
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
  async canCreateNewPage(): Promise<boolean> {
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
  async optimizePage(page: Page): Promise<void> {
    if (!page) return;

    try {
      // Close unnecessary network connections
      await page.evaluate(() => {
        // Close WebSockets and other connections
        // This is just an example - be careful with this in real apps
        // as it might break functionality
        if (window.performance && (window.performance as any).memory) {
          // Just logging for now
          console.log('Memory:', (window.performance as any).memory);
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
    } catch (error) {
      console.error('Error optimizing page:', error);
    }
  }

  /**
   * Clean up resources and release memory
   */
  async cleanUp(): Promise<void> {
    const pages = [...this.currentPages];
    
    // Only keep the most recently used pages if we're over limit
    if (pages.length > this.maxConcurrentPages) {
      // Sort by lastUsed (would need to track this in a real implementation)
      const pagesToClose = pages.slice(this.maxConcurrentPages);
      
      for (const page of pagesToClose) {
        try {
          this.currentPages.delete(page);
          await page.close();
        } catch (error) {
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