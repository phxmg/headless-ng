"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const headerStyle = {
    width: '100%',
    height: 64,
    background: 'linear-gradient(90deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    boxShadow: '0 2px 8px rgba(66,133,244,0.08)',
    fontFamily: 'Roboto, Arial, sans-serif',
    zIndex: 1000
};
const logoStyle = {
    fontWeight: 700,
    fontSize: 24,
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8
};
const controlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 20
};
const iconBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: 22,
    cursor: 'pointer',
    padding: 4,
    transition: 'color 0.2s',
};
const Header = () => ((0, jsx_runtime_1.jsxs)("header", { style: headerStyle, children: [(0, jsx_runtime_1.jsxs)("div", { style: logoStyle, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 28 }, children: "\uD83C\uDF10" }), (0, jsx_runtime_1.jsx)("span", { children: "HeadlessPilot" })] }), (0, jsx_runtime_1.jsxs)("div", { style: controlsStyle, children: [(0, jsx_runtime_1.jsx)("button", { style: iconBtnStyle, title: "Help", "aria-label": "Help", children: (0, jsx_runtime_1.jsx)("span", { role: "img", "aria-label": "help", children: "\u2753" }) }), (0, jsx_runtime_1.jsx)("button", { style: iconBtnStyle, title: "Settings", "aria-label": "Settings", children: (0, jsx_runtime_1.jsx)("span", { role: "img", "aria-label": "settings", children: "\u2699\uFE0F" }) })] })] }));
exports.default = Header;
//# sourceMappingURL=Header.js.map