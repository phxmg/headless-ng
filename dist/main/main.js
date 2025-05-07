"use strict";
const { app, BrowserWindow, BrowserView, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const { BrowserAutomationService } = require('../services/BrowserAutomationService');
// Update import to use .ts file (if build process handles it) or compiled .js
// Assuming build process handles .ts -> .js, we might need to adjust path later
// For now, keep it conceptually pointing to the source
const { RecordingManager } = require('../recorder/RecordingManager'); // Adjust if necessary after build setup
const { ResultManager } = require('../services/ResultManager');
const { SequenceManager } = require('../services/SequenceManager');
const { CredentialManager } = require('../services/CredentialManager');
const { ScheduleManager } = require('../services/ScheduleManager');
const { ReportGenerator } = require('../services/ReportGenerator');
const { PerformanceOptimizer } = require('../services/PerformanceOptimizer');
const { validateURL, validateObject, sanitizeString, sanitizeFilePath } = require('../utils/security');
const { navigationErrorSchema, selectorSchema, typeOperationSchema, waitForSelectorSchema, credentialSchema, screenshotSchema } = require('../utils/ipcSchemas');
let mainWindow;
const automationService = new BrowserAutomationService();
const recordingManager = new RecordingManager();
const resultManager = new ResultManager();
const sequenceManager = new SequenceManager();
const credentialManager = new CredentialManager();
const scheduleManager = new ScheduleManager(sequenceManager, automationService.player);
const reportGenerator = new ReportGenerator(resultManager);
const performanceOptimizer = new PerformanceOptimizer();
// Add navigation state and history store
let navigationState = {
    currentURL: '',
    canGoBack: false,
    canGoForward: false,
    isLoading: false,
    lastUpdate: Date.now(),
    pendingUpdate: false,
    history: [], // Track navigation history
    historyIndex: -1, // Current position in history
    lastError: null
};
// History management functions
const addToHistory = (url) => {
    // Don't add duplicate entries for the current page
    if (url === navigationState.currentURL)
        return;
    // If we navigated back and then to a new page, trim the forward history
    if (navigationState.historyIndex < navigationState.history.length - 1) {
        navigationState.history = navigationState.history.slice(0, navigationState.historyIndex + 1);
    }
    // Add the new URL to history
    navigationState.history.push(url);
    navigationState.historyIndex = navigationState.history.length - 1;
    // Update navigation state
    navigationState.currentURL = url;
    navigationState.canGoBack = navigationState.historyIndex > 0;
    navigationState.canGoForward = navigationState.historyIndex < navigationState.history.length - 1;
    // Send update to renderer
    sendNavigationStateUpdate();
};
const navigateInHistory = (direction) => {
    // Calculate new index
    let newIndex = navigationState.historyIndex;
    if (direction === 'back' && navigationState.canGoBack) {
        newIndex--;
    }
    else if (direction === 'forward' && navigationState.canGoForward) {
        newIndex++;
    }
    else {
        return null; // Can't navigate in requested direction
    }
    // Get URL at new index
    const url = navigationState.history[newIndex];
    if (!url)
        return null;
    // Update state
    navigationState.historyIndex = newIndex;
    navigationState.currentURL = url;
    navigationState.canGoBack = newIndex > 0;
    navigationState.canGoForward = newIndex < navigationState.history.length - 1;
    return url;
};
// Configure throttling for navigation state updates
const NAV_STATE_UPDATE_THROTTLE_MS = 100; // Throttle to max 10 updates per second
// Function to throttle navigation state updates
const sendNavigationStateUpdate = () => {
    if (mainWindow && mainWindow.webContents) {
        const now = Date.now();
        if (now - navigationState.lastUpdate > NAV_STATE_UPDATE_THROTTLE_MS) {
            // Send immediately if enough time has passed
            mainWindow.webContents.send('navigation:stateUpdate', { ...navigationState });
            navigationState.lastUpdate = now;
            navigationState.pendingUpdate = false;
        }
        else if (!navigationState.pendingUpdate) {
            // Schedule update after throttle time
            navigationState.pendingUpdate = true;
            setTimeout(() => {
                if (navigationState.pendingUpdate && mainWindow && mainWindow.webContents) {
                    mainWindow.webContents.send('navigation:stateUpdate', { ...navigationState });
                    navigationState.lastUpdate = Date.now();
                    navigationState.pendingUpdate = false;
                }
            }, NAV_STATE_UPDATE_THROTTLE_MS);
        }
    }
};
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true,
            enableRemoteModule: false,
            sandbox: true,
            webviewTag: true // Enable <webview> support in renderer
        }
    });
    const startUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../../build/index.html')}`;
    console.log('ELECTRON NODE_ENV:', process.env.NODE_ENV, 'startUrl:', startUrl);
    mainWindow.loadURL(startUrl);
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}
// App lifecycle events
app.whenReady().then(async () => {
    createWindow();
    // Start the automation service
    try {
        await automationService.start();
        console.log('BrowserAutomationService started successfully.');
        // Attach the performance optimizer to the browser service
        const browser = automationService.getBrowser();
        if (browser) {
            performanceOptimizer.setBrowser(browser);
        }
    }
    catch (error) {
        console.error('Failed to start BrowserAutomationService:', error);
        // Handle failure appropriately (e.g., show error dialog, disable features)
    }
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
    // (Optional) Set up application menu
    // Menu.setApplicationMenu(Menu.buildFromTemplate([]));
});
app.on('window-all-closed', () => {
    // Ensure automation service is stopped
    automationService.stop().catch(err => console.error('Error stopping automation service:', err));
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
// Basic IPC example (expand as needed)
ipcMain.handle('ping', async () => {
    return 'pong';
});
// Add navigation handler IPC endpoints for MVP
ipcMain.handle('nav:goBack', async () => {
    try {
        // Use history management to get the previous URL
        const previousUrl = navigateInHistory('back');
        if (previousUrl) {
            // Send a message to the renderer to load the URL
            mainWindow.webContents.send('webview:loadURL', previousUrl);
            sendNavigationStateUpdate();
            return { success: true };
        }
        // If no previous URL (shouldn't happen if canGoBack was true), just tell webview to go back
        mainWindow.webContents.send('webview:goBack');
        return { success: true };
    }
    catch (error) {
        console.error('Navigation error (goBack):', error);
        return { success: false, error: error.message || 'Failed to go back' };
    }
});
ipcMain.handle('nav:goForward', async () => {
    try {
        // Use history management to get the next URL
        const nextUrl = navigateInHistory('forward');
        if (nextUrl) {
            // Send a message to the renderer to load the URL
            mainWindow.webContents.send('webview:loadURL', nextUrl);
            sendNavigationStateUpdate();
            return { success: true };
        }
        // If no next URL (shouldn't happen if canGoForward was true), just tell webview to go forward
        mainWindow.webContents.send('webview:goForward');
        return { success: true };
    }
    catch (error) {
        console.error('Navigation error (goForward):', error);
        return { success: false, error: error.message || 'Failed to go forward' };
    }
});
ipcMain.handle('nav:reload', async () => {
    try {
        mainWindow.webContents.send('webview:reload');
        return { success: true };
    }
    catch (error) {
        console.error('Navigation error (reload):', error);
        return { success: false, error: error.message || 'Failed to reload' };
    }
});
ipcMain.handle('nav:loadURL', async (event, url) => {
    try {
        // Validate URL before navigation
        const validation = validateURL(url);
        if (!validation.valid) {
            console.warn(`Navigation blocked - Invalid URL: ${url}, Reason: ${validation.reason}`);
            return {
                success: false,
                error: `Navigation blocked: ${validation.reason}`
            };
        }
        // If URL passes validation, proceed with navigation
        mainWindow.webContents.send('webview:loadURL', url);
        // Add to history after successful navigation
        addToHistory(url);
        return { success: true };
    }
    catch (error) {
        console.error('Navigation error (loadURL):', error);
        return { success: false, error: error.message || 'Failed to load URL' };
    }
});
ipcMain.handle('nav:stop', async () => {
    try {
        mainWindow.webContents.send('webview:stop');
        return { success: true };
    }
    catch (error) {
        console.error('Navigation error (stop):', error);
        return { success: false, error: error.message || 'Failed to stop navigation' };
    }
});
// Add a handler to open URLs in external browser
ipcMain.handle('nav:openExternal', async (event, url) => {
    try {
        // Validate URL before opening externally
        const validation = validateURL(url);
        if (!validation.valid) {
            console.warn(`External navigation blocked - Invalid URL: ${url}, Reason: ${validation.reason}`);
            return {
                success: false,
                error: `External navigation blocked: ${validation.reason}`
            };
        }
        // Use Electron's shell.openExternal for secure external navigation
        await shell.openExternal(url);
        return { success: true };
    }
    catch (error) {
        console.error('Navigation error (openExternal):', error);
        return { success: false, error: error.message || 'Failed to open URL in external browser' };
    }
});
// Add navigation state change IPC handlers
ipcMain.handle('nav:setCurrentURL', async (event, url) => {
    try {
        // Validate URL format
        const validation = validateURL(url);
        if (!validation.valid) {
            // Don't block the operation, but log the issue
            console.warn(`URL state update with invalid URL: ${url}, Reason: ${validation.reason}`);
        }
        // Update state with sanitized URL
        navigationState.currentURL = sanitizeString(url);
        // Update UI
        sendNavigationStateUpdate();
        return { success: true };
    }
    catch (error) {
        console.error('Error updating current URL:', error);
        return { success: false, error: error.message || 'Failed to update current URL' };
    }
});
ipcMain.handle('nav:setCanGoBack', async (event, canGoBack) => {
    try {
        // Validate boolean type
        if (typeof canGoBack !== 'boolean') {
            return { success: false, error: 'canGoBack must be a boolean value' };
        }
        navigationState.canGoBack = canGoBack;
        sendNavigationStateUpdate();
        return { success: true };
    }
    catch (error) {
        console.error('Error updating canGoBack state:', error);
        return { success: false, error: error.message || 'Failed to update canGoBack state' };
    }
});
ipcMain.handle('nav:setCanGoForward', async (event, canGoForward) => {
    try {
        // Validate boolean type
        if (typeof canGoForward !== 'boolean') {
            return { success: false, error: 'canGoForward must be a boolean value' };
        }
        navigationState.canGoForward = canGoForward;
        sendNavigationStateUpdate();
        return { success: true };
    }
    catch (error) {
        console.error('Error updating canGoForward state:', error);
        return { success: false, error: error.message || 'Failed to update canGoForward state' };
    }
});
ipcMain.handle('nav:setIsLoading', async (event, isLoading) => {
    try {
        // Validate boolean type
        if (typeof isLoading !== 'boolean') {
            return { success: false, error: 'isLoading must be a boolean value' };
        }
        navigationState.isLoading = isLoading;
        sendNavigationStateUpdate();
        return { success: true };
    }
    catch (error) {
        console.error('Error updating isLoading state:', error);
        return { success: false, error: error.message || 'Failed to update isLoading state' };
    }
});
// Handle navigation errors
ipcMain.handle('nav:error', async (event, errorInfo) => {
    try {
        // Validate error info object
        if (!errorInfo || typeof errorInfo !== 'object') {
            return { success: false, error: 'Invalid error information provided' };
        }
        // Sanitize error information
        const sanitizedError = {
            url: errorInfo.url ? sanitizeString(errorInfo.url) : 'unknown',
            code: typeof errorInfo.code === 'number' ? errorInfo.code : -1,
            description: errorInfo.description ? sanitizeString(errorInfo.description) : 'Unknown error'
        };
        // Store in navigation state
        navigationState.lastError = sanitizedError;
        // Send update to UI
        sendNavigationStateUpdate();
        return { success: true };
    }
    catch (error) {
        console.error('Error reporting navigation error:', error);
        return { success: false, error: error.message || 'Failed to report navigation error' };
    }
});
// --- Automation IPC Handlers ---
ipcMain.handle('automation:getNewPage', async () => {
    try {
        const result = await automationService.createNewPage();
        return { success: true, pageId: result.pageId };
    }
    catch (error) {
        console.error('Automation error (getNewPage):', error);
        return { success: false, error: error.message || 'Failed to create new page' };
    }
});
ipcMain.handle('automation:navigate', async (event, url) => {
    try {
        // Validate URL
        const validation = validateURL(url);
        if (!validation.valid) {
            console.warn(`Automation navigation blocked - Invalid URL: ${url}, Reason: ${validation.reason}`);
            return {
                success: false,
                error: `Automation navigation blocked: ${validation.reason}`
            };
        }
        const result = await automationService.navigate(url);
        return { success: true, ...result };
    }
    catch (error) {
        console.error('Automation error (navigate):', error);
        return { success: false, error: error.message || 'Failed to navigate' };
    }
});
ipcMain.handle('automation:click', async (event, selector) => {
    try {
        // Validate selector
        const validation = validateObject({ selector }, selectorSchema);
        if (!validation.valid) {
            console.warn(`Automation click blocked - Invalid selector: ${selector}, Errors: ${validation.errors.join(', ')}`);
            return {
                success: false,
                error: `Invalid selector: ${validation.errors.join(', ')}`
            };
        }
        // Sanitize the selector
        const sanitizedSelector = sanitizeString(selector);
        const result = await automationService.click(sanitizedSelector);
        return { success: true, ...result };
    }
    catch (error) {
        console.error('Automation error (click):', error);
        return { success: false, error: error.message || 'Failed to click element' };
    }
});
ipcMain.handle('automation:type', async (event, selector, text) => {
    try {
        // Validate parameters
        const validation = validateObject({ selector, text }, typeOperationSchema);
        if (!validation.valid) {
            console.warn(`Automation type blocked - Validation errors: ${validation.errors.join(', ')}`);
            return {
                success: false,
                error: `Invalid parameters: ${validation.errors.join(', ')}`
            };
        }
        // Sanitize the selector (but keep text as-is since we want to type exactly what was requested)
        const sanitizedSelector = sanitizeString(selector);
        const result = await automationService.type(sanitizedSelector, text);
        return { success: true, ...result };
    }
    catch (error) {
        console.error('Automation error (type):', error);
        return { success: false, error: error.message || 'Failed to type text' };
    }
});
ipcMain.handle('automation:waitForSelector', async (event, selector, timeout) => {
    try {
        // Validate parameters
        const validation = validateObject({ selector, timeout }, waitForSelectorSchema);
        if (!validation.valid) {
            console.warn(`Automation waitForSelector blocked - Validation errors: ${validation.errors.join(', ')}`);
            return {
                success: false,
                error: `Invalid parameters: ${validation.errors.join(', ')}`
            };
        }
        // Sanitize the selector
        const sanitizedSelector = sanitizeString(selector);
        const result = await automationService.waitForSelector(sanitizedSelector, timeout);
        return { success: true, ...result };
    }
    catch (error) {
        console.error('Automation error (waitForSelector):', error);
        return { success: false, error: error.message || 'Failed to wait for selector' };
    }
});
ipcMain.handle('automation:screenshot', async (event, path) => {
    try {
        // Validate parameters
        const validation = validateObject({ path }, screenshotSchema);
        if (!validation.valid) {
            console.warn(`Automation screenshot blocked - Validation errors: ${validation.errors.join(', ')}`);
            return {
                success: false,
                error: `Invalid parameters: ${validation.errors.join(', ')}`
            };
        }
        // Sanitize the path
        const sanitizedPath = sanitizeFilePath(path);
        const result = await automationService.screenshot(sanitizedPath);
        return { success: true, path: result.path };
    }
    catch (error) {
        console.error('Automation error (screenshot):', error);
        return { success: false, error: error.message || 'Failed to take screenshot' };
    }
});
ipcMain.handle('automation:analyzeElements', async () => {
    try {
        const result = await automationService.analyzeElements();
        return { success: true, elements: result.elements };
    }
    catch (error) {
        console.error('Automation error (analyzeElements):', error);
        return { success: false, error: error.message || 'Failed to analyze elements' };
    }
});
// --- Recording IPC Handlers ---
ipcMain.handle('recording:start', async () => {
    try {
        // TODO: Need reference to the *active* Puppeteer page from automationService
        // const page = automationService.getCurrentPage(); // Assuming this method exists
        // if (!page) throw new Error('Automation page not available');
        // await recordingManager.attachToPage(page); // Attach if not already
        recordingManager.startRecording();
        console.log('Recording started via IPC.');
        // TODO: Send status update back to renderer
        // mainWindow.webContents.send('recording:status', { isRecording: true });
        return { success: true };
    }
    catch (error) {
        console.error('recording:start Error:', error);
        return { success: false, error: error.message };
    }
});
ipcMain.handle('recording:pause', async () => {
    try {
        recordingManager.pauseRecording(); // Assuming pause method exists
        console.log('Recording paused via IPC.');
        // TODO: Send status update back to renderer
        // mainWindow.webContents.send('recording:status', { isRecording: false, isPaused: true });
        return { success: true };
    }
    catch (error) {
        console.error('recording:pause Error:', error);
        return { success: false, error: error.message };
    }
});
ipcMain.handle('recording:stop', async () => {
    try {
        recordingManager.stopRecording();
        const actions = recordingManager.getRecordedActions();
        console.log('Recording stopped via IPC. Actions:', actions);
        // TODO: Send status update back to renderer
        // mainWindow.webContents.send('recording:status', { isRecording: false });
        // TODO: Handle saving the recorded actions (e.g., prompt user, save to file)
        return { success: true, actions }; // Return recorded actions for now
    }
    catch (error) {
        console.error('recording:stop Error:', error);
        return { success: false, error: error.message };
    }
});
// TODO: Implement webContents.send for status updates (Step 4 of task 3.23)
// --- Result Management IPC Handlers ---
ipcMain.handle('results:createRunDirectory', (event, sequenceName) => {
    try {
        const dir = resultManager.createRunDirectory(sequenceName);
        return { success: true, dir };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('results:saveScreenshot', async (event, runDir, name) => {
    try {
        const page = automationService.getCurrentPage();
        if (!page)
            throw new Error('No current page for screenshot');
        const path = await resultManager.saveScreenshot(page, runDir, name);
        return { success: true, path };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('results:saveResults', (event, runDir, results) => {
    try {
        const path = resultManager.saveResults(runDir, results);
        return { success: true, path };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('results:getRunHistory', (event, sequenceName) => {
    try {
        const history = resultManager.getRunHistory(sequenceName);
        return { success: true, history };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('results:loadResults', (event, filepath) => {
    try {
        const results = resultManager.loadResults(filepath);
        return { success: true, results };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('results:compareScreenshots', async (event, image1Path, image2Path) => {
    try {
        const diff = await resultManager.compareScreenshots(image1Path, image2Path);
        return { success: true, diff };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Sequence Management IPC Handlers ---
ipcMain.handle('sequences:saveSequence', (event, sequence) => {
    try {
        const path = sequenceManager.saveSequence(sequence);
        return { success: true, path };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('sequences:loadSequence', (event, name) => {
    try {
        const sequence = sequenceManager.loadSequence(name);
        return { success: true, sequence };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('sequences:getAllSequences', () => {
    try {
        const sequences = sequenceManager.getAllSequences();
        return { success: true, sequences };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('sequences:deleteSequence', (event, name) => {
    try {
        sequenceManager.deleteSequence(name);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Credential Management IPC Handlers ---
ipcMain.handle('credentials:saveCredential', async (event, key, value) => {
    try {
        // Validate parameters
        const validation = validateObject({ key, value }, credentialSchema);
        if (!validation.valid) {
            console.warn(`Credentials save blocked - Validation errors: ${validation.errors.join(', ')}`);
            return {
                success: false,
                error: `Invalid parameters: ${validation.errors.join(', ')}`
            };
        }
        // Sanitize the key (value is kept as-is since it might need to contain special chars for passwords)
        const sanitizedKey = sanitizeString(key);
        await credentialManager.saveCredential(sanitizedKey, value);
        return { success: true };
    }
    catch (error) {
        console.error('Credentials error (saveCredential):', error);
        return { success: false, error: error.message || 'Failed to save credential' };
    }
});
ipcMain.handle('credentials:getCredential', async (event, key) => {
    try {
        // Validate key
        if (typeof key !== 'string' || !key.trim()) {
            return { success: false, error: 'Invalid credential key' };
        }
        // Sanitize the key
        const sanitizedKey = sanitizeString(key);
        const value = await credentialManager.getCredential(sanitizedKey);
        return { success: true, value };
    }
    catch (error) {
        console.error('Credentials error (getCredential):', error);
        return { success: false, error: error.message || 'Failed to get credential' };
    }
});
ipcMain.handle('credentials:deleteCredential', async (event, key) => {
    try {
        // Validate key
        if (typeof key !== 'string' || !key.trim()) {
            return { success: false, error: 'Invalid credential key' };
        }
        // Sanitize the key
        const sanitizedKey = sanitizeString(key);
        await credentialManager.deleteCredential(sanitizedKey);
        return { success: true };
    }
    catch (error) {
        console.error('Credentials error (deleteCredential):', error);
        return { success: false, error: error.message || 'Failed to delete credential' };
    }
});
ipcMain.handle('credentials:getAllCredentials', async () => {
    try {
        const keys = await credentialManager.getAllCredentialKeys();
        return { success: true, keys };
    }
    catch (error) {
        console.error('Credentials error (getAllCredentials):', error);
        return { success: false, error: error.message || 'Failed to get all credentials' };
    }
});
// --- Scheduling Management IPC Handlers ---
ipcMain.handle('schedules:scheduleSequence', (event, sequenceName, cronExpression, options) => {
    try {
        const result = scheduleManager.scheduleSequence(sequenceName, cronExpression, options);
        return { success: true, result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('schedules:unscheduleSequence', (event, sequenceName) => {
    try {
        const result = scheduleManager.unscheduleSequence(sequenceName);
        return { success: true, result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('schedules:getAllSchedules', () => {
    try {
        const result = scheduleManager.getAllSchedules();
        return { success: true, result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Report Generation IPC Handlers ---
ipcMain.handle('reports:generateHTML', async (event, runDir) => {
    try {
        const path = await reportGenerator.generateHTMLReport(runDir);
        return { success: true, path };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('reports:generatePDF', async (event, runDir) => {
    try {
        const path = await reportGenerator.generatePDFReport(runDir);
        return { success: true, path };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('reports:generateCSV', async (event, runDir) => {
    try {
        const path = await reportGenerator.generateCSVReport(runDir);
        return { success: true, path };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('reports:generateJSON', async (event, runDir) => {
    try {
        const path = await reportGenerator.generateJSONReport(runDir);
        return { success: true, path };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Performance Optimization IPC Handlers ---
ipcMain.handle('performance:getResourceUsage', async () => {
    try {
        const usage = await performanceOptimizer.getResourceUsage();
        return { success: true, usage };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('performance:optimizePage', async () => {
    try {
        const page = automationService.getCurrentPage();
        if (!page)
            throw new Error('No active page to optimize');
        await performanceOptimizer.optimizePage(page);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
ipcMain.handle('performance:cleanup', async () => {
    try {
        await performanceOptimizer.cleanUp();
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=main.js.map