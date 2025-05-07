"use strict";
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
    goBack: () => ipcRenderer.invoke('nav:goBack'),
    goForward: () => ipcRenderer.invoke('nav:goForward'),
    reload: () => ipcRenderer.invoke('nav:reload'),
    loadURL: (url) => ipcRenderer.invoke('nav:loadURL', url),
    stop: () => ipcRenderer.invoke('nav:stop'),
    openExternal: (url) => ipcRenderer.invoke('nav:openExternal', url),
    // Add navigation state reporting functions
    reportNavigationError: (errorInfo) => ipcRenderer.invoke('nav:error', errorInfo),
    setCurrentURL: (url) => ipcRenderer.invoke('nav:setCurrentURL', url),
    setCanGoBack: (canGoBack) => ipcRenderer.invoke('nav:setCanGoBack', canGoBack),
    setCanGoForward: (canGoForward) => ipcRenderer.invoke('nav:setCanGoForward', canGoForward),
    setIsLoading: (isLoading) => ipcRenderer.invoke('nav:setIsLoading', isLoading),
    // Add listeners for receiving commands from main process
    onWebviewGoBack: (callback) => ipcRenderer.on('webview:goBack', callback),
    onWebviewGoForward: (callback) => ipcRenderer.on('webview:goForward', callback),
    onWebviewReload: (callback) => ipcRenderer.on('webview:reload', callback),
    onWebviewLoadURL: (callback) => ipcRenderer.on('webview:loadURL', callback),
    onWebviewStop: (callback) => ipcRenderer.on('webview:stop', callback),
    // Add listeners for navigation state updates from main process
    onNavigationStateUpdate: (callback) => ipcRenderer.on('navigation:stateUpdate', callback),
});
// Expose automation API
contextBridge.exposeInMainWorld('automationAPI', {
    getNewPage: () => ipcRenderer.invoke('automation:getNewPage'),
    navigate: (url) => ipcRenderer.invoke('automation:navigate', url),
    click: (selector) => ipcRenderer.invoke('automation:click', selector),
    type: (selector, text) => ipcRenderer.invoke('automation:type', selector, text),
    waitForSelector: (selector, timeout) => ipcRenderer.invoke('automation:waitForSelector', selector, timeout),
    screenshot: (path) => ipcRenderer.invoke('automation:screenshot', path),
    analyzeElements: () => ipcRenderer.invoke('automation:analyzeElements'),
    // TODO: Expose method for receiving status updates from main
    // onStatusUpdate: (callback) => ipcRenderer.on('automation:statusUpdate', (event, ...args) => callback(...args)),
});
// Expose recording API
contextBridge.exposeInMainWorld('recordingAPI', {
    start: () => ipcRenderer.invoke('recording:start'),
    pause: () => ipcRenderer.invoke('recording:pause'), // Assuming pause exists
    stop: () => ipcRenderer.invoke('recording:stop'),
    // TODO: Expose method for receiving recording status updates
    // onRecordingStatus: (callback) => ipcRenderer.on('recording:status', (event, ...args) => callback(...args)),
});
// Expose results API
contextBridge.exposeInMainWorld('resultsAPI', {
    createRunDirectory: (sequenceName) => ipcRenderer.invoke('results:createRunDirectory', sequenceName),
    saveScreenshot: (runDir, name) => ipcRenderer.invoke('results:saveScreenshot', runDir, name),
    saveResults: (runDir, results) => ipcRenderer.invoke('results:saveResults', runDir, results),
    getRunHistory: (sequenceName) => ipcRenderer.invoke('results:getRunHistory', sequenceName),
    loadResults: (filepath) => ipcRenderer.invoke('results:loadResults', filepath),
    compareScreenshots: (image1Path, image2Path) => ipcRenderer.invoke('results:compareScreenshots', image1Path, image2Path),
});
// Expose sequences API
contextBridge.exposeInMainWorld('sequencesAPI', {
    saveSequence: (sequence) => ipcRenderer.invoke('sequences:saveSequence', sequence),
    loadSequence: (name) => ipcRenderer.invoke('sequences:loadSequence', name),
    getAllSequences: () => ipcRenderer.invoke('sequences:getAllSequences'),
    deleteSequence: (name) => ipcRenderer.invoke('sequences:deleteSequence', name),
});
// Expose credentials API
contextBridge.exposeInMainWorld('credentialsAPI', {
    saveCredential: (key, value) => ipcRenderer.invoke('credentials:saveCredential', key, value),
    getCredential: (key) => ipcRenderer.invoke('credentials:getCredential', key),
    deleteCredential: (key) => ipcRenderer.invoke('credentials:deleteCredential', key),
    getAllCredentials: () => ipcRenderer.invoke('credentials:getAllCredentials'),
});
// Expose schedules API
contextBridge.exposeInMainWorld('schedulesAPI', {
    scheduleSequence: (sequenceName, cronExpression, options) => ipcRenderer.invoke('schedules:scheduleSequence', sequenceName, cronExpression, options),
    unscheduleSequence: (sequenceName) => ipcRenderer.invoke('schedules:unscheduleSequence', sequenceName),
    getAllSchedules: () => ipcRenderer.invoke('schedules:getAllSchedules'),
});
// Expose reports API
contextBridge.exposeInMainWorld('reportsAPI', {
    generateHTML: (runDir) => ipcRenderer.invoke('reports:generateHTML', runDir),
    generatePDF: (runDir) => ipcRenderer.invoke('reports:generatePDF', runDir),
    generateCSV: (runDir) => ipcRenderer.invoke('reports:generateCSV', runDir),
    generateJSON: (runDir) => ipcRenderer.invoke('reports:generateJSON', runDir),
});
//# sourceMappingURL=preload.js.map