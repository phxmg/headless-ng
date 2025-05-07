import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FEEDBACK_ACTIONS } from '../store';

const Toast = ({ id, message, type, duration }) => {
  const [exit, setExit] = useState(false);
  const [width, setWidth] = useState(0);
  const [intervalID, setIntervalID] = useState(null);
  const dispatch = useDispatch();

  const handleClose = () => {
    setExit(true);
    setTimeout(() => {
      dispatch({ type: FEEDBACK_ACTIONS.HIDE_TOAST, payload: id });
    }, 300); // match exit animation duration
  };

  useEffect(() => {
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

  return (
    <div className={`toast ${type} ${exit ? 'exit' : ''}`}>
      <div className="toast-content">
        {message}
      </div>
      <button className="toast-close" onClick={handleClose}>
        ×
      </button>
      {duration && (
        <div 
          className="toast-progress" 
          style={{ width: `${width}%` }}
        />
      )}
    </div>
  );
};

const ToastContainer = () => {
  const toasts = useSelector(state => state.feedback.toasts);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export default ToastContainer; 