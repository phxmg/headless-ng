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
const Sidebar_1 = __importDefault(require("./Sidebar"));
const react_redux_1 = require("react-redux");
const react_beautiful_dnd_1 = require("react-beautiful-dnd");
const FeedbackDemo_1 = __importDefault(require("./FeedbackDemo"));
// Temporary HelpIcon to fix fatal error (must be in scope for all uses)
const HelpIcon = () => ((0, jsx_runtime_1.jsx)("span", { title: "Help", style: { fontSize: 18, color: '#888', marginLeft: 8 }, children: "\u2753" }));
// No longer need props for basic nav, will use electronAPI directly
function ControlPanel({ onNavigate, onBack, onForward, onRefresh, onHome, url, canGoBack, canGoForward }) {
    const dispatch = (0, react_redux_1.useDispatch)();
    const isRecordingRedux = (0, react_redux_1.useSelector)(state => state.recording.isRecording);
    const playbackRedux = (0, react_redux_1.useSelector)(state => state.playback);
    // State for navigation input
    const [inputUrl, setInputUrl] = (0, react_1.useState)(url || '');
    (0, react_1.useEffect)(() => { setInputUrl(url || ''); }, [url]);
    // State for automation inputs
    const [selector, setSelector] = (0, react_1.useState)('');
    const [textToType, setTextToType] = (0, react_1.useState)('');
    const [screenshotPath, setScreenshotPath] = (0, react_1.useState)('headless-screenshot.png'); // Default path
    // State for recording (local fallback for UI, but Redux is source of truth)
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    // State for loading/feedback
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [statusMessage, setStatusMessage] = (0, react_1.useState)('');
    // State for playback progress
    const [playbackProgress, setPlaybackProgress] = (0, react_1.useState)(null);
    // State for element analysis
    const [elementAnalysis, setElementAnalysis] = (0, react_1.useState)(null);
    // State for results management
    const [runHistory, setRunHistory] = (0, react_1.useState)([]);
    const [selectedRun, setSelectedRun] = (0, react_1.useState)(null);
    const [selectedResult, setSelectedResult] = (0, react_1.useState)(null);
    const [selectedScreenshot, setSelectedScreenshot] = (0, react_1.useState)(null);
    // State for sequence management
    const [sequences, setSequences] = (0, react_1.useState)([]);
    const [newSequenceName, setNewSequenceName] = (0, react_1.useState)('');
    const [sequenceLoadError, setSequenceLoadError] = (0, react_1.useState)('');
    const [selectedSequence, setSelectedSequence] = (0, react_1.useState)(null);
    // State for credential management
    const [credentials, setCredentials] = (0, react_1.useState)([]);
    const [credKey, setCredKey] = (0, react_1.useState)('');
    const [credValue, setCredValue] = (0, react_1.useState)('');
    const [selectedCred, setSelectedCred] = (0, react_1.useState)(null);
    // State for scheduling management
    const [schedules, setSchedules] = (0, react_1.useState)({});
    const [scheduleSequenceName, setScheduleSequenceName] = (0, react_1.useState)('');
    const [scheduleCron, setScheduleCron] = (0, react_1.useState)('');
    const [scheduleOptions, setScheduleOptions] = (0, react_1.useState)('');
    // --- Drag-and-Drop Sequence Editor ---
    const [editorActions, setEditorActions] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (selectedSequence && selectedSequence.actions) {
            setEditorActions([...selectedSequence.actions]);
        }
        else {
            setEditorActions([
                { type: 'navigate', url: 'https://example.com' },
                { type: 'click', selector: '#login' },
                { type: 'type', selector: '#username', text: 'user' },
            ]);
        }
    }, [selectedSequence]);
    const handleDragEnd = (result) => {
        if (!result.destination)
            return;
        const reordered = Array.from(editorActions);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        setEditorActions(reordered);
        // TODO: Optionally update sequence in backend/store
    };
    const SequenceEditor = () => ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 20, padding: 10, border: '1px solid #bdbdbd', borderRadius: 6, background: '#f5f5f5' }, children: [(0, jsx_runtime_1.jsx)("b", { children: "Sequence Editor (Drag & Drop)" }), (0, jsx_runtime_1.jsx)(react_beautiful_dnd_1.DragDropContext, { onDragEnd: handleDragEnd, children: (0, jsx_runtime_1.jsx)(react_beautiful_dnd_1.Droppable, { droppableId: "sequence-actions", children: (provided) => ((0, jsx_runtime_1.jsxs)("div", { ...provided.droppableProps, ref: provided.innerRef, style: { minHeight: 60 }, children: [editorActions.map((action, idx) => ((0, jsx_runtime_1.jsx)(react_beautiful_dnd_1.Draggable, { draggableId: `action-${idx}`, index: idx, children: (provided, snapshot) => ((0, jsx_runtime_1.jsxs)("div", { ref: provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, style: {
                                        userSelect: 'none',
                                        padding: 8,
                                        margin: '0 0 8px 0',
                                        background: snapshot.isDragging ? '#bbdefb' : '#fff',
                                        border: '1px solid #90caf9',
                                        borderRadius: 4,
                                        ...provided.draggableProps.style,
                                    }, children: [(0, jsx_runtime_1.jsxs)("span", { style: { fontWeight: 'bold', marginRight: 8 }, children: ["#", idx + 1] }), (0, jsx_runtime_1.jsx)("span", { children: action.type }), action.url && (0, jsx_runtime_1.jsx)("span", { style: { marginLeft: 8, color: '#888' }, children: action.url }), action.selector && (0, jsx_runtime_1.jsx)("span", { style: { marginLeft: 8, color: '#888' }, children: action.selector }), action.text && (0, jsx_runtime_1.jsx)("span", { style: { marginLeft: 8, color: '#888' }, children: action.text })] })) }, idx))), provided.placeholder] })) }) })] }));
    // Clear status message after a delay
    (0, react_1.useEffect)(() => {
        if (statusMessage) {
            const timer = setTimeout(() => setStatusMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);
    const handleApiCall = async (apiFn, ...args) => {
        setLoading(true);
        setStatusMessage('Executing...');
        try {
            const result = await apiFn(...args);
            if (result && result.success) {
                setStatusMessage(`Success! ${result.path ? '(Path: ' + result.path + ')' : ''}`);
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            console.error('IPC Error:', error);
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    // --- Navigation Handlers ---
    const handleGoBack = () => onBack && onBack();
    const handleGoForward = () => onForward && onForward();
    const handleReload = () => onRefresh && onRefresh();
    const handleStop = () => window.electronAPI && window.electronAPI.stop();
    const handleLoadURL = (e) => {
        e.preventDefault();
        if (onNavigate)
            onNavigate(inputUrl);
    };
    // --- Automation Handlers ---
    const handleGetNewPage = () => handleApiCall(window.automationAPI.getNewPage);
    const handleClick = () => handleApiCall(window.automationAPI.click, selector);
    const handleType = () => handleApiCall(window.automationAPI.type, selector, textToType);
    const handleScreenshot = () => handleApiCall(window.automationAPI.screenshot, screenshotPath);
    const handleWaitForSelector = () => handleApiCall(window.automationAPI.waitForSelector, selector); // Added wait
    // --- Recording Handlers (Placeholder - Need IPC) ---
    const handleStartRecording = () => {
        handleApiCall(window.recordingAPI.start).then(result => {
            if (result?.success) {
                setIsRecording(true);
                dispatch({ type: 'START_RECORDING' });
            }
        });
    };
    const handlePauseRecording = () => {
        handleApiCall(window.recordingAPI.pause);
        dispatch({ type: 'PAUSE_RECORDING' });
    };
    const handleStopRecording = () => {
        handleApiCall(window.recordingAPI.stop).then(result => {
            if (result?.success) {
                setIsRecording(false);
                dispatch({ type: 'STOP_RECORDING' });
                // Optionally: dispatch({ type: 'ADD_RECORDED_ACTIONS', payload: result.actions })
            }
        });
    };
    // --- Element Analysis Handler ---
    const handleAnalyzeElements = async () => {
        setLoading(true);
        setStatusMessage('Analyzing elements...');
        try {
            const result = await window.automationAPI.analyzeElements();
            if (result && result.success) {
                setElementAnalysis(result.result);
                setStatusMessage('Element analysis complete.');
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    // --- Results Management Handlers ---
    const handleLoadRunHistory = async (sequenceName) => {
        setLoading(true);
        setStatusMessage('Loading run history...');
        try {
            const result = await window.resultsAPI.getRunHistory(sequenceName);
            if (result && result.success) {
                setRunHistory(result.history);
                setStatusMessage('Run history loaded.');
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    const handleSelectRun = (run) => {
        setSelectedRun(run);
        setSelectedResult(run.results);
        setSelectedScreenshot(null);
    };
    const handleSelectScreenshot = (runDir, filename) => {
        setSelectedScreenshot(`${runDir}/${filename}`);
    };
    // --- Sequence Management Handlers ---
    const handleLoadSequences = async () => {
        setLoading(true);
        setStatusMessage('Loading sequences...');
        try {
            const result = await window.sequencesAPI.getAllSequences();
            if (result && result.success) {
                setSequences(result.sequences);
                setStatusMessage('Sequences loaded.');
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    const handleCreateSequence = async () => {
        if (!newSequenceName)
            return;
        setLoading(true);
        setStatusMessage('Saving sequence...');
        try {
            const result = await window.sequencesAPI.saveSequence({ name: newSequenceName, actions: [] });
            if (result && result.success) {
                setStatusMessage('Sequence saved.');
                setNewSequenceName('');
                handleLoadSequences();
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    const handleSelectSequence = (seq) => {
        setSelectedSequence(seq);
        setSequenceLoadError('');
    };
    const handleDeleteSequence = async (name) => {
        setLoading(true);
        setStatusMessage('Deleting sequence...');
        try {
            const result = await window.sequencesAPI.deleteSequence(name);
            if (result && result.success) {
                setStatusMessage('Sequence deleted.');
                handleLoadSequences();
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    // --- Credential Management Handlers ---
    const handleLoadCredentials = async () => {
        setLoading(true);
        setStatusMessage('Loading credentials...');
        try {
            const result = await window.credentialsAPI.getAllCredentials();
            if (result && result.success) {
                setCredentials(result.creds);
                setStatusMessage('Credentials loaded.');
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    const handleSaveCredential = async () => {
        if (!credKey || !credValue)
            return;
        setLoading(true);
        setStatusMessage('Saving credential...');
        try {
            const result = await window.credentialsAPI.saveCredential(credKey, credValue);
            if (result && result.success) {
                setStatusMessage('Credential saved.');
                setCredKey('');
                setCredValue('');
                handleLoadCredentials();
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    const handleDeleteCredential = async (key) => {
        setLoading(true);
        setStatusMessage('Deleting credential...');
        try {
            const result = await window.credentialsAPI.deleteCredential(key);
            if (result && result.success) {
                setStatusMessage('Credential deleted.');
                handleLoadCredentials();
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    const handleSelectCredential = (cred) => {
        setSelectedCred(cred);
    };
    // --- Scheduling Management Handlers ---
    const handleLoadSchedules = async () => {
        setLoading(true);
        setStatusMessage('Loading schedules...');
        try {
            const result = await window.schedulesAPI.getAllSchedules();
            if (result && result.success) {
                setSchedules(result.result);
                setStatusMessage('Schedules loaded.');
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    const handleScheduleSequence = async () => {
        setLoading(true);
        setStatusMessage('Scheduling sequence...');
        try {
            const options = scheduleOptions ? JSON.parse(scheduleOptions) : {};
            const result = await window.schedulesAPI.scheduleSequence(scheduleSequenceName, scheduleCron, options);
            if (result && result.success) {
                setStatusMessage('Sequence scheduled.');
                handleLoadSchedules();
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    const handleUnscheduleSequence = async (name) => {
        setLoading(true);
        setStatusMessage('Unscheduling sequence...');
        try {
            const result = await window.schedulesAPI.unscheduleSequence(name);
            if (result && result.success) {
                setStatusMessage('Sequence unscheduled.');
                handleLoadSchedules();
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    // --- Playback Progress UI ---
    function PlaybackProgress({ progress }) {
        if (!progress)
            return null;
        const { percentage, current, total, status, currentAction, executionTimeMs } = progress;
        return ((0, jsx_runtime_1.jsxs)("div", { style: { margin: '16px 0 12px 0', padding: 10, border: '2px solid #90caf9', borderRadius: 8, background: '#e3f2fd', boxShadow: '0 2px 8px #e3f2fd' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("b", { children: "Playback Progress" }), (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: 13, color: '#1976d2' }, children: ["Step ", current + 1, " / ", total] })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, background: '#e0e0e0', borderRadius: 6, height: 18, overflow: 'hidden', position: 'relative' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: `${percentage}%`, background: '#1976d2', height: '100%', borderRadius: 6, transition: 'width 0.3s' } }), (0, jsx_runtime_1.jsxs)("span", { style: { position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', color: '#fff', fontWeight: 'bold', fontSize: 13 }, children: [percentage, "%"] })] }) }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 4, fontSize: 13, display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Status: ", (0, jsx_runtime_1.jsx)("b", { style: { color: status === 'error' ? 'red' : status === 'finished' ? 'green' : '#1976d2' }, children: status })] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Elapsed: ", (executionTimeMs / 1000).toFixed(1), "s"] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Current: ", (0, jsx_runtime_1.jsx)("code", { children: currentAction ? currentAction.type : '-' })] })] })] }));
    }
    // --- Recording State Visual Indicator ---
    const RecordingIndicator = () => ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center', marginBottom: 12 }, children: isRecordingRedux ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { style: {
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: 'red',
                        marginRight: 8,
                        boxShadow: '0 0 8px 2px #f00',
                    } }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'red', fontWeight: 'bold' }, children: "Recording..." })] })) : ((0, jsx_runtime_1.jsx)("span", { style: { color: '#888' }, children: "Not Recording" })) }));
    // --- Real-Time Action List ---
    const playbackLog = playbackRedux && playbackRedux.log ? playbackRedux.log : [];
    const currentActionIdx = playbackRedux && typeof playbackRedux.current === 'number' ? playbackRedux.current : -1;
    const totalActions = playbackRedux && typeof playbackRedux.total === 'number' ? playbackRedux.total : 0;
    const currentAction = playbackRedux && playbackRedux.currentAction;
    const ActionList = () => ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("b", { children: "Action List" }), (0, jsx_runtime_1.jsx)("ul", { style: { maxHeight: 120, overflowY: 'auto', fontSize: 13, paddingLeft: 18, margin: 0 }, children: Array.from({ length: totalActions }).map((_, idx) => {
                    const logEntry = playbackLog.find(l => l.index === idx);
                    let status = 'pending';
                    let color = '#888';
                    let icon = '⏳';
                    if (logEntry) {
                        if (logEntry.type === 'success') {
                            status = 'success';
                            color = 'green';
                            icon = '✔️';
                        }
                        if (logEntry.type === 'error') {
                            status = 'error';
                            color = 'red';
                            icon = '❌';
                        }
                    }
                    else if (idx === currentActionIdx) {
                        status = 'in-progress';
                        color = '#2196f3';
                        icon = '▶️';
                    }
                    const action = playbackRedux && playbackRedux.log && playbackRedux.log[idx] ? playbackRedux.log[idx].action : (playbackRedux && playbackRedux.currentAction && idx === currentActionIdx ? playbackRedux.currentAction : null);
                    return ((0, jsx_runtime_1.jsxs)("li", { style: { color, fontWeight: idx === currentActionIdx ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: 6 }, children: [(0, jsx_runtime_1.jsx)("span", { children: icon }), (0, jsx_runtime_1.jsxs)("span", { children: ["Step ", idx + 1, ":"] }), (0, jsx_runtime_1.jsx)("span", { children: action ? action.type : '-' }), logEntry && logEntry.message && (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 11, color: '#888', marginLeft: 8 }, children: logEntry.message })] }, idx));
                }) })] }));
    // --- Keyboard Shortcuts ---
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                if (!isRecordingRedux) {
                    handleStartRecording();
                    setStatusMessage('Started recording (Ctrl+R)');
                }
                else {
                    handleReload();
                    setStatusMessage('Refreshed (Ctrl+R)');
                }
            }
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (isRecordingRedux) {
                    handleStopRecording();
                    setStatusMessage('Stopped recording (Ctrl+S)');
                }
            }
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                handleGoBack();
                setStatusMessage('Back (Alt+Left)');
            }
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                handleGoForward();
                setStatusMessage('Forward (Alt+Right)');
            }
            if (document.activeElement === inputRef.current && e.key === 'Enter') {
                e.preventDefault();
                handleLoadURL(e);
                setStatusMessage('Navigated (Enter)');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRecordingRedux, inputUrl]);
    // Ref for input to check Enter
    const inputRef = react_1.default.useRef();
    // --- Report Generation UI ---
    const handleGenerateReport = async (type) => {
        if (!selectedRun) {
            setStatusMessage('Select a run to generate a report.');
            return;
        }
        setLoading(true);
        setStatusMessage(`Generating ${type.toUpperCase()} report...`);
        try {
            let result;
            switch (type) {
                case 'html':
                    result = await window.reportsAPI.generateHTML(selectedRun.path);
                    break;
                case 'pdf':
                    result = await window.reportsAPI.generatePDF(selectedRun.path);
                    break;
                case 'csv':
                    result = await window.reportsAPI.generateCSV(selectedRun.path);
                    break;
                case 'json':
                    result = await window.reportsAPI.generateJSON(selectedRun.path);
                    break;
                default:
                    setStatusMessage('Unknown report type.');
                    setLoading(false);
                    return;
            }
            if (result && result.success) {
                setStatusMessage(`${type.toUpperCase()} report generated: ${result.path}`);
                // Try to open the file (works for HTML/PDF, may not for CSV/JSON)
                if (window.require) {
                    const { shell } = window.require('electron');
                    shell.openPath(result.path);
                }
            }
            else {
                setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };
    const navBtnStyle = {
        background: '#fff',
        color: '#4285F4',
        border: '1px solid #e0e0e0',
        borderRadius: 4,
        marginRight: 4,
        fontWeight: 500,
        transition: 'background 0.2s, box-shadow 0.2s',
        outline: 'none',
        cursor: 'pointer',
        padding: '4px 10px',
    };
    const navBtnStyleGreen = { ...navBtnStyle, color: '#34A853' };
    const navBtnStyleRed = { ...navBtnStyle, color: '#EA4335' };
    const goBtnStyle = {
        marginLeft: '4px',
        background: '#4285F4',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        fontWeight: 500,
        padding: '4px 12px',
        transition: 'background 0.2s, box-shadow 0.2s',
        outline: 'none',
        cursor: 'pointer',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '10px' }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { margin: '0 0 10px 0' }, children: "Headless Browser Automation" }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 10px 0' }, children: "Browser Navigation" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleLoadURL, style: { display: 'flex', marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: inputUrl, onChange: (e) => setInputUrl(e.target.value), placeholder: "Enter URL...", style: { flex: 1, padding: '8px', marginRight: '5px', borderRadius: '4px', border: '1px solid #ccc' } }), (0, jsx_runtime_1.jsx)("button", { type: "submit", style: { padding: '8px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Go" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '5px' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleGoBack, disabled: !canGoBack, style: {
                                    padding: '8px 12px',
                                    backgroundColor: canGoBack ? '#2196F3' : '#e0e0e0',
                                    color: canGoBack ? 'white' : '#757575',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: canGoBack ? 'pointer' : 'not-allowed'
                                }, children: "Back" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleGoForward, disabled: !canGoForward, style: {
                                    padding: '8px 12px',
                                    backgroundColor: canGoForward ? '#2196F3' : '#e0e0e0',
                                    color: canGoForward ? 'white' : '#757575',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: canGoForward ? 'pointer' : 'not-allowed'
                                }, children: "Forward" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleReload, style: { padding: '8px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Reload" }), (0, jsx_runtime_1.jsx)("button", { onClick: onHome, style: { padding: '8px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: "Home" })] })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '15px' }, children: (0, jsx_runtime_1.jsx)(FeedbackDemo_1.default, {}) }), (0, jsx_runtime_1.jsxs)("div", { className: "control-panel", style: { padding: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)(RecordingIndicator, {}), (0, jsx_runtime_1.jsx)(HelpIcon, {})] }), (0, jsx_runtime_1.jsx)(PlaybackProgress, { progress: playbackRedux }), (0, jsx_runtime_1.jsx)(ActionList, {}), (0, jsx_runtime_1.jsx)("div", { style: { borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' } }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8, fontWeight: 'bold', fontSize: 15, color: '#4285F4' }, children: "Automation" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '16px' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleGetNewPage, disabled: loading, title: "Open a new automation page", children: "New Automation Page" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: selector, onChange: (e) => setSelector(e.target.value), placeholder: "CSS Selector (e.g., #id, .class)", style: { padding: '4px', minWidth: '200px' }, disabled: loading, title: "Target element selector" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleClick, disabled: loading || !selector, title: "Click element by selector", children: "Click Selector" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleWaitForSelector, disabled: loading || !selector, title: "Wait for selector to appear", children: "Wait For Selector" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: textToType, onChange: (e) => setTextToType(e.target.value), placeholder: "Text to type", style: { padding: '4px', minWidth: '150px' }, disabled: loading, title: "Text to type into element" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleType, disabled: loading || !selector, title: "Type text into selector", children: "Type in Selector" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: screenshotPath, onChange: (e) => setScreenshotPath(e.target.value), placeholder: "Screenshot Path (e.g., shot.png)", style: { padding: '4px', minWidth: '200px' }, disabled: loading, title: "File path for screenshot" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleScreenshot, disabled: loading || !screenshotPath, title: "Take screenshot of current page", children: "Take Screenshot" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleAnalyzeElements, disabled: loading, style: { backgroundColor: '#e3f2fd' }, title: "Analyze elements on the page", children: "Analyze Elements" })] }), (0, jsx_runtime_1.jsx)("div", { style: { borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' } }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8, fontWeight: 'bold', fontSize: 15 }, children: "Recording" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }, children: !isRecordingRedux ? ((0, jsx_runtime_1.jsx)("button", { onClick: handleStartRecording, disabled: loading, style: { backgroundColor: '#dff0d8' }, title: "Start Recording (Ctrl+R)", children: "\u23FA\uFE0F Start Recording" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handlePauseRecording, disabled: loading, style: { backgroundColor: '#fcf8e3' }, title: "Pause Recording", children: "\u23F8\uFE0F Pause Recording" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleStopRecording, disabled: loading, style: { backgroundColor: '#f2dede' }, title: "Stop Recording (Ctrl+S)", children: "\u23F9\uFE0F Stop Recording" }), (0, jsx_runtime_1.jsx)("span", { style: { marginLeft: 'auto', color: 'red', fontWeight: 'bold' }, children: "\u25CF REC (Redux)" })] })) }), (0, jsx_runtime_1.jsx)("div", { style: { borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' } }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8, fontWeight: 'bold', fontSize: 15 }, children: "Results" }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8 }, children: (0, jsx_runtime_1.jsx)("b", { children: "Run History" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleLoadRunHistory('DemoSequence'), disabled: loading, style: { marginBottom: 8 }, children: "Load Demo Run History" }), (0, jsx_runtime_1.jsx)("ul", { style: { maxHeight: 100, overflowY: 'auto', fontSize: 13, paddingLeft: 18 }, children: runHistory.map((run, i) => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => handleSelectRun(run), style: { fontWeight: selectedRun === run ? 'bold' : 'normal' }, children: run.timestamp }) }, i))) }), selectedRun && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 10 }, children: [(0, jsx_runtime_1.jsxs)("b", { children: ["Results for ", selectedRun.timestamp] }), (0, jsx_runtime_1.jsx)("pre", { style: { background: '#fff', padding: 8, borderRadius: 4, maxHeight: 120, overflowY: 'auto' }, children: JSON.stringify(selectedResult, null, 2) }), (0, jsx_runtime_1.jsxs)("div", { style: { margin: '8px 0' }, children: [(0, jsx_runtime_1.jsx)("b", { children: "Generate Report:" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleGenerateReport('html'), style: { marginLeft: 8 }, children: "HTML" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleGenerateReport('pdf'), style: { marginLeft: 8 }, children: "PDF" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleGenerateReport('csv'), style: { marginLeft: 8 }, children: "CSV" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleGenerateReport('json'), style: { marginLeft: 8 }, children: "JSON" })] }), (0, jsx_runtime_1.jsx)("b", { children: "Screenshots:" }), (0, jsx_runtime_1.jsx)("ul", { children: selectedRun && selectedRun.path && window.require && (() => {
                                    const fs = window.require('fs');
                                    const path = window.require('path');
                                    try {
                                        const files = fs.readdirSync(selectedRun.path).filter(f => f.endsWith('.png'));
                                        return files.map((file, idx) => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => handleSelectScreenshot(selectedRun.path, file), children: file }) }, idx)));
                                    }
                                    catch (e) {
                                        return (0, jsx_runtime_1.jsx)("li", { children: "Error loading screenshots" });
                                    }
                                })() }), selectedScreenshot && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 10 }, children: [(0, jsx_runtime_1.jsx)("b", { children: "Screenshot Preview:" }), (0, jsx_runtime_1.jsx)("img", { src: `file://${selectedScreenshot}`, alt: "Screenshot", style: { maxWidth: 300, border: '1px solid #ccc' } })] }))] })), (0, jsx_runtime_1.jsx)("div", { style: { borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' } }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8, fontWeight: 'bold', fontSize: 15 }, children: "Sequences" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleLoadSequences, disabled: loading, style: { marginBottom: 8 }, children: "Load Sequences" }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newSequenceName, onChange: e => setNewSequenceName(e.target.value), placeholder: "New Sequence Name", style: { marginRight: 8 }, disabled: loading }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCreateSequence, disabled: loading || !newSequenceName, children: "Create Sequence" })] }), (0, jsx_runtime_1.jsx)("ul", { style: { maxHeight: 100, overflowY: 'auto', fontSize: 13, paddingLeft: 18 }, children: sequences.map((seq, i) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleSelectSequence(seq), style: { fontWeight: selectedSequence === seq ? 'bold' : 'normal' }, children: seq.name }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteSequence(seq.name), style: { marginLeft: 8, color: 'red' }, children: "Delete" })] }, i))) }), selectedSequence && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 10 }, children: [(0, jsx_runtime_1.jsx)("b", { children: "Selected Sequence:" }), (0, jsx_runtime_1.jsx)("pre", { style: { background: '#fff', padding: 8, borderRadius: 4, maxHeight: 120, overflowY: 'auto' }, children: JSON.stringify(selectedSequence, null, 2) })] })), sequenceLoadError && (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: sequenceLoadError }), (0, jsx_runtime_1.jsx)("div", { style: { borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' } }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8, fontWeight: 'bold', fontSize: 15 }, children: "Credentials" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleLoadCredentials, disabled: loading, style: { marginBottom: 8 }, children: "Load Credentials" }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8 }, children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: e => { e.preventDefault(); handleSaveCredential(); }, style: { display: 'inline' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: credKey, onChange: e => setCredKey(e.target.value), placeholder: "Credential Key", style: { marginRight: 8 }, disabled: loading }), (0, jsx_runtime_1.jsx)("input", { type: "password", value: credValue, onChange: e => setCredValue(e.target.value), placeholder: "Credential Value", style: { marginRight: 8 }, disabled: loading }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading || !credKey || !credValue, children: "Save Credential" })] }) }), (0, jsx_runtime_1.jsx)("ul", { style: { maxHeight: 100, overflowY: 'auto', fontSize: 13, paddingLeft: 18 }, children: credentials.map((cred, i) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleSelectCredential(cred), style: { fontWeight: selectedCred === cred ? 'bold' : 'normal' }, children: cred.account }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteCredential(cred.account), style: { marginLeft: 8, color: 'red' }, children: "Delete" })] }, i))) }), selectedCred && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 10 }, children: [(0, jsx_runtime_1.jsx)("b", { children: "Selected Credential:" }), (0, jsx_runtime_1.jsx)("pre", { style: { background: '#fff', padding: 8, borderRadius: 4, maxHeight: 120, overflowY: 'auto' }, children: JSON.stringify(selectedCred, null, 2) })] })), (0, jsx_runtime_1.jsx)("div", { style: { borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' } }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8, fontWeight: 'bold', fontSize: 15 }, children: "Scheduling" }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: scheduleSequenceName, onChange: e => setScheduleSequenceName(e.target.value), placeholder: "Sequence Name", style: { marginRight: 8 }, disabled: loading }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: scheduleCron, onChange: e => setScheduleCron(e.target.value), placeholder: "Cron Expression", style: { marginRight: 8 }, disabled: loading }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: scheduleOptions, onChange: e => setScheduleOptions(e.target.value), placeholder: "Options", style: { marginRight: 8 }, disabled: loading }), (0, jsx_runtime_1.jsx)("button", { onClick: handleScheduleSequence, disabled: loading, children: "Schedule Sequence" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleLoadSchedules, disabled: loading, style: { marginBottom: 8 }, children: "Load Schedules" }), (0, jsx_runtime_1.jsx)("ul", { style: { maxHeight: 100, overflowY: 'auto', fontSize: 13, paddingLeft: 18 }, children: Object.entries(schedules).map(([name, schedule]) => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => handleUnscheduleSequence(name), style: { marginLeft: 8, color: 'red' }, children: "Unschedule" }) }, name))) }), (0, jsx_runtime_1.jsx)(SequenceEditor, {})] })] }));
}
exports.default = ControlPanel;
//# sourceMappingURL=ControlPanel.js.map