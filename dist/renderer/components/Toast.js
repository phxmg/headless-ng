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
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const store_1 = require("../store");
const Toast = ({ id, message, type, duration }) => {
    const [exit, setExit] = (0, react_1.useState)(false);
    const [width, setWidth] = (0, react_1.useState)(0);
    const [intervalID, setIntervalID] = (0, react_1.useState)(null);
    const dispatch = (0, react_redux_1.useDispatch)();
    const handleClose = () => {
        setExit(true);
        setTimeout(() => {
            dispatch({ type: store_1.FEEDBACK_ACTIONS.HIDE_TOAST, payload: id });
        }, 300); // match exit animation duration
    };
    (0, react_1.useEffect)(() => {
        if (duration) {
            // Start the progress animation
            const interval = setInterval(() => {
                setWidth(prev => {
                    if (prev < 100) {
                        return prev + 0.5;
                    }
                    clearInterval(interval);
                    return prev;
                });
            }, duration / 200);
            setIntervalID(interval);
            // Auto-dismiss after duration
            const timeoutId = setTimeout(() => {
                handleClose();
            }, duration);
            return () => {
                clearInterval(interval);
                clearTimeout(timeoutId);
            };
        }
    }, [duration, id, dispatch]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `toast ${type} ${exit ? 'exit' : ''}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "toast-content", children: message }), (0, jsx_runtime_1.jsx)("button", { className: "toast-close", onClick: handleClose, children: "\u00D7" }), duration && ((0, jsx_runtime_1.jsx)("div", { className: "toast-progress", style: { width: `${width}%` } }))] }));
};
const ToastContainer = () => {
    const toasts = (0, react_redux_1.useSelector)(state => state.feedback.toasts);
    return ((0, jsx_runtime_1.jsx)("div", { className: "toast-container", children: toasts.map(toast => ((0, jsx_runtime_1.jsx)(Toast, { id: toast.id, message: toast.message, type: toast.type, duration: toast.duration }, toast.id))) }));
};
exports.default = ToastContainer;
//# sourceMappingURL=Toast.js.map