import React from 'react';
import ToastContainer from './Toast';
import { GlobalLoadingIndicator, ComponentLoadingIndicator } from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import StatusDashboard from './StatusDashboard';
import { useDispatch } from 'react-redux';
import { FEEDBACK_ACTIONS } from '../store';

/**
 * FeedbackSystem - Root component that includes all feedback UI elements
 * This component should be added at the top level of your application
 */
const FeedbackSystem = () => {
  return (
    <>
      <GlobalLoadingIndicator />
      <ToastContainer />
      <StatusDashboard />
    </>
  );
};

/**
 * Utility functions to trigger feedback actions from anywhere in the app
 */
export const useFeedback = () => {
  const dispatch = useDispatch();
  
  return {
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - 'info', 'success', 'warning', or 'error'
     * @param {number} duration - How long to show the toast (in ms)
     */
    showToast: (message, type = 'info', duration = 3000) => {
      dispatch({
        type: FEEDBACK_ACTIONS.SHOW_TOAST,
        payload: {
          message,
          type,
          duration
        }
      });
    },
    
    /**
     * Set loading state for a component or global UI
     * @param {string} key - Key to identify this loading state
     */
    setLoading: (key = 'global') => {
      dispatch({
        type: FEEDBACK_ACTIONS.SET_LOADING,
        payload: { key }
      });
    },
    
    /**
     * Clear loading state
     * @param {string} key - Key of the loading state to clear
     */
    clearLoading: (key = 'global') => {
      dispatch({
        type: FEEDBACK_ACTIONS.CLEAR_LOADING,
        payload: { key }
      });
    },
    
    /**
     * Set an error state
     * @param {string} message - Error message to display
     * @param {string} details - Optional technical details 
     * @param {string} key - Key to identify this error
     */
    setError: (message, details = '', key = 'global') => {
      dispatch({
        type: FEEDBACK_ACTIONS.SET_ERROR,
        payload: {
          message,
          details,
          key
        }
      });
    },
    
    /**
     * Clear an error state
     * @param {string} key - Key of the error to clear
     */
    clearError: (key = 'global') => {
      dispatch({
        type: FEEDBACK_ACTIONS.CLEAR_ERROR,
        payload: { key }
      });
    },
    
    /**
     * Update the status of a long-running process
     * @param {string} id - Unique identifier for the process
     * @param {string} status - Status: 'running', 'completed', 'error', 'warning', 'paused'
     * @param {number} progress - Progress value (0-100)
     * @param {string} message - Status message to display
     */
    updateProcessStatus: (id, status, progress, message) => {
      dispatch({
        type: FEEDBACK_ACTIONS.UPDATE_PROCESS_STATUS,
        payload: {
          id,
          status,
          progress,
          message
        }
      });
    },
    
    /**
     * Remove a process from the status dashboard
     * @param {string} id - ID of the process to remove
     */
    removeProcess: (id) => {
      dispatch({
        type: FEEDBACK_ACTIONS.REMOVE_PROCESS,
        payload: id
      });
    }
  };
};

// Export components for individual use if needed
export {
  ToastContainer,
  GlobalLoadingIndicator,
  ComponentLoadingIndicator,
  ErrorMessage,
  StatusDashboard
};

export default FeedbackSystem; 