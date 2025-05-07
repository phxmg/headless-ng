import React from 'react';
import ControlPanel from './components/ControlPanel';
import SplitPane from 'react-split-pane';
import BrowserView from './components/BrowserView';
import Header from './components/Header';
import FeedbackSystem, { useFeedback } from './components/FeedbackSystem';

function App() {
  console.log('window.electronAPI:', window.electronAPI); // Debug: verify preload exposure
  const [browserUrl, setBrowserUrl] = React.useState('https://media.getitfree.us');
  const [isLoading, setIsLoading] = React.useState(false);
  const [canGoBack, setCanGoBack] = React.useState(false);
  const [canGoForward, setCanGoForward] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Use the feedback system
  const feedback = useFeedback();

  // Handle navigation state updates from main process
  React.useEffect(() => {
    if (window.electronAPI) {
      const handleNavigationStateUpdate = (_, state) => {
        if (state.currentURL !== browserUrl) {
          setBrowserUrl(state.currentURL);
        }
        setCanGoBack(state.canGoBack);
        setCanGoForward(state.canGoForward);
        setIsLoading(state.isLoading);
        
        // Update loading status in the feedback system
        if (state.isLoading) {
          feedback.setLoading('navigation');
        } else {
          feedback.clearLoading('navigation');
        }
        
        if (state.lastError) {
          setError(state.lastError);
          feedback.setError(state.lastError.message, state.lastError.details || state.lastError.url, 'navigation');
        }
      };

      // Listen for navigation state updates from main process
      window.electronAPI.onNavigationStateUpdate(handleNavigationStateUpdate);

      // Cleanup
      return () => {
        // Unfortunately Electron doesn't provide a way to directly remove listeners
        // Ideally we would clean up here
      };
    }
  }, [browserUrl, feedback]);

  // Navigation handlers wired to electronAPI
  const handleNavigate = async (url) => {
    if (window.electronAPI && url) {
      setError(null); // Clear any existing errors
      feedback.clearError('navigation'); // Clear any existing navigation errors
      setIsLoading(true); // Start loading indicator
      feedback.setLoading('navigation'); // Set loading in feedback system
      feedback.showToast(`Navigating to ${url}`, 'info'); // Show navigation toast
      
      const result = await window.electronAPI.loadURL(url);
      if (!result.success) {
        console.error('Navigation failed:', result.error);
        const errorMsg = result.error || 'Failed to navigate to the requested URL';
        setError({
          message: errorMsg,
          url: url
        });
        feedback.setError(errorMsg, `URL: ${url}`, 'navigation');
        feedback.showToast(`Navigation failed: ${errorMsg}`, 'error');
        setIsLoading(false);
        feedback.clearLoading('navigation');
      }
      // Actual URL change and loading state will be handled via events
    }
  };

  const handleBack = async () => {
    if (window.electronAPI && canGoBack) {
      feedback.setLoading('navigation');
      await window.electronAPI.goBack();
    }
  };

  const handleForward = async () => {
    if (window.electronAPI && canGoForward) {
      feedback.setLoading('navigation');
      await window.electronAPI.goForward();
    }
  };

  const handleRefresh = async () => {
    if (window.electronAPI) {
      feedback.setLoading('navigation');
      feedback.showToast('Refreshing page', 'info');
      await window.electronAPI.reload();
    }
  };

  const handleStop = async () => {
    if (window.electronAPI && isLoading) {
      await window.electronAPI.stop();
      feedback.clearLoading('navigation');
      feedback.showToast('Navigation stopped', 'warning');
    }
  };

  const handleHome = () => {
    handleNavigate('https://media.getitfree.us');
  };

  // Callbacks from BrowserView
  const handleDidNavigate = (url) => {
    setBrowserUrl(url);
    feedback.showToast(`Navigated to ${url}`, 'success');
    feedback.clearLoading('navigation');
  };

  const handleDidFailLoad = (errorInfo) => {
    setError(errorInfo);
    setIsLoading(false);
    feedback.clearLoading('navigation');
    feedback.setError(errorInfo.message || 'Page failed to load', errorInfo.url || '', 'navigation');
  };

  const handleLoading = (loading) => {
    setIsLoading(loading);
    if (loading) {
      feedback.setLoading('navigation');
    } else {
      feedback.clearLoading('navigation');
    }
  };

  const handleNavigationStateChange = (state) => {
    setCanGoBack(state.canGoBack);
    setCanGoForward(state.canGoForward);
    if (state.currentURL !== browserUrl) {
      setBrowserUrl(state.currentURL);
    }
    setIsLoading(state.isLoading);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%)' }}>
      <FeedbackSystem />
      <Header />
      <div style={{ flex: 1, minHeight: 0 }}>
        <SplitPane split="vertical" minSize={300} defaultSize={400} style={{ position: 'relative', height: '100%' }}>
          <div className="control-panel" style={{ height: '100%' }}>
            <ControlPanel
              onNavigate={handleNavigate}
              onBack={handleBack}
              onForward={handleForward}
              onRefresh={handleRefresh}
              onStop={handleStop}
              onHome={handleHome}
              url={browserUrl}
              canGoBack={canGoBack}
              canGoForward={canGoForward}
              isLoading={isLoading}
            />
          </div>
          <div className="browser-view" style={{ height: '100%' }}>
            <BrowserView
              url={browserUrl}
              onDidNavigate={handleDidNavigate}
              onDidFailLoad={handleDidFailLoad}
              onLoading={handleLoading}
              onNavigationStateChange={handleNavigationStateChange}
            />
          </div>
        </SplitPane>
      </div>
    </div>
  );
}

export default App; 