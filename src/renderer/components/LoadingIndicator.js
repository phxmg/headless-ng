import React from 'react';
import { useSelector } from 'react-redux';

/**
 * GlobalLoadingIndicator - Shows a loading bar at the top of the screen for app-wide operations
 */
export const GlobalLoadingIndicator = () => {
  const isLoading = useSelector(state => state.feedback.isLoading.global);
  
  if (!isLoading) return null;
  
  return <div className="global-loading" />;
};

/**
 * ComponentLoadingIndicator - Wraps a component and shows a loading overlay when in loading state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.loadingKey - Key for this specific loading state in Redux
 * @param {boolean} props.isLoading - Optional direct loading state (if not using Redux)
 */
export const ComponentLoadingIndicator = ({ children, loadingKey, isLoading: directLoading }) => {
  const reduxLoading = useSelector(state => 
    loadingKey ? state.feedback.isLoading[loadingKey] : false
  );
  
  const isComponentLoading = directLoading || reduxLoading;
  
  return (
    <div className={isComponentLoading ? 'component-loading' : ''}>
      {children}
    </div>
  );
};

export default {
  GlobalLoadingIndicator,
  ComponentLoadingIndicator
}; 