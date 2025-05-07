import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FEEDBACK_ACTIONS } from '../store';

/**
 * ProcessItem - Individual process item in the status dashboard
 */
const ProcessItem = ({ id, status, progress, message, timestamp }) => {
  const dispatch = useDispatch();
  
  const handleRemove = () => {
    dispatch({ type: FEEDBACK_ACTIONS.REMOVE_PROCESS, payload: id });
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
  
  return (
    <div className="status-process">
      <div className="status-process-icon">
        {statusIcons[status] || '🔄'}
      </div>
      <div className="status-process-details">
        <h4 className="status-process-title">
          {id}
          <small style={{ marginLeft: '10px', fontWeight: 'normal' }}>{time}</small>
        </h4>
        <p className="status-process-message">{message}</p>
        {progress !== undefined && (
          <div className="status-process-progress">
            <div 
              className="status-process-progress-bar"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        )}
      </div>
      {status === 'completed' && (
        <button 
          onClick={handleRemove}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            opacity: 0.5,
            padding: '5px'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

/**
 * StatusDashboard - Shows the status of all ongoing processes
 */
const StatusDashboard = ({ title = 'Running Processes' }) => {
  const processes = useSelector(state => state.feedback.processStatus);
  const processEntries = Object.entries(processes);
  
  if (processEntries.length === 0) return null;
  
  return (
    <div className="status-dashboard">
      <div className="status-dashboard-header">
        <h3 className="status-dashboard-title">{title}</h3>
      </div>
      {processEntries.map(([id, process]) => (
        <ProcessItem
          key={id}
          id={id}
          status={process.status}
          progress={process.progress}
          message={process.message}
          timestamp={process.timestamp}
        />
      ))}
    </div>
  );
};

export default StatusDashboard; 