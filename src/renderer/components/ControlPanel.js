import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FeedbackDemo from './FeedbackDemo';

// Temporary HelpIcon to fix fatal error (must be in scope for all uses)
const HelpIcon = () => (
  <span title="Help" style={{ fontSize: 18, color: '#888', marginLeft: 8 }}>❓</span>
);

// No longer need props for basic nav, will use electronAPI directly
function ControlPanel({ onNavigate, onBack, onForward, onRefresh, onHome, url, canGoBack, canGoForward }) {
  const dispatch = useDispatch();
  const isRecordingRedux = useSelector(state => state.recording.isRecording);
  const playbackRedux = useSelector(state => state.playback);

  // State for navigation input
  const [inputUrl, setInputUrl] = useState(url || '');
  useEffect(() => { setInputUrl(url || ''); }, [url]);

  // State for automation inputs
  const [selector, setSelector] = useState('');
  const [textToType, setTextToType] = useState('');
  const [screenshotPath, setScreenshotPath] = useState('headless-screenshot.png'); // Default path

  // State for recording (local fallback for UI, but Redux is source of truth)
  const [isRecording, setIsRecording] = useState(false);

  // State for loading/feedback
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // State for playback progress
  const [playbackProgress, setPlaybackProgress] = useState(null);
  // State for element analysis
  const [elementAnalysis, setElementAnalysis] = useState(null);
  // State for results management
  const [runHistory, setRunHistory] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  // State for sequence management
  const [sequences, setSequences] = useState([]);
  const [newSequenceName, setNewSequenceName] = useState('');
  const [sequenceLoadError, setSequenceLoadError] = useState('');
  const [selectedSequence, setSelectedSequence] = useState(null);
  // State for credential management
  const [credentials, setCredentials] = useState([]);
  const [credKey, setCredKey] = useState('');
  const [credValue, setCredValue] = useState('');
  const [selectedCred, setSelectedCred] = useState(null);
  // State for scheduling management
  const [schedules, setSchedules] = useState({});
  const [scheduleSequenceName, setScheduleSequenceName] = useState('');
  const [scheduleCron, setScheduleCron] = useState('');
  const [scheduleOptions, setScheduleOptions] = useState('');

  // --- Drag-and-Drop Sequence Editor ---
  const [editorActions, setEditorActions] = useState([]);
  useEffect(() => {
    if (selectedSequence && selectedSequence.actions) {
      setEditorActions([...selectedSequence.actions]);
    } else {
      setEditorActions([
        { type: 'navigate', url: 'https://example.com' },
        { type: 'click', selector: '#login' },
        { type: 'type', selector: '#username', text: 'user' },
      ]);
    }
  }, [selectedSequence]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(editorActions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setEditorActions(reordered);
    // TODO: Optionally update sequence in backend/store
  };

  const SequenceEditor = () => (
    <div style={{ marginTop: 20, padding: 10, border: '1px solid #bdbdbd', borderRadius: 6, background: '#f5f5f5' }}>
      <b>Sequence Editor (Drag & Drop)</b>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sequence-actions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: 60 }}>
              {editorActions.map((action, idx) => (
                <Draggable key={idx} draggableId={`action-${idx}`} index={idx}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: 'none',
                        padding: 8,
                        margin: '0 0 8px 0',
                        background: snapshot.isDragging ? '#bbdefb' : '#fff',
                        border: '1px solid #90caf9',
                        borderRadius: 4,
                        ...provided.draggableProps.style,
                      }}
                    >
                      <span style={{ fontWeight: 'bold', marginRight: 8 }}>#{idx + 1}</span>
                      <span>{action.type}</span>
                      {action.url && <span style={{ marginLeft: 8, color: '#888' }}>{action.url}</span>}
                      {action.selector && <span style={{ marginLeft: 8, color: '#888' }}>{action.selector}</span>}
                      {action.text && <span style={{ marginLeft: 8, color: '#888' }}>{action.text}</span>}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );

  // Clear status message after a delay
  useEffect(() => {
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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
    if (onNavigate) onNavigate(inputUrl);
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCreateSequence = async () => {
    if (!newSequenceName) return;
    setLoading(true);
    setStatusMessage('Saving sequence...');
    try {
      const result = await window.sequencesAPI.saveSequence({ name: newSequenceName, actions: [] });
      if (result && result.success) {
        setStatusMessage('Sequence saved.');
        setNewSequenceName('');
        handleLoadSequences();
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleSaveCredential = async () => {
    if (!credKey || !credValue) return;
    setLoading(true);
    setStatusMessage('Saving credential...');
    try {
      const result = await window.credentialsAPI.saveCredential(credKey, credValue);
      if (result && result.success) {
        setStatusMessage('Credential saved.');
        setCredKey('');
        setCredValue('');
        handleLoadCredentials();
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  // --- Playback Progress UI ---
  function PlaybackProgress({ progress }) {
    if (!progress) return null;
    const { percentage, current, total, status, currentAction, executionTimeMs } = progress;
    return (
      <div style={{ margin: '16px 0 12px 0', padding: 10, border: '2px solid #90caf9', borderRadius: 8, background: '#e3f2fd', boxShadow: '0 2px 8px #e3f2fd' }}>
        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <b>Playback Progress</b>
          <span style={{ fontSize: 13, color: '#1976d2' }}>Step {current + 1} / {total}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ flex: 1, background: '#e0e0e0', borderRadius: 6, height: 18, overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: `${percentage}%`, background: '#1976d2', height: '100%', borderRadius: 6, transition: 'width 0.3s' }} />
            <span style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', color: '#fff', fontWeight: 'bold', fontSize: 13 }}>{percentage}%</span>
          </div>
        </div>
        <div style={{ marginTop: 4, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
          <span>Status: <b style={{ color: status === 'error' ? 'red' : status === 'finished' ? 'green' : '#1976d2' }}>{status}</b></span>
          <span>Elapsed: {(executionTimeMs / 1000).toFixed(1)}s</span>
          <span>Current: <code>{currentAction ? currentAction.type : '-'}</code></span>
        </div>
      </div>
    );
  }

  // --- Recording State Visual Indicator ---
  const RecordingIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
      {isRecordingRedux ? (
        <>
          <span style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'red',
            marginRight: 8,
            boxShadow: '0 0 8px 2px #f00',
          }} />
          <span style={{ color: 'red', fontWeight: 'bold' }}>Recording...</span>
        </>
      ) : (
        <span style={{ color: '#888' }}>Not Recording</span>
      )}
    </div>
  );

  // --- Real-Time Action List ---
  const playbackLog = playbackRedux && playbackRedux.log ? playbackRedux.log : [];
  const currentActionIdx = playbackRedux && typeof playbackRedux.current === 'number' ? playbackRedux.current : -1;
  const totalActions = playbackRedux && typeof playbackRedux.total === 'number' ? playbackRedux.total : 0;
  const currentAction = playbackRedux && playbackRedux.currentAction;

  const ActionList = () => (
    <div style={{ marginBottom: 16 }}>
      <b>Action List</b>
      <ul style={{ maxHeight: 120, overflowY: 'auto', fontSize: 13, paddingLeft: 18, margin: 0 }}>
        {Array.from({ length: totalActions }).map((_, idx) => {
          const logEntry = playbackLog.find(l => l.index === idx);
          let status = 'pending';
          let color = '#888';
          let icon = '⏳';
          if (logEntry) {
            if (logEntry.type === 'success') { status = 'success'; color = 'green'; icon = '✔️'; }
            if (logEntry.type === 'error') { status = 'error'; color = 'red'; icon = '❌'; }
          } else if (idx === currentActionIdx) {
            status = 'in-progress'; color = '#2196f3'; icon = '▶️';
          }
          const action = playbackRedux && playbackRedux.log && playbackRedux.log[idx] ? playbackRedux.log[idx].action : (playbackRedux && playbackRedux.currentAction && idx === currentActionIdx ? playbackRedux.currentAction : null);
          return (
            <li key={idx} style={{ color, fontWeight: idx === currentActionIdx ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{icon}</span>
              <span>Step {idx + 1}:</span>
              <span>{action ? action.type : '-'}</span>
              {logEntry && logEntry.message && <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{logEntry.message}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        if (!isRecordingRedux) {
          handleStartRecording();
          setStatusMessage('Started recording (Ctrl+R)');
        } else {
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
  const inputRef = React.useRef();

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
      } else {
        setStatusMessage(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
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

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      {/* Header */}
      <h2 style={{ margin: '0 0 10px 0' }}>Headless Browser Automation</h2>
      
      {/* Navigation Section */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Browser Navigation</h3>
        <form onSubmit={handleLoadURL} style={{ display: 'flex', marginBottom: '10px' }}>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL..."
            style={{ flex: 1, padding: '8px', marginRight: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            type="submit" 
            style={{ padding: '8px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Go
          </button>
        </form>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={handleGoBack} 
            disabled={!canGoBack} 
            style={{ 
              padding: '8px 12px', 
              backgroundColor: canGoBack ? '#2196F3' : '#e0e0e0', 
              color: canGoBack ? 'white' : '#757575', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: canGoBack ? 'pointer' : 'not-allowed' 
            }}
          >
            Back
          </button>
          <button 
            onClick={handleGoForward} 
            disabled={!canGoForward} 
            style={{ 
              padding: '8px 12px', 
              backgroundColor: canGoForward ? '#2196F3' : '#e0e0e0', 
              color: canGoForward ? 'white' : '#757575', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: canGoForward ? 'pointer' : 'not-allowed' 
            }}
          >
            Forward
          </button>
          <button 
            onClick={handleReload} 
            style={{ padding: '8px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reload
          </button>
          <button 
            onClick={onHome} 
            style={{ padding: '8px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Home
          </button>
        </div>
      </div>
      
      {/* FeedbackDemo Component */}
      <div style={{ marginBottom: '15px' }}>
        <FeedbackDemo />
      </div>
      
      {/* Rest of the component remains unchanged */}
      <div className="control-panel" style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <RecordingIndicator />
          <HelpIcon />
        </div>
        <PlaybackProgress progress={playbackRedux} />
        <ActionList />
        <div style={{ borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' }} />

        <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 15, color: '#4285F4' }}>Automation</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
           <button onClick={handleGetNewPage} disabled={loading} title="Open a new automation page">New Automation Page</button>
           <input
               type="text"
               value={selector}
               onChange={(e) => setSelector(e.target.value)}
               placeholder="CSS Selector (e.g., #id, .class)"
               style={{ padding: '4px', minWidth: '200px' }}
               disabled={loading}
               title="Target element selector"
           />
           <button onClick={handleClick} disabled={loading || !selector} title="Click element by selector">Click Selector</button>
           <button onClick={handleWaitForSelector} disabled={loading || !selector} title="Wait for selector to appear">Wait For Selector</button>
           <input
               type="text"
               value={textToType}
               onChange={(e) => setTextToType(e.target.value)}
               placeholder="Text to type"
               style={{ padding: '4px', minWidth: '150px' }}
               disabled={loading}
               title="Text to type into element"
           />
           <button onClick={handleType} disabled={loading || !selector} title="Type text into selector">Type in Selector</button>
           <input
               type="text"
               value={screenshotPath}
               onChange={(e) => setScreenshotPath(e.target.value)}
               placeholder="Screenshot Path (e.g., shot.png)"
               style={{ padding: '4px', minWidth: '200px' }}
               disabled={loading}
               title="File path for screenshot"
           />
           <button onClick={handleScreenshot} disabled={loading || !screenshotPath} title="Take screenshot of current page">Take Screenshot</button>
           <button onClick={handleAnalyzeElements} disabled={loading} style={{ backgroundColor: '#e3f2fd' }} title="Analyze elements on the page">Analyze Elements</button>
        </div>

        <div style={{ borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' }} />
        <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 15 }}>Recording</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
          {!isRecordingRedux ? (
            <button onClick={handleStartRecording} disabled={loading} style={{ backgroundColor: '#dff0d8' }} title="Start Recording (Ctrl+R)">
              ⏺️ Start Recording
            </button>
          ) : (
            <>
              <button onClick={handlePauseRecording} disabled={loading} style={{ backgroundColor: '#fcf8e3' }} title="Pause Recording">
                ⏸️ Pause Recording
              </button>
              <button onClick={handleStopRecording} disabled={loading} style={{ backgroundColor: '#f2dede' }} title="Stop Recording (Ctrl+S)">
                ⏹️ Stop Recording
              </button>
              <span style={{ marginLeft: 'auto', color: 'red', fontWeight: 'bold' }}>● REC (Redux)</span>
            </>
          )}
        </div>

        {/* Results Management UI */}
        <div style={{ borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' }} />
        <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 15 }}>Results</div>
        <div style={{ marginBottom: 8 }}><b>Run History</b></div>
        <button onClick={() => handleLoadRunHistory('DemoSequence')} disabled={loading} style={{ marginBottom: 8 }}>Load Demo Run History</button>
        <ul style={{ maxHeight: 100, overflowY: 'auto', fontSize: 13, paddingLeft: 18 }}>
          {runHistory.map((run, i) => (
            <li key={i}>
              <button onClick={() => handleSelectRun(run)} style={{ fontWeight: selectedRun === run ? 'bold' : 'normal' }}>
                {run.timestamp}
              </button>
            </li>
          ))}
        </ul>
        {selectedRun && (
          <div style={{ marginTop: 10 }}>
            <b>Results for {selectedRun.timestamp}</b>
            <pre style={{ background: '#fff', padding: 8, borderRadius: 4, maxHeight: 120, overflowY: 'auto' }}>{JSON.stringify(selectedResult, null, 2)}</pre>
            <div style={{ margin: '8px 0' }}>
              <b>Generate Report:</b>
              <button onClick={() => handleGenerateReport('html')} style={{ marginLeft: 8 }}>HTML</button>
              <button onClick={() => handleGenerateReport('pdf')} style={{ marginLeft: 8 }}>PDF</button>
              <button onClick={() => handleGenerateReport('csv')} style={{ marginLeft: 8 }}>CSV</button>
              <button onClick={() => handleGenerateReport('json')} style={{ marginLeft: 8 }}>JSON</button>
            </div>
            <b>Screenshots:</b>
            <ul>
              {selectedRun && selectedRun.path && window.require && (() => {
                const fs = window.require('fs');
                const path = window.require('path');
                try {
                  const files = fs.readdirSync(selectedRun.path).filter(f => f.endsWith('.png'));
                  return files.map((file, idx) => (
                    <li key={idx}>
                      <button onClick={() => handleSelectScreenshot(selectedRun.path, file)}>{file}</button>
                    </li>
                  ));
                } catch (e) { return <li>Error loading screenshots</li>; }
              })()}
            </ul>
            {selectedScreenshot && (
              <div style={{ marginTop: 10 }}>
                <b>Screenshot Preview:</b>
                <img src={`file://${selectedScreenshot}`} alt="Screenshot" style={{ maxWidth: 300, border: '1px solid #ccc' }} />
              </div>
            )}
          </div>
        )}

        {/* Sequence Management UI */}
        <div style={{ borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' }} />
        <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 15 }}>Sequences</div>
        <button onClick={handleLoadSequences} disabled={loading} style={{ marginBottom: 8 }}>Load Sequences</button>
        <div style={{ marginBottom: 8 }}>
          <input
            type="text"
            value={newSequenceName}
            onChange={e => setNewSequenceName(e.target.value)}
            placeholder="New Sequence Name"
            style={{ marginRight: 8 }}
            disabled={loading}
          />
          <button onClick={handleCreateSequence} disabled={loading || !newSequenceName}>Create Sequence</button>
        </div>
        <ul style={{ maxHeight: 100, overflowY: 'auto', fontSize: 13, paddingLeft: 18 }}>
          {sequences.map((seq, i) => (
            <li key={i}>
              <button onClick={() => handleSelectSequence(seq)} style={{ fontWeight: selectedSequence === seq ? 'bold' : 'normal' }}>
                {seq.name}
              </button>
              <button onClick={() => handleDeleteSequence(seq.name)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
            </li>
          ))}
        </ul>
        {selectedSequence && (
          <div style={{ marginTop: 10 }}>
            <b>Selected Sequence:</b>
            <pre style={{ background: '#fff', padding: 8, borderRadius: 4, maxHeight: 120, overflowY: 'auto' }}>{JSON.stringify(selectedSequence, null, 2)}</pre>
          </div>
        )}
        {sequenceLoadError && <div style={{ color: 'red' }}>{sequenceLoadError}</div>}

        {/* Credential Management UI */}
        <div style={{ borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' }} />
        <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 15 }}>Credentials</div>
        <button onClick={handleLoadCredentials} disabled={loading} style={{ marginBottom: 8 }}>Load Credentials</button>
        <div style={{ marginBottom: 8 }}>
          <form onSubmit={e => { e.preventDefault(); handleSaveCredential(); }} style={{ display: 'inline' }}>
            <input
              type="text"
              value={credKey}
              onChange={e => setCredKey(e.target.value)}
              placeholder="Credential Key"
              style={{ marginRight: 8 }}
              disabled={loading}
            />
            <input
              type="password"
              value={credValue}
              onChange={e => setCredValue(e.target.value)}
              placeholder="Credential Value"
              style={{ marginRight: 8 }}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !credKey || !credValue}>Save Credential</button>
          </form>
        </div>
        <ul style={{ maxHeight: 100, overflowY: 'auto', fontSize: 13, paddingLeft: 18 }}>
          {credentials.map((cred, i) => (
            <li key={i}>
              <button onClick={() => handleSelectCredential(cred)} style={{ fontWeight: selectedCred === cred ? 'bold' : 'normal' }}>
                {cred.account}
              </button>
              <button onClick={() => handleDeleteCredential(cred.account)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
            </li>
          ))}
        </ul>
        {selectedCred && (
          <div style={{ marginTop: 10 }}>
            <b>Selected Credential:</b>
            <pre style={{ background: '#fff', padding: 8, borderRadius: 4, maxHeight: 120, overflowY: 'auto' }}>{JSON.stringify(selectedCred, null, 2)}</pre>
          </div>
        )}

        {/* Scheduling Management UI */}
        <div style={{ borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' }} />
        <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 15 }}>Scheduling</div>
        <div style={{ marginBottom: 8 }}>
          <input
            type="text"
            value={scheduleSequenceName}
            onChange={e => setScheduleSequenceName(e.target.value)}
            placeholder="Sequence Name"
            style={{ marginRight: 8 }}
            disabled={loading}
          />
          <input
            type="text"
            value={scheduleCron}
            onChange={e => setScheduleCron(e.target.value)}
            placeholder="Cron Expression"
            style={{ marginRight: 8 }}
            disabled={loading}
          />
          <input
            type="text"
            value={scheduleOptions}
            onChange={e => setScheduleOptions(e.target.value)}
            placeholder="Options"
            style={{ marginRight: 8 }}
            disabled={loading}
          />
          <button onClick={handleScheduleSequence} disabled={loading}>Schedule Sequence</button>
        </div>
        <button onClick={handleLoadSchedules} disabled={loading} style={{ marginBottom: 8 }}>Load Schedules</button>
        <ul style={{ maxHeight: 100, overflowY: 'auto', fontSize: 13, paddingLeft: 18 }}>
          {Object.entries(schedules).map(([name, schedule]) => (
            <li key={name}>
              <button onClick={() => handleUnscheduleSequence(name)} style={{ marginLeft: 8, color: 'red' }}>Unschedule</button>
            </li>
          ))}
        </ul>

        <SequenceEditor />
      </div>
    </div>
  );
}

export default ControlPanel; 