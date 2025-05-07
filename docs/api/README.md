# IPC API Security Guide

## Introduction

This document provides guidance on how to securely use the IPC (Inter-Process Communication) API in our Electron application. Following these guidelines will help prevent common security vulnerabilities associated with IPC in Electron applications.

## Overview of Security Architecture

Our application follows Electron's security best practices with a focus on:

1. **Context Isolation**: The renderer process runs in an isolated JavaScript context without direct access to Node.js APIs.
2. **Preload Scripts**: Only carefully selected APIs are exposed to the renderer via `contextBridge`.
3. **IPC Communication**: Secure communication channels between the main and renderer processes using `invoke/handle` pattern.
4. **Input Validation**: All data received from the renderer process is validated before use.

## Security Best Practices

### For Developers

When extending or modifying the IPC API, follow these guidelines:

1. **Never use `nodeIntegration: true`** - Always keep Node.js APIs isolated from renderer processes
2. **Always validate input** - Use the `validateObject` utility with schemas from `ipcSchemas.js`
3. **Use the invoke/handle pattern** - Avoid using `send/on` which doesn't provide a clear response flow
4. **Never execute arbitrary code** - Don't use `eval()`, `new Function()`, or similar constructs with user input
5. **Sanitize URLs** - Always use `validateURL()` utility before navigation or opening external links
6. **Sanitize file paths** - Use `sanitizeFilePath()` for any file operations to prevent directory traversal
7. **Limit exposed APIs** - Only expose what's absolutely necessary to the renderer process
8. **Use appropriate error handling** - Don't expose sensitive information in error messages
9. **Implement proper permission checking** - Validate the caller has permission to perform the requested action

### When Adding New IPC Channels

Follow this checklist when adding a new IPC channel:

1. **Define a schema** - Add a schema definition in `ipcSchemas.js` for your new endpoint
2. **Add validation** - Use `validateObject()` to validate input against your schema
3. **Sanitize inputs** - Use appropriate sanitization functions for different types of data
4. **Document the channel** - Update `docs/api/IPC-API.md` with details about your new channel
5. **Add error handling** - Implement proper error handling with appropriate error messages
6. **Add logging** - Include logging for security-sensitive operations
7. **Write tests** - Include security-focused tests in your test suite
8. **Perform code review** - Have your code reviewed with a security focus

## Common Vulnerabilities to Avoid

### 1. Remote Code Execution (RCE)

Never allow execution of arbitrary code from renderer processes:

```javascript
// NEVER do this
ipcMain.handle('dangerousAction', (event, code) => {
  eval(code); // This is extremely dangerous!
});
```

### 2. Path Traversal

Always sanitize file paths:

```javascript
// NEVER do this
ipcMain.handle('readFile', (event, path) => {
  return fs.readFileSync(path); // Can access any file on system!
});

// DO this instead
ipcMain.handle('readFile', (event, path) => {
  const sanitizedPath = sanitizeFilePath(path);
  const fullPath = join(app.getPath('userData'), sanitizedPath);
  if (!fullPath.startsWith(app.getPath('userData'))) {
    return { error: 'Access denied' };
  }
  return fs.readFileSync(fullPath);
});
```

### 3. Insecure Navigation

Always validate URLs before navigation:

```javascript
// NEVER do this
ipcMain.handle('navigate', (event, url) => {
  mainWindow.loadURL(url); // Can load any URL, including malicious ones!
});

// DO this instead
ipcMain.handle('navigate', (event, url) => {
  const validation = validateURL(url);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }
  mainWindow.loadURL(url);
  return { success: true };
});
```

### 4. Information Leakage

Be careful not to expose sensitive information in error messages:

```javascript
// NEVER do this
ipcMain.handle('getCredential', (event, key) => {
  try {
    return { value: credentials[key] };
  } catch (error) {
    return { error: `Error retrieving credential: ${error.stack}` }; // Exposes sensitive details!
  }
});

// DO this instead
ipcMain.handle('getCredential', (event, key) => {
  try {
    return { success: true, value: credentials[key] };
  } catch (error) {
    console.error('Error retrieving credential:', error);
    return { success: false, error: 'Failed to retrieve credential' };
  }
});
```

## Testing for Security

When testing your IPC endpoints, include these types of tests:

1. **Input validation tests** - Test with various invalid inputs
2. **Boundary testing** - Test edge cases (empty strings, very long input, etc.)
3. **Malicious input tests** - Test with known malicious patterns
4. **Permission tests** - Verify proper permission checks
5. **Error handling tests** - Ensure errors are handled gracefully

## Reporting Security Issues

If you discover a security vulnerability in the IPC API:

1. Do not disclose it publicly in GitHub issues
2. Email the security team at [security@example.com](mailto:security@example.com)
3. Include detailed information about the vulnerability and how to reproduce it
4. If possible, suggest a fix or mitigation

## Additional Resources

- [Electron Security Documentation](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Common Electron Security Mistakes](https://doyensec.com/resources/us-17-Carettoni-Electronegativity-A-Study-Of-Electron-Security-wp.pdf)
- [Electron Security Checklist](https://github.com/doyensec/electronegativity)

## Contact

For questions about secure IPC implementation, contact the security team or refer to the IPC API documentation in `docs/api/IPC-API.md`. 