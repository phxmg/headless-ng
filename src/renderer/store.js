import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import logger from 'redux-logger';

// Action Types
export const RECORDING_ACTIONS = {
  START_RECORDING: 'START_RECORDING',
  PAUSE_RECORDING: 'PAUSE_RECORDING',
  STOP_RECORDING: 'STOP_RECORDING',
};

export const PLAYBACK_ACTIONS = {
  START_PLAYBACK: 'START_PLAYBACK',
  STOP_PLAYBACK: 'STOP_PLAYBACK',
  PLAYBACK_PROGRESS: 'PLAYBACK_PROGRESS',
  PLAYBACK_COMPLETE: 'PLAYBACK_COMPLETE',
  PLAYBACK_ERROR: 'PLAYBACK_ERROR',
};

// New Feedback Action Types
export const FEEDBACK_ACTIONS = {
  SHOW_TOAST: 'SHOW_TOAST',
  HIDE_TOAST: 'HIDE_TOAST',
  CLEAR_ALL_TOASTS: 'CLEAR_ALL_TOASTS',
  SET_LOADING: 'SET_LOADING',
  CLEAR_LOADING: 'CLEAR_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PROCESS_STATUS: 'UPDATE_PROCESS_STATUS',
  REMOVE_PROCESS: 'REMOVE_PROCESS',
};

// Reducers
const sequenceReducer = (state = { sequences: [], currentSequence: null }, action) => {
  switch (action.type) {
    // Add cases later
    default:
      return state;
  }
};

const recordingReducer = (state = { isRecording: false, recordedActions: [] }, action) => {
  switch (action.type) {
    case RECORDING_ACTIONS.START_RECORDING:
      return { ...state, isRecording: true };
    case RECORDING_ACTIONS.PAUSE_RECORDING:
      return { ...state, isRecording: false };
    case RECORDING_ACTIONS.STOP_RECORDING:
      return { ...state, isRecording: false };
    default:
      return state;
  }
};

const playbackReducer = (state = { isPlaying: false, progress: null }, action) => {
  switch (action.type) {
    case PLAYBACK_ACTIONS.START_PLAYBACK:
      return { ...state, isPlaying: true };
    case PLAYBACK_ACTIONS.STOP_PLAYBACK:
      return { ...state, isPlaying: false };
    case PLAYBACK_ACTIONS.PLAYBACK_PROGRESS:
      return { ...state, progress: action.payload };
    case PLAYBACK_ACTIONS.PLAYBACK_COMPLETE:
      return { ...state, isPlaying: false, progress: null };
    case PLAYBACK_ACTIONS.PLAYBACK_ERROR:
      return { ...state, isPlaying: false, error: action.payload };
    default:
      return state;
  }
};

// New Feedback Reducer
const feedbackReducer = (state = {
  toasts: [],
  isLoading: {},
  errors: {},
  processStatus: {}
}, action) => {
  switch (action.type) {
    case FEEDBACK_ACTIONS.SHOW_TOAST:
      // Add a toast with unique ID
      return {
        ...state,
        toasts: [...state.toasts, {
          id: action.payload.id || Date.now(),
          message: action.payload.message,
          type: action.payload.type || 'info',
          duration: action.payload.duration || 3000,
          timestamp: Date.now()
        }]
      };
    case FEEDBACK_ACTIONS.HIDE_TOAST:
      // Remove a specific toast by ID
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
    case FEEDBACK_ACTIONS.CLEAR_ALL_TOASTS:
      // Clear all toasts
      return {
        ...state,
        toasts: []
      };
    case FEEDBACK_ACTIONS.SET_LOADING:
      // Set loading state for a specific key
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [action.payload.key || 'global']: true
        }
      };
    case FEEDBACK_ACTIONS.CLEAR_LOADING:
      // Clear loading state for a specific key
      const newLoadingState = { ...state.isLoading };
      delete newLoadingState[action.payload.key || 'global'];
      return {
        ...state,
        isLoading: newLoadingState
      };
    case FEEDBACK_ACTIONS.SET_ERROR:
      // Set error for a specific key
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key || 'global']: {
            message: action.payload.message,
            details: action.payload.details,
            timestamp: Date.now()
          }
        }
      };
    case FEEDBACK_ACTIONS.CLEAR_ERROR:
      // Clear error for a specific key
      const newErrorsState = { ...state.errors };
      delete newErrorsState[action.payload.key || 'global'];
      return {
        ...state,
        errors: newErrorsState
      };
    case FEEDBACK_ACTIONS.UPDATE_PROCESS_STATUS:
      // Update status of a running process
      return {
        ...state,
        processStatus: {
          ...state.processStatus,
          [action.payload.id]: {
            status: action.payload.status,
            progress: action.payload.progress,
            message: action.payload.message,
            timestamp: Date.now()
          }
        }
      };
    case FEEDBACK_ACTIONS.REMOVE_PROCESS:
      // Remove a process from status tracking
      const newProcessStatus = { ...state.processStatus };
      delete newProcessStatus[action.payload];
      return {
        ...state,
        processStatus: newProcessStatus
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  sequences: sequenceReducer,
  recording: recordingReducer,
  playback: playbackReducer,
  feedback: feedbackReducer, // Add the new feedback reducer
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk, logger)
);

export default store; 