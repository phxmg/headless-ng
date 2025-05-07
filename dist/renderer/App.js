"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const ControlPanel_1 = __importDefault(require("./components/ControlPanel"));
const react_split_pane_1 = __importDefault(require("react-split-pane"));
const BrowserView_1 = __importDefault(require("./components/BrowserView"));
const Header_1 = __importDefault(require("./components/Header"));
const FeedbackSystem_1 = __importStar(require("./components/FeedbackSystem"));
function App() {
    console.log('window.electronAPI:', window.electronAPI); // Debug: verify preload exposure
    const [browserUrl, setBrowserUrl] = react_1.default.useState('https://media.getitfree.us');
    const [isLoading, setIsLoading] = react_1.default.useState(false);
    const [canGoBack, setCanGoBack] = react_1.default.useState(false);
    const [canGoForward, setCanGoForward] = react_1.default.useState(false);
    const [error, setError] = react_1.default.useState(null);
    // Use the feedback system
    const feedback = (0, FeedbackSystem_1.useFeedback)();
    // Handle navigation state updates from main process
    react_1.default.useEffect(() => {
        if (window.electronAPI) {
            const handleNavigationStateUpdate = (_, state) => {
                if (state.currentURL !== browserUrl) {
                    setBrowserUrl(state.currentURL);
                }
                setCanGoBack(state.canGoBack);
                setCanGoForward(state.canGoForward);
                setIsLoading(state.isLoading);
                // Update loading status in the feedback system
                if (state.isLoading) {
                    feedback.setLoading('navigation');
                }
                else {
                    feedback.clearLoading('navigation');
                }
                if (state.lastError) {
                    setError(state.lastError);
                    feedback.setError(state.lastError.message, state.lastError.details || state.lastError.url, 'navigation');
                }
            };
            // Listen for navigation state updates from main process
            window.electronAPI.onNavigationStateUpdate(handleNavigationStateUpdate);
            // Cleanup
            return () => {
                // Unfortunately Electron doesn't provide a way to directly remove listeners
                // Ideally we would clean up here
            };
        }
    }, [browserUrl, feedback]);
    // Navigation handlers wired to electronAPI
    const handleNavigate = async (url) => {
        if (window.electronAPI && url) {
            setError(null); // Clear any existing errors
            feedback.clearError('navigation'); // Clear any existing navigation errors
            setIsLoading(true); // Start loading indicator
            feedback.setLoading('navigation'); // Set loading in feedback system
            feedback.showToast(`Navigating to ${url}`, 'info'); // Show navigation toast
            const result = await window.electronAPI.loadURL(url);
            if (!result.success) {
                console.error('Navigation failed:', result.error);
                const errorMsg = result.error || 'Failed to navigate to the requested URL';
                setError({
                    message: errorMsg,
                    url: url
                });
                feedback.setError(errorMsg, `URL: ${url}`, 'navigation');
                feedback.showToast(`Navigation failed: ${errorMsg}`, 'error');
                setIsLoading(false);
                feedback.clearLoading('navigation');
            }
            // Actual URL change and loading state will be handled via events
        }
    };
    const handleBack = async () => {
        if (window.electronAPI && canGoBack) {
            feedback.setLoading('navigation');
            await window.electronAPI.goBack();
        }
    };
    const handleForward = async () => {
        if (window.electronAPI && canGoForward) {
            feedback.setLoading('navigation');
            await window.electronAPI.goForward();
        }
    };
    const handleRefresh = async () => {
        if (window.electronAPI) {
            feedback.setLoading('navigation');
            feedback.showToast('Refreshing page', 'info');
            await window.electronAPI.reload();
        }
    };
    const handleStop = async () => {
        if (window.electronAPI && isLoading) {
            await window.electronAPI.stop();
            feedback.clearLoading('navigation');
            feedback.showToast('Navigation stopped', 'warning');
        }
    };
    const handleHome = () => {
        handleNavigate('https://media.getitfree.us');
    };
    // Callbacks from BrowserView
    const handleDidNavigate = (url) => {
        setBrowserUrl(url);
        feedback.showToast(`Navigated to ${url}`, 'success');
        feedback.clearLoading('navigation');
    };
    const handleDidFailLoad = (errorInfo) => {
        setError(errorInfo);
        setIsLoading(false);
        feedback.clearLoading('navigation');
        feedback.setError(errorInfo.message || 'Page failed to load', errorInfo.url || '', 'navigation');
    };
    const handleLoading = (loading) => {
        setIsLoading(loading);
        if (loading) {
            feedback.setLoading('navigation');
        }
        else {
            feedback.clearLoading('navigation');
        }
    };
    const handleNavigationStateChange = (state) => {
        setCanGoBack(state.canGoBack);
        setCanGoForward(state.canGoForward);
        if (state.currentURL !== browserUrl) {
            setBrowserUrl(state.currentURL);
        }
        setIsLoading(state.isLoading);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%)' }, children: [(0, jsx_runtime_1.jsx)(FeedbackSystem_1.default, {}), (0, jsx_runtime_1.jsx)(Header_1.default, {}), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, minHeight: 0 }, children: (0, jsx_runtime_1.jsxs)(react_split_pane_1.default, { split: "vertical", minSize: 300, defaultSize: 400, style: { position: 'relative', height: '100%' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "control-panel", style: { height: '100%' }, children: (0, jsx_runtime_1.jsx)(ControlPanel_1.default, { onNavigate: handleNavigate, onBack: handleBack, onForward: handleForward, onRefresh: handleRefresh, onStop: handleStop, onHome: handleHome, url: browserUrl, canGoBack: canGoBack, canGoForward: canGoForward, isLoading: isLoading }) }), (0, jsx_runtime_1.jsx)("div", { className: "browser-view", style: { height: '100%' }, children: (0, jsx_runtime_1.jsx)(BrowserView_1.default, { url: browserUrl, onDidNavigate: handleDidNavigate, onDidFailLoad: handleDidFailLoad, onLoading: handleLoading, onNavigationStateChange: handleNavigationStateChange }) })] }) })] }));
}
exports.default = App;
//# sourceMappingURL=App.js.map