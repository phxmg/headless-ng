import { BrowserAutomationService } from '../services/BrowserAutomationService';
import { RecordedAction } from '../recorder/RecordingManager'; // Assuming build process makes this available
import { ErrorHandler } from '../services/ErrorHandler';
import { ResultManager } from '../services/ResultManager';

// Define possible playback states
type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'stopped' | 'error' | 'finished';

interface PlaybackProgress {
    percentage: number;
    current: number;
    total: number;
    status: PlaybackStatus;
    currentAction?: RecordedAction;
    executionTimeMs: number;
    log: Array<{
        index: number;
        type: 'success' | 'error';
        action: RecordedAction;
        timestamp: number;
        message?: string;
    }>;
}

export class SequencePlayer {
    private automationService: BrowserAutomationService;
    private actions: RecordedAction[];
    private currentActionIndex: number;
    private status: PlaybackStatus;
    private isPlaying: boolean; // Added flag for loop control
    // Add callback for status updates
    private onStatusUpdate?: (status: PlaybackStatus, message?: string, currentIndex?: number, progress?: PlaybackProgress) => void;
    private progressLog: PlaybackProgress['log'];
    private startTime: number | null;
    private errorHandler: ErrorHandler;
    private resultManager: ResultManager;

    constructor(automationService: BrowserAutomationService, actions: RecordedAction[], onStatusUpdate?: (status: PlaybackStatus, message?: string, currentIndex?: number, progress?: PlaybackProgress) => void, resultManager?: ResultManager) {
        if (!automationService) {
            throw new Error("BrowserAutomationService instance is required.");
        }
        this.automationService = automationService;
        this.actions = [...actions]; // Store a copy
        this.currentActionIndex = 0;
        this.status = 'idle';
        this.isPlaying = false;
        this.onStatusUpdate = onStatusUpdate;
        this.progressLog = [];
        this.startTime = null;
        this.resultManager = resultManager || new ResultManager();
        this.errorHandler = new ErrorHandler({ resultManager: this.resultManager });
        console.log(`SequencePlayer initialized with ${this.actions.length} actions.`);
    }

    private updateStatus(status: PlaybackStatus, message?: string): void {
        // Only update if status actually changed
        // Allow updating message even if status enum is the same (e.g., multiple 'playing' steps)
        // if (this.status === status) return; // Keep commented out to allow message updates

        this.status = status;
        // Sync isPlaying flag with status changes
        if (status !== 'playing' && status !== 'paused') {
            this.isPlaying = false; // Ensure loop stops if status becomes error/stopped/finished
        }

        console.log(`Playback Status: ${status}${message ? ' - ' + message : ''}`);
        if (this.onStatusUpdate) {
            this.onStatusUpdate(status, message, this.currentActionIndex, this.getProgress());
        }
    }

