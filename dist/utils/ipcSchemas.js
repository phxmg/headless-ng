"use strict";
/**
 * IPC Schemas
 *
 * This file defines schemas for IPC message validation to ensure
 * that data passed between the main and renderer processes is valid
 * and properly structured.
 */
/**
 * Schema for navigation error data
 */
const navigationErrorSchema = {
    url: {
        type: 'string',
        required: true
    },
    code: {
        type: 'number',
        required: true
    },
    description: {
        type: 'string',
        required: true
    }
};
/**
 * Schema for automation selectors
 */
const selectorSchema = {
    selector: {
        type: 'string',
        required: true,
        pattern: '^[^<>\'"`]*$' // Disallow HTML/script tags
    }
};
/**
 * Schema for screenshot parameters
 */
const screenshotSchema = {
    path: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\-\\./]+$' // alphanumeric, underscore, dash, dot, slash
    },
    fullPage: {
        type: 'boolean',
        required: false
    },
    clip: {
        type: 'object',
        required: false
    }
};
/**
 * Schema for element type operation
 */
const typeOperationSchema = {
    selector: {
        type: 'string',
        required: true,
        pattern: '^[^<>\'"`]*$'
    },
    text: {
        type: 'string',
        required: true
    },
    delay: {
        type: 'number',
        required: false,
        min: 0,
        max: 1000
    }
};
/**
 * Schema for wait for selector operation
 */
const waitForSelectorSchema = {
    selector: {
        type: 'string',
        required: true,
        pattern: '^[^<>\'"`]*$'
    },
    timeout: {
        type: 'number',
        required: false,
        min: 0,
        max: 60000 // max 1 minute timeout
    }
};
/**
 * Schema for sequence data
 */
const sequenceSchema = {
    name: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\- ]+$'
    },
    steps: {
        type: 'array',
        required: true,
        itemType: 'object'
    },
    description: {
        type: 'string',
        required: false
    },
    tags: {
        type: 'array',
        required: false,
        itemType: 'string'
    }
};
/**
 * Schema for schedule data
 */
const scheduleSchema = {
    sequenceName: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\- ]+$'
    },
    cronExpression: {
        type: 'string',
        required: true,
        // Basic cron expression validation
        pattern: '^(\\*|[0-9,-/]+) (\\*|[0-9,-/]+) (\\*|[0-9,-/]+) (\\*|[0-9,-/]+) (\\*|[0-9,-/]+)( (\\*|[0-9,-/]+))?$'
    },
    options: {
        type: 'object',
        required: false
    }
};
/**
 * Schema for credential data
 */
const credentialSchema = {
    key: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\-\\.]+$'
    },
    value: {
        type: 'string',
        required: true
    }
};
/**
 * Schema for run directory creation
 */
const runDirectorySchema = {
    sequenceName: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\- ]+$'
    }
};
/**
 * Schema for saving a screenshot within a run
 */
const saveScreenshotSchema = {
    runDir: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\-\\./]+$'
    },
    name: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\-\\.]+$'
    }
};
/**
 * Schema for saving results
 */
const saveResultsSchema = {
    runDir: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\-\\./]+$'
    },
    results: {
        type: 'object',
        required: true
    }
};
/**
 * Schema for comparing screenshots
 */
const compareScreenshotsSchema = {
    image1Path: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\-\\./]+$'
    },
    image2Path: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\-\\./]+$'
    }
};
/**
 * Schema for report generation
 */
const reportSchema = {
    runDir: {
        type: 'string',
        required: true,
        pattern: '^[a-zA-Z0-9_\\-\\./]+$'
    },
    options: {
        type: 'object',
        required: false
    }
};
module.exports = {
    navigationErrorSchema,
    selectorSchema,
    screenshotSchema,
    typeOperationSchema,
    waitForSelectorSchema,
    sequenceSchema,
    scheduleSchema,
    credentialSchema,
    runDirectorySchema,
    saveScreenshotSchema,
    saveResultsSchema,
    compareScreenshotsSchema,
    reportSchema
};
//# sourceMappingURL=ipcSchemas.js.map