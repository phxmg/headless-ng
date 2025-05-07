import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FEEDBACK_ACTIONS } from '../store';

/**
 * ErrorMessage - Shows an error message with optional actions for recovery
 * @param {Object} props - Component props
 * @param {string} props.errorKey - Key for the specific error in Redux
 * @param {Object} props.error - Direct error object if not using Redux
 * @param {Function} props.onClose - Custom close handler
 * @param {Array} props.actions - Array of recovery actions [{ label, handler }]
 */
const ErrorMessage = ({ 
  errorKey = 'global', 
  error: directError, 
  onClose, 
  actions = [] 
}) => {
  const dispatch = useDispatch();
  const reduxError = useSelector(state => state.feedback.errors[errorKey]);
  
  const error = directError || reduxError;
  
  if (!error) return null;
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      dispatch({ 
        type: FEEDBACK_ACTIONS.CLEAR_ERROR, 
        payload: { key: errorKey } 
      });
    }
  };
  
  return (
    <div className="error-message">
      <div className="error-message-header">
        <h4 className="error-message-title">Error</h4>
        <button className="error-message-close" onClick={handleClose}>×</button>
      </div>
      <p className="error-message-body">{error.message}</p>
      {error.details && (
        <details>
          <summary>Details</summary>
          <pre>{error.details}</pre>
        </details>
      )}
      {(actions && actions.length > 0) && (
        <div className="error-message-actions">
          {actions.map((action, index) => (
            <button 
              key={index} 
              className="error-message-action" 
              onClick={action.handler}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ErrorMessage; 