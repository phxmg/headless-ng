"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusDashboard = exports.ErrorMessage = exports.ComponentLoadingIndicator = exports.GlobalLoadingIndicator = exports.ToastContainer = exports.useFeedback = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const Toast_1 = __importDefault(require("./Toast"));
exports.ToastContainer = Toast_1.default;
const LoadingIndicator_1 = require("./LoadingIndicator");
Object.defineProperty(exports, "GlobalLoadingIndicator", { enumerable: true, get: function () { return LoadingIndicator_1.GlobalLoadingIndicator; } });
Object.defineProperty(exports, "ComponentLoadingIndicator", { enumerable: true, get: function () { return LoadingIndicator_1.ComponentLoadingIndicator; } });
const ErrorMessage_1 = __importDefault(require("./ErrorMessage"));
exports.ErrorMessage = ErrorMessage_1.default;
const StatusDashboard_1 = __importDefault(require("./StatusDashboard"));
exports.StatusDashboard = StatusDashboard_1.default;
const react_redux_1 = require("react-redux");
const store_1 = require("../store");
/**
 * FeedbackSystem - Root component that includes all feedback UI elements
 * This component should be added at the top level of your application
 */
const FeedbackSystem = () => {
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(LoadingIndicator_1.GlobalLoadingIndicator, {}), (0, jsx_runtime_1.jsx)(Toast_1.default, {}), (0, jsx_runtime_1.jsx)(StatusDashboard_1.default, {})] }));
};
/**
 * Utility functions to trigger feedback actions from anywhere in the app
 */
const useFeedback = () => {
    const dispatch = (0, react_redux_1.useDispatch)();
    return {
        /**
         * Show a toast notification
         * @param {string} message - The message to display
         * @param {string} type - 'info', 'success', 'warning', or 'error'
         * @param {number} duration - How long to show the toast (in ms)
         */
        showToast: (message, type = 'info', duration = 3000) => {
            dispatch({
                type: store_1.FEEDBACK_ACTIONS.SHOW_TOAST,
                payload: {
                    message,
                    type,
                    duration
                }
            });
        },
        /**
         * Set loading state for a component or global UI
         * @param {string} key - Key to identify this loading state
         */
        setLoading: (key = 'global') => {
            dispatch({
                type: store_1.FEEDBACK_ACTIONS.SET_LOADING,
                payload: { key }
            });
        },
        /**
         * Clear loading state
         * @param {string} key - Key of the loading state to clear
         */
        clearLoading: (key = 'global') => {
            dispatch({
                type: store_1.FEEDBACK_ACTIONS.CLEAR_LOADING,
                payload: { key }
            });
        },
        /**
         * Set an error state
         * @param {string} message - Error message to display
         * @param {string} details - Optional technical details
         * @param {string} key - Key to identify this error
         */
        setError: (message, details = '', key = 'global') => {
            dispatch({
                type: store_1.FEEDBACK_ACTIONS.SET_ERROR,
                payload: {
                    message,
                    details,
                    key
                }
            });
        },
        /**
         * Clear an error state
         * @param {string} key - Key of the error to clear
         */
        clearError: (key = 'global') => {
            dispatch({
                type: store_1.FEEDBACK_ACTIONS.CLEAR_ERROR,
                payload: { key }
            });
        },
        /**
         * Update the status of a long-running process
         * @param {string} id - Unique identifier for the process
         * @param {string} status - Status: 'running', 'completed', 'error', 'warning', 'paused'
         * @param {number} progress - Progress value (0-100)
         * @param {string} message - Status message to display
         */
        updateProcessStatus: (id, status, progress, message) => {
            dispatch({
                type: store_1.FEEDBACK_ACTIONS.UPDATE_PROCESS_STATUS,
                payload: {
                    id,
                    status,
                    progress,
                    message
                }
            });
        },
        /**
         * Remove a process from the status dashboard
         * @param {string} id - ID of the process to remove
         */
        removeProcess: (id) => {
            dispatch({
                type: store_1.FEEDBACK_ACTIONS.REMOVE_PROCESS,
                payload: id
            });
        }
    };
};
exports.useFeedback = useFeedback;
exports.default = FeedbackSystem;
//# sourceMappingURL=FeedbackSystem.js.map