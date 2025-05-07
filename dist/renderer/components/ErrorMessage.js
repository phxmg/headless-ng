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
 * ErrorMessage - Shows an error message with optional actions for recovery
 * @param {Object} props - Component props
 * @param {string} props.errorKey - Key for the specific error in Redux
 * @param {Object} props.error - Direct error object if not using Redux
 * @param {Function} props.onClose - Custom close handler
 * @param {Array} props.actions - Array of recovery actions [{ label, handler }]
 */
const ErrorMessage = ({ errorKey = 'global', error: directError, onClose, actions = [] }) => {
    const dispatch = (0, react_redux_1.useDispatch)();
    const reduxError = (0, react_redux_1.useSelector)(state => state.feedback.errors[errorKey]);
    const error = directError || reduxError;
    if (!error)
        return null;
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        else {
            dispatch({
                type: store_1.FEEDBACK_ACTIONS.CLEAR_ERROR,
                payload: { key: errorKey }
            });
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "error-message", children: [(0, jsx_runtime_1.jsxs)("div", { className: "error-message-header", children: [(0, jsx_runtime_1.jsx)("h4", { className: "error-message-title", children: "Error" }), (0, jsx_runtime_1.jsx)("button", { className: "error-message-close", onClick: handleClose, children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("p", { className: "error-message-body", children: error.message }), error.details && ((0, jsx_runtime_1.jsxs)("details", { children: [(0, jsx_runtime_1.jsx)("summary", { children: "Details" }), (0, jsx_runtime_1.jsx)("pre", { children: error.details })] })), (actions && actions.length > 0) && ((0, jsx_runtime_1.jsx)("div", { className: "error-message-actions", children: actions.map((action, index) => ((0, jsx_runtime_1.jsx)("button", { className: "error-message-action", onClick: action.handler, children: action.label }, index))) }))] }));
};
exports.default = ErrorMessage;
//# sourceMappingURL=ErrorMessage.js.map