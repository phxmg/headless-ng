export class ErrorHandler {
  retryCount: number;
  retryDelay: number;
  screenshotOnError: boolean;
  resultManager: any;

  constructor(options: any = {}) {
    this.retryCount = options.retryCount || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.screenshotOnError = options.screenshotOnError !== false;
    this.resultManager = options.resultManager;
  }

  async handleError(error: any, context: any) {
    console.error('Automation error:', error);

    // Take screenshot if enabled
    if (this.screenshotOnError && context.page && this.resultManager) {
      try {
        const errorScreenshot = await this.resultManager.saveScreenshot(
          context.page,
          context.runDir,
          `error_${Date.now()}`
        );
        console.log('Error screenshot saved:', errorScreenshot);
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
    }

    // Log detailed error information
    const errorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: {
        url: context.page ? await context.page.url() : null,
        action: context.currentAction,
        sequenceName: context.sequenceName
      }
    };

    if (this.resultManager) {
      this.resultManager.saveErrorLog(context.runDir, errorLog);
    }

    return errorLog;
  }

  async retryOperation(operation: any, context: any) {
    let lastError;
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`Retry attempt ${attempt}/${this.retryCount} failed:`, 
          error instanceof Error ? error.message : String(error));
        if (attempt < this.retryCount) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    // All retries failed
    await this.handleError(lastError, context);
    throw lastError;
  }
} 