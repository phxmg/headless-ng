"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentLoadingIndicator = exports.GlobalLoadingIndicator = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
/**
 * GlobalLoadingIndicator - Shows a loading bar at the top of the screen for app-wide operations
 */
const GlobalLoadingIndicator = () => {
    const isLoading = (0, react_redux_1.useSelector)(state => state.feedback.isLoading.global);
    if (!isLoading)
        return null;
    return (0, jsx_runtime_1.jsx)("div", { className: "global-loading" });
};
exports.GlobalLoadingIndicator = GlobalLoadingIndicator;
/**
 * ComponentLoadingIndicator - Wraps a component and shows a loading overlay when in loading state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.loadingKey - Key for this specific loading state in Redux
 * @param {boolean} props.isLoading - Optional direct loading state (if not using Redux)
 */
const ComponentLoadingIndicator = ({ children, loadingKey, isLoading: directLoading }) => {
    const reduxLoading = (0, react_redux_1.useSelector)(state => loadingKey ? state.feedback.isLoading[loadingKey] : false);
    const isComponentLoading = directLoading || reduxLoading;
    return ((0, jsx_runtime_1.jsx)("div", { className: isComponentLoading ? 'component-loading' : '', children: children }));
};
exports.ComponentLoadingIndicator = ComponentLoadingIndicator;
exports.default = {
    GlobalLoadingIndicator: exports.GlobalLoadingIndicator,
    ComponentLoadingIndicator: exports.ComponentLoadingIndicator
};
//# sourceMappingURL=LoadingIndicator.js.map