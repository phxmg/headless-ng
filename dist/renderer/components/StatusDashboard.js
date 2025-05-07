"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const store_1 = require("../store");
/**
 * ProcessItem - Individual process item in the status dashboard
 */
const ProcessItem = ({ id, status, progress, message, timestamp }) => {
    const dispatch = (0, react_redux_1.useDispatch)();
    const handleRemove = () => {
        dispatch({ type: store_1.FEEDBACK_ACTIONS.REMOVE_PROCESS, payload: id });
    };
    // Format timestamp to readable time
    const time = new Date(timestamp).toLocaleTimeString();
    // Icons for different status types
    const statusIcons = {
        running: '⏳',
        completed: '✅',
        error: '❌',
        warning: '⚠️',
        paused: '⏸️'
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "status-process", children: [(0, jsx_runtime_1.jsx)("div", { className: "status-process-icon", children: statusIcons[status] || '🔄' }), (0, jsx_runtime_1.jsxs)("div", { className: "status-process-details", children: [(0, jsx_runtime_1.jsxs)("h4", { className: "status-process-title", children: [id, (0, jsx_runtime_1.jsx)("small", { style: { marginLeft: '10px', fontWeight: 'normal' }, children: time })] }), (0, jsx_runtime_1.jsx)("p", { className: "status-process-message", children: message }), progress !== undefined && ((0, jsx_runtime_1.jsx)("div", { className: "status-process-progress", children: (0, jsx_runtime_1.jsx)("div", { className: "status-process-progress-bar", style: { width: `${Math.min(Math.max(progress, 0), 100)}%` } }) }))] }), status === 'completed' && ((0, jsx_runtime_1.jsx)("button", { onClick: handleRemove, style: {
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: 0.5,
                    padding: '5px'
                }, children: "\u00D7" }))] }));
};
/**
 * StatusDashboard - Shows the status of all ongoing processes
 */
const StatusDashboard = ({ title = 'Running Processes' }) => {
    const processes = (0, react_redux_1.useSelector)(state => state.feedback.processStatus);
    const processEntries = Object.entries(processes);
    if (processEntries.length === 0)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "status-dashboard", children: [(0, jsx_runtime_1.jsx)("div", { className: "status-dashboard-header", children: (0, jsx_runtime_1.jsx)("h3", { className: "status-dashboard-title", children: title }) }), processEntries.map(([id, process]) => ((0, jsx_runtime_1.jsx)(ProcessItem, { id: id, status: process.status, progress: process.progress, message: process.message, timestamp: process.timestamp }, id)))] }));
};
exports.default = StatusDashboard;
//# sourceMappingURL=StatusDashboard.js.map