"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const FeedbackSystem_1 = require("./FeedbackSystem");
/**
 * FeedbackDemo - A component to showcase and test all the feedback system features
 */
const FeedbackDemo = () => {
    const feedback = (0, FeedbackSystem_1.useFeedback)();
    const [componentLoading, setComponentLoading] = react_1.default.useState(false);
    // Demo function for showing different types of toasts
    const showToastDemo = (type) => {
        const messages = {
            info: 'This is an information message',
            success: 'Operation completed successfully!',
            warning: 'This action may have consequences',
            error: 'An error occurred during the operation'
        };
        feedback.showToast(messages[type], type);
    };
    // Demo function for toggling loading indicators
    const toggleGlobalLoading = () => {
        if (document.querySelector('.global-loading')) {
            feedback.clearLoading('global');
        }
        else {
            feedback.setLoading('global');
            // Auto-clear after 3 seconds
            setTimeout(() => feedback.clearLoading('global'), 3000);
        }
    };
    const toggleComponentLoading = () => {
        setComponentLoading(!componentLoading);
        if (!componentLoading) {
            // Auto-clear after 3 seconds
            setTimeout(() => setComponentLoading(false), 3000);
        }
    };
    // Demo function for showing error messages
    const showErrorDemo = () => {
        feedback.setError('Failed to connect to server', 'Error: Connection refused (ECONNREFUSED)', 'demo');
    };
    const clearErrorDemo = () => {
        feedback.clearError('demo');
    };
    // Demo function for updating process status
    const startProcessDemo = () => {
        // Start a demo process
        feedback.updateProcessStatus('demo-process', 'running', 0, 'Starting demo process...');
        // Update progress every 500ms
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            if (progress < 100) {
                feedback.updateProcessStatus('demo-process', 'running', progress, `Processing... ${progress}% complete`);
            }
            else {
                // Complete the process
                feedback.updateProcessStatus('demo-process', 'completed', 100, 'Demo process completed successfully');
                clearInterval(interval);
            }
        }, 500);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "feedback-demo", style: { padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Feedback System Demo" }), (0, jsx_runtime_1.jsxs)("section", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsx)("h4", { children: "Toast Notifications" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => showToastDemo('info'), style: { padding: '8px 12px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Info Toast" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => showToastDemo('success'), style: { padding: '8px 12px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Success Toast" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => showToastDemo('warning'), style: { padding: '8px 12px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Warning Toast" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => showToastDemo('error'), style: { padding: '8px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Error Toast" })] })] }), (0, jsx_runtime_1.jsxs)("section", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsx)("h4", { children: "Loading Indicators" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px', marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: toggleGlobalLoading, style: { padding: '8px 12px', backgroundColor: '#673ab7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Toggle Global Loading" }), (0, jsx_runtime_1.jsx)("button", { onClick: toggleComponentLoading, style: { padding: '8px 12px', backgroundColor: '#673ab7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Toggle Component Loading" })] }), (0, jsx_runtime_1.jsx)(FeedbackSystem_1.ComponentLoadingIndicator, { isLoading: componentLoading, children: (0, jsx_runtime_1.jsx)("div", { style: { padding: '20px', border: '1px dashed #ccc', backgroundColor: '#f9f9f9', textAlign: 'center' }, children: "This is a component with a loading indicator" }) })] }), (0, jsx_runtime_1.jsxs)("section", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsx)("h4", { children: "Error Messages" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: showErrorDemo, style: { padding: '8px 12px', backgroundColor: '#e91e63', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Show Error" }), (0, jsx_runtime_1.jsx)("button", { onClick: clearErrorDemo, style: { padding: '8px 12px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Clear Error" })] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h4", { children: "Process Status" }), (0, jsx_runtime_1.jsx)("button", { onClick: startProcessDemo, style: { padding: '8px 12px', backgroundColor: '#009688', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Start Demo Process" })] })] }));
};
exports.default = FeedbackDemo;
//# sourceMappingURL=FeedbackDemo.js.map