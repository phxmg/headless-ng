# IPC API Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Security Guidelines](#security-guidelines)
3. [Navigation API](#navigation-api)
4. [Automation API](#automation-api)
5. [Recording API](#recording-api)
6. [Results API](#results-api)
7. [Sequences API](#sequences-api)
8. [Credentials API](#credentials-api)
9. [Schedules API](#schedules-api)
10. [Reports API](#reports-api)
11. [Best Practices](#best-practices)

## Introduction

This document describes the Inter-Process Communication (IPC) API used in our Electron application to facilitate secure communication between the main process and renderer process. The API follows Electron's security best practices to prevent common security issues.

### Architecture Overview

Our application uses Electron's contextIsolation and IPC system with the following security model:

- **Context Isolation**: Renderer processes run in isolated contexts, preventing direct access to Node.js and Electron APIs
- **Preload Scripts**: Used to expose a minimal set of APIs through the contextBridge
- **IPC Communication**: All communication between processes uses the safe IPC invoke/handle pattern
- **Input Validation**: All incoming data from renderer processes is validated before use

## Security Guidelines

The following security guidelines are implemented across all IPC channels:

1. **Input Validation**: All parameters received from renderer processes are validated against expected types and ranges
2. **URL Sanitization**: All URLs are validated before navigation to prevent navigation to malicious sites
3. **No Remote Code Execution**: We never execute arbitrary code received via IPC
4. **Minimal API Surface**: Only necessary APIs are exposed to the renderer process
5. **Content Security Policy**: Strict CSP is enforced to prevent XSS attacks
6. **Secure Storage**: Sensitive data (credentials) is stored securely using encrypted storage
7. **Permission Model**: Features that access sensitive APIs (camera, file system) require explicit permission

## Navigation API

The Navigation API provides methods for controlling browser navigation and receiving navigation state updates.

### Exposed Methods (Renderer → Main)

| Method | Channel | Parameters | Returns | Description |
|--------|---------|------------|---------|-------------|
| `goBack()` | `nav:goBack` | None | `{ success: boolean, error?: string }` | Navigate to the previous page in history |
| `goForward()` | `nav:goForward` | None | `{ success: boolean, error?: string }` | Navigate to the next page in history |
| `reload()` | `nav:reload` | None | `{ success: boolean, error?: string }` | Reload the current page |
| `loadURL(url)` | `nav:loadURL` | `url: string` | `{ success: boolean, error?: string }` | Load the specified URL |
| `stop()` | `nav:stop` | None | `{ success: boolean, error?: string }` | Stop the current navigation |
| `openExternal(url)` | `nav:openExternal` | `url: string` | `{ success: boolean, error?: string }` | Open URL in default browser |
| `reportNavigationError(errorInfo)` | `nav:error` | `errorInfo: { url: string, code: number, description: string }` | `{ success: boolean }` | Report navigation errors to main process |
| `setCurrentURL(url)` | `nav:setCurrentURL` | `url: string` | `{ success: boolean }` | Update current URL in navigation state |
| `setCanGoBack(canGoBack)` | `nav:setCanGoBack` | `canGoBack: boolean` | `{ success: boolean }` | Update back navigation state |
| `setCanGoForward(canGoForward)` | `nav:setCanGoForward` | `canGoForward: boolean` | `{ success: boolean }` | Update forward navigation state |
| `setIsLoading(isLoading)` | `nav:setIsLoading` | `isLoading: boolean` | `{ success: boolean }` | Update loading state |

### Event Listeners (Main → Renderer)

| Method | Channel | Data | Description |
|--------|---------|------|-------------|
| `onWebviewGoBack(callback)` | `webview:goBack` | None | Called when main process requests go back |
| `onWebviewGoForward(callback)` | `webview:goForward` | None | Called when main process requests go forward |
| `onWebviewReload(callback)` | `webview:reload` | None | Called when main process requests reload |
| `onWebviewLoadURL(callback)` | `webview:loadURL` | `url: string` | Called when main process requests load URL |
| `onWebviewStop(callback)` | `webview:stop` | None | Called when main process requests stop navigation |
| `onNavigationStateUpdate(callback)` | `navigation:stateUpdate` | `state: NavigationState` | Called when navigation state is updated |

### Security Considerations

- URLs are validated using a whitelist approach to prevent navigation to malicious sites
- External URL opening uses Electron's `shell.openExternal` with strict URL validation
- Navigation state is maintained in the main process to prevent spoofing
- The navigation API prevents renderer processes from navigating to `file://` URLs

## Automation API

The Automation API provides methods for browser automation and testing.

### Exposed Methods (Renderer → Main)

| Method | Channel | Parameters | Returns | Description |
|--------|---------|------------|---------|-------------|
| `getNewPage()` | `automation:getNewPage` | None | `{ success: boolean, pageId: string }` | Creates a new automation page |
| `navigate(url)` | `automation:navigate` | `url: string` | `{ success: boolean, error?: string }` | Navigate to specified URL |
| `click(selector)` | `automation:click` | `selector: string` | `{ success: boolean, error?: string }` | Click on element matching selector |
| `type(selector, text)` | `automation:type` | `selector: string, text: string` | `{ success: boolean, error?: string }` | Type text into element |
| `waitForSelector(selector, timeout)` | `automation:waitForSelector` | `selector: string, timeout: number` | `{ success: boolean, error?: string }` | Wait for selector to appear |
| `screenshot(path)` | `automation:screenshot` | `path: string` | `{ success: boolean, path: string, error?: string }` | Take screenshot |
| `analyzeElements()` | `automation:analyzeElements` | None | `{ success: boolean, elements: Array<ElementInfo> }` | Analyze page elements |

### Security Considerations

- Automation API prevents access to file system outside designated directories
- Selectors are sanitized to prevent injection attacks
- Screenshots are restricted to a designated output directory
- User confirmation required for potentially destructive automation actions

## Recording API

The Recording API provides methods for recording and playing back automation sequences.

### Exposed Methods (Renderer → Main)

| Method | Channel | Parameters | Returns | Description |
|--------|---------|------------|---------|-------------|
| `start()` | `recording:start` | None | `{ success: boolean, recordingId: string }` | Start recording |
| `pause()` | `recording:pause` | None | `{ success: boolean }` | Pause recording |
| `stop()` | `recording:stop` | None | `{ success: boolean, sequence: RecordingSequence }` | Stop recording and return sequence |

### Security Considerations

- Recording data is stored in application's restricted storage
- Sensitive information (passwords) is not recorded by default
- Recorded sequences follow the same security constraints as direct automation

## Results API

The Results API manages test run results and artifacts.

### Exposed Methods (Renderer → Main)

| Method | Channel | Parameters | Returns | Description |
|--------|---------|------------|---------|-------------|
| `createRunDirectory(sequenceName)` | `results:createRunDirectory` | `sequenceName: string` | `{ success: boolean, path: string }` | Create directory for run results |
| `saveScreenshot(runDir, name)` | `results:saveScreenshot` | `runDir: string, name: string` | `{ success: boolean, path: string }` | Save screenshot in run directory |
| `saveResults(runDir, results)` | `results:saveResults` | `runDir: string, results: object` | `{ success: boolean }` | Save test results |
| `getRunHistory(sequenceName)` | `results:getRunHistory` | `sequenceName: string` | `{ success: boolean, history: Array<RunInfo> }` | Get history for sequence |
| `loadResults(filepath)` | `results:loadResults` | `filepath: string` | `{ success: boolean, results: object }` | Load results from file |
| `compareScreenshots(image1Path, image2Path)` | `results:compareScreenshots` | `image1Path: string, image2Path: string` | `{ success: boolean, difference: number }` | Compare screenshots |

### Security Considerations

- File paths are validated to prevent directory traversal attacks
- Access is restricted to application's results directory
- Screenshot comparisons use secure image processing libraries

## Sequences API

The Sequences API manages automation sequences.

### Exposed Methods (Renderer → Main)

| Method | Channel | Parameters | Returns | Description |
|--------|---------|------------|---------|-------------|
| `saveSequence(sequence)` | `sequences:saveSequence` | `sequence: object` | `{ success: boolean }` | Save automation sequence |
| `loadSequence(name)` | `sequences:loadSequence` | `name: string` | `{ success: boolean, sequence: object }` | Load sequence |
| `getAllSequences()` | `sequences:getAllSequences` | None | `{ success: boolean, sequences: Array<SequenceInfo> }` | List all sequences |
| `deleteSequence(name)` | `sequences:deleteSequence` | `name: string` | `{ success: boolean }` | Delete sequence |

### Security Considerations

- Sequences are validated before execution to prevent injection of malicious code
- Sequence names and data are sanitized to prevent directory traversal
- Execution follows the same security constraints as direct automation

## Credentials API

The Credentials API manages securely stored credentials.

### Exposed Methods (Renderer → Main)

| Method | Channel | Parameters | Returns | Description |
|--------|---------|------------|---------|-------------|
| `saveCredential(key, value)` | `credentials:saveCredential` | `key: string, value: string` | `{ success: boolean }` | Save encrypted credential |
| `getCredential(key)` | `credentials:getCredential` | `key: string` | `{ success: boolean, value: string }` | Get decrypted credential |
| `deleteCredential(key)` | `credentials:deleteCredential` | `key: string` | `{ success: boolean }` | Delete credential |
| `getAllCredentials()` | `credentials:getAllCredentials` | None | `{ success: boolean, keys: Array<string> }` | Get all credential keys |

### Security Considerations

- Credentials are encrypted at rest using system's secure storage
- Sensitive data is never exposed in logs or error messages
- Access to credentials requires application to be in authenticated state
- No credential values are stored in renderer process memory longer than necessary

## Schedules API

The Schedules API manages scheduled execution of automation sequences.

### Exposed Methods (Renderer → Main)

| Method | Channel | Parameters | Returns | Description |
|--------|---------|------------|---------|-------------|
| `scheduleSequence(sequenceName, cronExpression, options)` | `schedules:scheduleSequence` | `sequenceName: string, cronExpression: string, options: object` | `{ success: boolean, id: string }` | Schedule sequence |
| `unscheduleSequence(sequenceName)` | `schedules:unscheduleSequence` | `sequenceName: string` | `{ success: boolean }` | Remove schedule |
| `getAllSchedules()` | `schedules:getAllSchedules` | None | `{ success: boolean, schedules: Array<ScheduleInfo> }` | List all schedules |

### Security Considerations

- Cron expressions are validated to prevent excessive CPU usage
- Schedule execution follows the same security constraints as manual execution
- Schedule options are limited to prevent abuse

## Reports API

The Reports API generates reports from test results.

### Exposed Methods (Renderer → Main)

| Method | Channel | Parameters | Returns | Description |
|--------|---------|------------|---------|-------------|
| `generateHTML(runDir)` | `reports:generateHTML` | `runDir: string` | `{ success: boolean, path: string }` | Generate HTML report |
| `generatePDF(runDir)` | `reports:generatePDF` | `runDir: string` | `{ success: boolean, path: string }` | Generate PDF report |
| `generateCSV(runDir)` | `reports:generateCSV` | `runDir: string` | `{ success: boolean, path: string }` | Generate CSV report |
| `generateJSON(runDir)` | `reports:generateJSON` | `runDir: string` | `{ success: boolean, path: string }` | Generate JSON report |

### Security Considerations

- Report generation is restricted to results in application's directory
- HTML reports use strict CSP to prevent XSS
- PDF generation uses secure PDF libraries to prevent injection

## Best Practices

When working with this IPC API, follow these best practices:

1. **Always validate inputs**: Never trust data received from the renderer process without validation
2. **Use handle/invoke pattern**: Avoid using `send`/`on` patterns that don't provide a clear response flow
3. **Keep handlers minimal**: Implement the minimal logic needed in IPC handlers to reduce attack surface
4. **Handle errors gracefully**: All errors should be caught and returned in a structured format
5. **Avoid sync IPC**: Never use synchronous IPC methods that can block the main process
6. **Limit exposed APIs**: Only expose APIs that are absolutely necessary
7. **Document API changes**: Update this documentation when adding or modifying IPC channels
8. **Test security**: Include security testing in the test suite, including malicious input testing
9. **Update dependencies**: Regularly update Electron and related dependencies to get security fixes
10. **Consider context**: Be aware of the security implications of each API in different contexts 