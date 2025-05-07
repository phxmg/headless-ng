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
const react_1 = __importStar(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const react_redux_1 = require("react-redux");
const SidebarContainer = styled_components_1.default.div `
  width: 280px;
  background-color: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
const SidebarHeader = styled_components_1.default.div `
  padding: ${props => props.theme.spacing.md};
  font-weight: ${props => props.theme.fontWeights.semiBold};
  font-size: ${props => props.theme.fontSizes.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const SidebarContent = styled_components_1.default.div `
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.sm} 0;
`;
const SequenceList = styled_components_1.default.ul `
  list-style-type: none;
  padding: 0;
  margin: 0;
`;
const SequenceItem = styled_components_1.default.li `
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  border-left: 3px solid ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
  background-color: ${props => props.isActive ? props.theme.colors.highlight : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isActive ? props.theme.colors.highlight : props.theme.colors.divider};
  }
`;
const SequenceIcon = styled_components_1.default.span `
  margin-right: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textSecondary};
`;
const SequenceTitle = styled_components_1.default.div `
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const SequenceControls = styled_components_1.default.div `
  display: flex;
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.normal};
  
  ${SequenceItem}:hover & {
    opacity: 1;
  }
`;
const ControlButton = styled_components_1.default.button `
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;
const ActionList = styled_components_1.default.ul `
  list-style-type: none;
  padding: 0 0 0 ${props => props.theme.spacing.xl};
  margin: 0;
`;
const ActionItem = styled_components_1.default.li `
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: -${props => props.theme.spacing.md};
    top: 50%;
    width: ${props => props.theme.spacing.md};
    height: 1px;
    background-color: ${props => props.theme.colors.border};
  }
`;
const ActionIcon = styled_components_1.default.span `
  margin-right: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fontSizes.xs};
`;
const EmptyState = styled_components_1.default.div `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  
  p {
    margin: ${props => props.theme.spacing.md} 0;
  }
`;
const AddButton = styled_components_1.default.button `
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.normal};
  
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }
`;
const SidebarFooter = styled_components_1.default.div `
  padding: ${props => props.theme.spacing.md};
  display: flex;
  justify-content: space-between;
  border-top: 1px solid ${props => props.theme.colors.border};
`;
const FooterButton = styled_components_1.default.button `
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;
const Sidebar = ({ setPlaybackProgress }) => {
    const dispatch = (0, react_redux_1.useDispatch)();
    const currentSequence = (0, react_redux_1.useSelector)(state => state.recorder.currentSequence);
    const recordedActions = (0, react_redux_1.useSelector)(state => state.recorder.recordedActions);
    // Headless mode toggle
    const [headless, setHeadless] = (0, react_1.useState)(true);
    // Playback state for each sequence
    const [playbackStates, setPlaybackStates] = (0, react_1.useState)({}); // { [sequenceId]: { status, player, error, progress } }
    // Sample sequences for demo
    const [sequences, setSequences] = (0, react_1.useState)([
        { id: 1, title: 'Login to Example.com', actions: [
                { type: 'navigate', value: 'https://example.com' },
                { type: 'click', selector: '#username', description: 'Click username field' },
                { type: 'type', value: 'testuser', description: 'Type username' },
                { type: 'click', selector: '#password', description: 'Click password field' },
                { type: 'type', value: '********', description: 'Type password' },
                { type: 'click', selector: '#login-button', description: 'Click login button' },
                { type: 'wait', value: 2000, description: 'Wait for 2 seconds' },
                { type: 'screenshot', description: 'Take screenshot' }
            ] },
        { id: 2, title: 'Search on Google', actions: [
                { type: 'navigate', value: 'https://google.com' },
                { type: 'click', selector: 'input[name="q"]', description: 'Click search field' },
                { type: 'type', value: 'headless browser automation', description: 'Type search query' },
                { type: 'click', selector: 'input[name="btnK"]', description: 'Click search button' },
                { type: 'wait', value: 1000, description: 'Wait for 1 second' },
                { type: 'screenshot', description: 'Take screenshot of results' }
            ] }
    ]);
    const [activeSequence, setActiveSequence] = (0, react_1.useState)(null);
    const [expandedSequence, setExpandedSequence] = (0, react_1.useState)(null);
    const handleSequenceClick = (id) => {
        setActiveSequence(id);
        const sequence = sequences.find(seq => seq.id === id);
        if (sequence) {
            dispatch({ type: 'SET_SEQUENCE', payload: sequence });
        }
    };
    const handleExpandClick = (id) => {
        setExpandedSequence(expandedSequence === id ? null : id);
    };
    const handleAddSequence = () => {
        const newSequence = {
            id: sequences.length + 1,
            title: `New Sequence ${sequences.length + 1}`,
            actions: []
        };
        setSequences([...sequences, newSequence]);
    };
    const handlePlaySequence = (id) => {
        const sequence = sequences.find(seq => seq.id === id);
        if (sequence) {
            dispatch({
                type: 'START_PLAYBACK',
                payload: { totalSteps: sequence.actions.length }
            });
            // --- Playback integration ---
            const automationService = new BrowserAutomationService(headless);
            const player = new SequencePlayer(automationService, sequence.actions, (status, message, currentIndex, progress) => {
                setPlaybackStates(prev => ({
                    ...prev,
                    [id]: { ...prev[id], status, error: status === 'error' ? message : null, progress, player }
                }));
                if (typeof setPlaybackProgress === 'function') {
                    setPlaybackProgress(progress);
                }
            });
            setPlaybackStates(prev => ({ ...prev, [id]: { status: 'playing', player, error: null, progress: null } }));
            player.play();
            // --- End integration ---
            console.log('Playing sequence:', sequence);
        }
    };
    const handlePauseSequence = (id) => {
        const state = playbackStates[id];
        if (state && state.player) {
            state.player.pause();
        }
    };
    const handleResumeSequence = (id) => {
        const state = playbackStates[id];
        if (state && state.player) {
            state.player.resume();
        }
    };
    const handleStopSequence = (id) => {
        const state = playbackStates[id];
        if (state && state.player) {
            state.player.stop();
            setPlaybackStates(prev => ({ ...prev, [id]: { ...prev[id], status: 'stopped' } }));
        }
    };
    const handleRetrySequence = (id) => {
        // Re-run from the beginning
        setPlaybackStates(prev => ({ ...prev, [id]: undefined }));
        handlePlaySequence(id);
    };
    const handleSkipSequence = (id) => {
        // Move to next action (if possible)
        const state = playbackStates[id];
        if (state && state.player) {
            state.player.currentActionIndex++;
            state.player.play();
        }
    };
    const handleDeleteSequence = (id) => {
        const newSequences = sequences.filter(seq => seq.id !== id);
        setSequences(newSequences);
        if (activeSequence === id) {
            setActiveSequence(null);
            dispatch({ type: 'CLEAR_SEQUENCE' });
        }
    };
    const getActionIcon = (type) => {
        switch (type) {
            case 'navigate': return '🌐';
            case 'click': return '👆';
            case 'type': return '⌨️';
            case 'wait': return '⏱️';
            case 'screenshot': return '📷';
            default: return '🔹';
        }
    };
    const getActionText = (action) => {
        return action.description || action.value || action.selector || 'Unknown action';
    };
    return ((0, jsx_runtime_1.jsxs)(SidebarContainer, { children: [(0, jsx_runtime_1.jsxs)(SidebarHeader, { children: [(0, jsx_runtime_1.jsx)("span", { children: "Automation Sequences" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("label", { style: { fontSize: 12, marginRight: 8 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: headless, onChange: e => setHeadless(e.target.checked), style: { marginRight: 4 } }), "Headless"] }), (0, jsx_runtime_1.jsx)(AddButton, { onClick: handleAddSequence, children: "+" })] })] }), (0, jsx_runtime_1.jsx)(SidebarContent, { children: sequences.length === 0 ? ((0, jsx_runtime_1.jsxs)(EmptyState, { children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCCB" }), (0, jsx_runtime_1.jsx)("p", { children: "No sequences yet" }), (0, jsx_runtime_1.jsx)("p", { children: "Record your first automation or create one manually" })] })) : ((0, jsx_runtime_1.jsx)(SequenceList, { children: sequences.map(sequence => {
                        const playback = playbackStates[sequence.id] || {};
                        return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsxs)(SequenceItem, { isActive: activeSequence === sequence.id, onClick: () => handleSequenceClick(sequence.id), children: [(0, jsx_runtime_1.jsx)(SequenceIcon, { children: "\uD83D\uDCCB" }), (0, jsx_runtime_1.jsx)(SequenceTitle, { children: sequence.title }), playback.status && ((0, jsx_runtime_1.jsx)("span", { style: { marginLeft: 8, fontSize: 12, color: playback.status === 'error' ? 'red' : playback.status === 'playing' ? 'green' : '#888' }, children: playback.status })), (0, jsx_runtime_1.jsxs)(SequenceControls, { children: [(0, jsx_runtime_1.jsx)(ControlButton, { onClick: e => { e.stopPropagation(); handleExpandClick(sequence.id); }, children: expandedSequence === sequence.id ? '▼' : '▶' }), (0, jsx_runtime_1.jsx)(ControlButton, { onClick: e => { e.stopPropagation(); handlePlaySequence(sequence.id); }, disabled: playback.status === 'playing', children: "\u25B6\uFE0F" }), (0, jsx_runtime_1.jsx)(ControlButton, { onClick: e => { e.stopPropagation(); handlePauseSequence(sequence.id); }, disabled: playback.status !== 'playing', children: "\u23F8\uFE0F" }), (0, jsx_runtime_1.jsx)(ControlButton, { onClick: e => { e.stopPropagation(); handleResumeSequence(sequence.id); }, disabled: playback.status !== 'paused', children: "\u23F5\uFE0F" }), (0, jsx_runtime_1.jsx)(ControlButton, { onClick: e => { e.stopPropagation(); handleStopSequence(sequence.id); }, disabled: playback.status !== 'playing' && playback.status !== 'paused', children: "\u23F9\uFE0F" }), (0, jsx_runtime_1.jsx)(ControlButton, { onClick: e => { e.stopPropagation(); handleDeleteSequence(sequence.id); }, disabled: playback.status === 'playing', children: "\uD83D\uDDD1\uFE0F" })] })] }), playback.status === 'error' && ((0, jsx_runtime_1.jsxs)("div", { style: { color: 'red', marginLeft: 32, marginBottom: 4 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Error: ", playback.error] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleRetrySequence(sequence.id), children: "Retry" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleSkipSequence(sequence.id), style: { marginLeft: 8 }, children: "Skip" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleStopSequence(sequence.id), style: { marginLeft: 8 }, children: "Stop" })] })), playback.progress && ((0, jsx_runtime_1.jsxs)("div", { style: { marginLeft: 32, marginBottom: 4, fontSize: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Progress: ", playback.progress.percentage, "% | Step ", playback.progress.current + 1, " / ", playback.progress.total] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Status: ", playback.progress.status] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Current Action: ", (0, jsx_runtime_1.jsx)("code", { children: playback.progress.currentAction ? playback.progress.currentAction.type : '-' })] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Elapsed: ", (playback.progress.executionTimeMs / 1000).toFixed(1), "s"] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Log:", (0, jsx_runtime_1.jsx)("ul", { style: { maxHeight: 60, overflowY: 'auto', fontSize: 11, paddingLeft: 18 }, children: playback.progress.log.map((entry, i) => ((0, jsx_runtime_1.jsxs)("li", { style: { color: entry.type === 'error' ? 'red' : 'green' }, children: ["[", entry.type, "] Step ", entry.index + 1, ": ", entry.action.type, " ", entry.message] }, i))) })] })] })), expandedSequence === sequence.id && ((0, jsx_runtime_1.jsx)(ActionList, { children: sequence.actions.map((action, index) => ((0, jsx_runtime_1.jsxs)(ActionItem, { children: [(0, jsx_runtime_1.jsx)(ActionIcon, { children: getActionIcon(action.type) }), getActionText(action)] }, index))) }))] }, sequence.id));
                    }) })) }), (0, jsx_runtime_1.jsxs)(SidebarFooter, { children: [(0, jsx_runtime_1.jsx)(FooterButton, { children: "Import" }), (0, jsx_runtime_1.jsx)(FooterButton, { children: "Export" })] })] }));
};
exports.default = Sidebar;
//# sourceMappingURL=Sidebar.js.map