    getProgress(): PlaybackProgress {
        const total = this.actions.length;
        const current = this.currentActionIndex;
        const percentage = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));
        const executionTimeMs = this.startTime ? Date.now() - this.startTime : 0;
        return {
            percentage,
            current,
            total,
            status: this.status,
            currentAction: this.actions[current] || undefined,
            executionTimeMs,
            log: [...this.progressLog],
        };
    }

    async play(): Promise<void> {
        if (this.isPlaying) { // Check flag
            console.warn("Playback is already in progress.");
            return;
        }
        if (!this.isPlaying && (this.status === 'finished' || this.status === 'stopped')) {
            this.currentActionIndex = 0;
        }
        if (this.currentActionIndex >= this.actions.length) {
            this.updateStatus(this.actions.length === 0 ? 'idle' : 'finished');
            this.isPlaying = false;
            return;
        }
        this.isPlaying = true;
        this.startTime = Date.now();
        this.progressLog = [];
        this.updateStatus('playing', `Starting playback...`);
        while (this.isPlaying && this.currentActionIndex < this.actions.length) {
            const action = this.actions[this.currentActionIndex];
            this.updateStatus('playing', `Action ${this.currentActionIndex + 1}/${this.actions.length}: Executing ${action.type}...`);
            const actionStart = Date.now();
            try {
                await this.executeAction(action);
                if (this.isPlaying) {
                    this.progressLog.push({
                        index: this.currentActionIndex,
                        type: 'success',
                        action,
                        timestamp: Date.now(),
                        message: `Action ${action.type} succeeded in ${Date.now() - actionStart}ms`,
                    });
                    this.updateStatus('playing', `Action ${this.currentActionIndex + 1}/${this.actions.length}: ${action.type} successful.`);
                }
            } catch (error: any) {
                // Use errorHandler to log and handle error
                await this.errorHandler.handleError(error, {
                    page: this.automationService.getCurrentPage(),
                    runDir: this.resultManager.baseDir,
                    currentAction: action,
                    sequenceName: 'N/A',
                });
                this.progressLog.push({
                    index: this.currentActionIndex,
                    type: 'error',
                    action,
                    timestamp: Date.now(),
                    message: `Error: ${error.message}`,
                });
                this.updateStatus('error', `Error executing action ${this.currentActionIndex + 1} (${action.type}): ${error.message}`);
                this.isPlaying = false;
                return;
            }
            if (this.isPlaying) {
                this.currentActionIndex++;
            }
        }
        if (this.isPlaying && this.currentActionIndex >= this.actions.length) {
            this.isPlaying = false;
            this.updateStatus('finished', `Playback finished successfully after ${this.actions.length} actions.`);
        }
    }

    pause(): void {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.updateStatus('paused');
        } else {
            console.warn(`Cannot pause playback when status is ${this.status}`);
        }
    }

    resume(): void {
        if (this.status === 'paused') {
            // play() will set status and isPlaying flag
            this.play(); // Continue the loop
        } else {
            console.warn(`Cannot resume playback when status is ${this.status}`);
        }
    }

    stop(): void {
        if (this.isPlaying || this.status === 'paused') {
            this.isPlaying = false;
            this.updateStatus('stopped');
        } else {
            console.warn(`Cannot stop playback when status is ${this.status}`);
        }
        // Reset index? Or allow restarting from last point?
        // this.currentActionIndex = 0;
    }

    getStatus(): PlaybackStatus {
        return this.status;
    }

    // --- Action Execution Logic (Task 5.2) ---
    private async executeAction(action: RecordedAction): Promise<void> {
        const context = {
            page: this.automationService.getCurrentPage(),
            runDir: this.resultManager.baseDir, // Or use a per-run dir if available
            currentAction: action,
            sequenceName: 'N/A' // Replace with actual sequence name if available
        };
        // Ensure we have a page to work with
        let currentPage = this.automationService.getCurrentPage();
        if (!currentPage || currentPage.isClosed()) {
             console.log("No active page or page closed, requesting new page for playback.");
             // This assumes getNewPage gives us the page we need, might need refinement
             await this.automationService.getNewPage();
             currentPage = this.automationService.getCurrentPage();
             if (!currentPage) {
                 throw new Error("Failed to get a valid page for playback.");
             }
             // Add a small delay after getting a new page
             await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Use errorHandler.retryOperation for robust error handling
        await this.errorHandler.retryOperation(async () => {
            switch (action.type) {
                case 'navigate':
                    if (!action.url) throw new Error('Navigate action missing URL');
                    console.log(`Executing navigate to: ${action.url}`);
                    await this.automationService.navigate(action.url);
                    break;
                case 'click':
                    if (!action.selector) throw new Error('Click action missing selector');
                    console.log(`Executing click on: ${action.selector}`);
                    await this.automationService.click(action.selector);
                    break;
                case 'type':
                    if (!action.selector) throw new Error('Type action missing selector');
                    if (action.text === undefined || action.text === null) throw new Error('Type action missing text');
                    console.log(`Executing type '${action.text}' into: ${action.selector}`);
                    await this.automationService.type(action.selector, action.text);
                    break;
                case 'screenshot':
                    if (!action.path) throw new Error('Screenshot action missing path');
                    console.log(`Executing screenshot to: ${action.path}`);
                    await this.automationService.screenshot(action.path);
                    break;
                case 'wait': // Example: Wait for selector
                     if (!action.selector) throw new Error('Wait action missing selector');
                     console.log(`Executing wait for selector: ${action.selector}`);
                     await this.automationService.waitForSelector(action.selector); // Add timeout if needed
                     break;
                // Add cases for other action types (waitForNavigation, scroll, hover, select, etc.)
                // Example: waitForNavigation
                // case 'waitForNavigation':
                //    console.log(`Executing waitForNavigation`);
                //    // Assuming BrowserAutomationService has waitForNavigation
                //    await this.automationService.waitForNavigation(); 
                //    break;
                case 'unknown':
                default:
                    console.warn(`Skipping unknown or unimplemented action type: ${action.type}`);
                    break;
            }
        }, context);
    }
} 