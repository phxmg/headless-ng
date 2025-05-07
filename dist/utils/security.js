"use strict";
/**
 * Security utilities for IPC communication
 * Contains functions for input validation and sanitization to ensure secure IPC communication
 */
const { URL } = require('url');
/**
 * List of allowed protocols for navigation
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];
/**
 * List of known malicious domains (example only - in production this would be more comprehensive)
 */
const BLOCKED_DOMAINS = [
    'malware.example.com',
    'phishing.example.com',
    'badsite.example.com'
];
/**
 * Validates if a URL is safe for navigation
 * @param {string} url - URL to validate
 * @returns {object} - { valid: boolean, reason: string|null }
 */
function validateURL(url) {
    // Empty URL check
    if (!url || url.trim() === '') {
        return { valid: false, reason: 'Empty URL' };
    }
    try {
        // Parse URL to check its components
        const parsedUrl = new URL(url);
        // Protocol check
        if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
            return {
                valid: false,
                reason: `Protocol '${parsedUrl.protocol}' not allowed. Only ${ALLOWED_PROTOCOLS.join(', ')} are permitted.`
            };
        }
        // Domain block check
        if (BLOCKED_DOMAINS.includes(parsedUrl.hostname)) {
            return { valid: false, reason: 'Domain is blocked for security reasons' };
        }
        // URL seems valid
        return { valid: true, reason: null };
    }
    catch (error) {
        // URL parsing failed
        return { valid: false, reason: `Invalid URL format: ${error.message}` };
    }
}
/**
 * Validates an object against a schema
 * @param {object} data - Object to validate
 * @param {object} schema - Schema definition with property types
 * @returns {object} - { valid: boolean, errors: string[] }
 */
function validateObject(data, schema) {
    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ['Input must be an object'] };
    }
    const errors = [];
    // Check each schema property against the data
    Object.entries(schema).forEach(([key, expectedType]) => {
        // Check if required property exists
        if (expectedType.required && (data[key] === undefined || data[key] === null)) {
            errors.push(`Missing required property: ${key}`);
            return;
        }
        // Skip validation if property is not present and not required
        if (data[key] === undefined || data[key] === null) {
            return;
        }
        // Validate property type
        const actualType = Array.isArray(data[key]) ? 'array' : typeof data[key];
        const expectedTypeStr = expectedType.type;
        if (actualType !== expectedTypeStr) {
            errors.push(`Property '${key}' should be ${expectedTypeStr}, got ${actualType}`);
        }
        // Validate string patterns if defined
        if (actualType === 'string' && expectedType.pattern) {
            const regex = new RegExp(expectedType.pattern);
            if (!regex.test(data[key])) {
                errors.push(`Property '${key}' does not match required pattern: ${expectedType.pattern}`);
            }
        }
        // Validate number ranges if defined
        if (actualType === 'number') {
            if (expectedType.min !== undefined && data[key] < expectedType.min) {
                errors.push(`Property '${key}' should be >= ${expectedType.min}`);
            }
            if (expectedType.max !== undefined && data[key] > expectedType.max) {
                errors.push(`Property '${key}' should be <= ${expectedType.max}`);
            }
        }
        // Validate array items if defined
        if (actualType === 'array' && expectedType.itemType) {
            data[key].forEach((item, index) => {
                const itemType = Array.isArray(item) ? 'array' : typeof item;
                if (itemType !== expectedType.itemType) {
                    errors.push(`Array '${key}' item at index ${index} should be ${expectedType.itemType}, got ${itemType}`);
                }
            });
        }
    });
    return { valid: errors.length === 0, errors };
}
/**
 * Sanitize a string to prevent injection attacks
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeString(input) {
    if (typeof input !== 'string') {
        return '';
    }
    // Remove HTML tags and entities
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
/**
 * Sanitize a file path to prevent directory traversal
 * @param {string} path - File path to sanitize
 * @returns {string} - Sanitized path
 */
function sanitizeFilePath(path) {
    if (typeof path !== 'string') {
        return '';
    }
    // Remove path traversal sequences and normalize path
    return path
        .replace(/\.\.\//g, '') // Remove parent directory references
        .replace(/\.\//g, '') // Remove current directory references
        .replace(/\/\//g, '/') // Replace double slashes
        .replace(/^\//, ''); // Remove leading slash
}
/**
 * Validate a CSS selector to prevent CSS injection
 * @param {string} selector - CSS selector to validate
 * @returns {object} - { valid: boolean, reason: string|null }
 */
function validateSelector(selector) {
    if (typeof selector !== 'string') {
        return { valid: false, reason: 'Selector must be a string' };
    }
    // Check for potentially dangerous constructs in selectors
    if (selector.includes('javascript:') || selector.includes('data:')) {
        return { valid: false, reason: 'Selector contains dangerous protocol' };
    }
    // Simple selector validation (could be more comprehensive in production)
    try {
        // Test if selector is valid by trying to create a selector
        document.createDocumentFragment().querySelector(selector);
        return { valid: true, reason: null };
    }
    catch (error) {
        return { valid: false, reason: `Invalid selector: ${error.message}` };
    }
}
module.exports = {
    validateURL,
    validateObject,
    sanitizeString,
    sanitizeFilePath,
    validateSelector,
    ALLOWED_PROTOCOLS,
};
//# sourceMappingURL=security.js.map