import React from 'react';
import { useFeedback, ComponentLoadingIndicator } from './FeedbackSystem';

/**
 * FeedbackDemo - A component to showcase and test all the feedback system features
 */
const FeedbackDemo = () => {
  const feedback = useFeedback();
  const [componentLoading, setComponentLoading] = React.useState(false);
  
  // Demo function for showing different types of toasts
  const showToastDemo = (type) => {
    const messages = {
      info: 'This is an information message',
      success: 'Operation completed successfully!',
      warning: 'This action may have consequences',
      error: 'An error occurred during the operation'
    };
    
    feedback.showToast(messages[type], type);
  };
  
  // Demo function for toggling loading indicators
  const toggleGlobalLoading = () => {
    if (document.querySelector('.global-loading')) {
      feedback.clearLoading('global');
    } else {
      feedback.setLoading('global');
      // Auto-clear after 3 seconds
      setTimeout(() => feedback.clearLoading('global'), 3000);
    }
  };
  
  const toggleComponentLoading = () => {
    setComponentLoading(!componentLoading);
    if (!componentLoading) {
      // Auto-clear after 3 seconds
      setTimeout(() => setComponentLoading(false), 3000);
    }
  };
  
  // Demo function for showing error messages
  const showErrorDemo = () => {
    feedback.setError(
      'Failed to connect to server', 
      'Error: Connection refused (ECONNREFUSED)',
      'demo'
    );
  };
  
  const clearErrorDemo = () => {
    feedback.clearError('demo');
  };
  
  // Demo function for updating process status
  const startProcessDemo = () => {
    // Start a demo process
    feedback.updateProcessStatus(
      'demo-process',
      'running',
      0,
      'Starting demo process...'
    );
    
    // Update progress every 500ms
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      
      if (progress < 100) {
        feedback.updateProcessStatus(
          'demo-process',
          'running',
          progress,
          `Processing... ${progress}% complete`
        );
      } else {
        // Complete the process
        feedback.updateProcessStatus(
          'demo-process',
          'completed',
          100,
          'Demo process completed successfully'
        );
        clearInterval(interval);
      }
    }, 500);
  };
  
  return (
    <div className="feedback-demo" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <h3>Feedback System Demo</h3>
      
      <section style={{ marginBottom: '20px' }}>
        <h4>Toast Notifications</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => showToastDemo('info')} style={{ padding: '8px 12px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Info Toast
          </button>
          <button onClick={() => showToastDemo('success')} style={{ padding: '8px 12px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Success Toast
          </button>
          <button onClick={() => showToastDemo('warning')} style={{ padding: '8px 12px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Warning Toast
          </button>
          <button onClick={() => showToastDemo('error')} style={{ padding: '8px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Error Toast
          </button>
        </div>
      </section>
      
      <section style={{ marginBottom: '20px' }}>
        <h4>Loading Indicators</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={toggleGlobalLoading} style={{ padding: '8px 12px', backgroundColor: '#673ab7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Toggle Global Loading
          </button>
          <button onClick={toggleComponentLoading} style={{ padding: '8px 12px', backgroundColor: '#673ab7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Toggle Component Loading
          </button>
        </div>
        
        <ComponentLoadingIndicator isLoading={componentLoading}>
          <div style={{ padding: '20px', border: '1px dashed #ccc', backgroundColor: '#f9f9f9', textAlign: 'center' }}>
            This is a component with a loading indicator
          </div>
        </ComponentLoadingIndicator>
      </section>
      
      <section style={{ marginBottom: '20px' }}>
        <h4>Error Messages</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={showErrorDemo} style={{ padding: '8px 12px', backgroundColor: '#e91e63', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Show Error
          </button>
          <button onClick={clearErrorDemo} style={{ padding: '8px 12px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Clear Error
          </button>
        </div>
      </section>
      
      <section>
        <h4>Process Status</h4>
        <button onClick={startProcessDemo} style={{ padding: '8px 12px', backgroundColor: '#009688', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Start Demo Process
        </button>
      </section>
    </div>
  );
};

export default FeedbackDemo; 