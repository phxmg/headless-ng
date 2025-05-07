import React, { useRef, useEffect, useState } from 'react';

const BrowserView = ({ url, onDidNavigate, onDidFailLoad, onLoading, onNavigationStateChange, style }) => {
  const webviewRef = useRef();
  const [errorData, setErrorData] = useState(null);
  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    // Handler for dom-ready event
    const handleDomReady = () => {
      setDomReady(true);
      // Set initial URL if provided and different from current
      if (url && webview.getURL && webview.getURL() !== url) {
        webview.src = url;
      }
      // Send initial navigation state
      if (window.electronAPI && webview.getURL) {
        window.electronAPI.setCurrentURL(webview.getURL());
        window.electronAPI.setCanGoBack(webview.canGoBack());
        window.electronAPI.setCanGoForward(webview.canGoForward());
        window.electronAPI.setIsLoading(webview.isLoading());
      }
    };

    webview.addEventListener('dom-ready', handleDomReady);

    // Setup webview event handlers (only after dom-ready)
    let removeListeners = () => {};
    const setupWebviewListeners = () => {
      const handleDidNavigate = (e) => {
        const newUrl = e.url;
        setErrorData(null);
        onDidNavigate && onDidNavigate(newUrl);
        if (window.electronAPI) {
          window.electronAPI.setCurrentURL(newUrl);
          window.electronAPI.setCanGoBack(webview.canGoBack());
          window.electronAPI.setCanGoForward(webview.canGoForward());
        }
      };
      const handleDidFailLoad = (e) => {
        if (e.errorCode === 0 || e.errorCode === -3) return;
        const errorInfo = {
          url: e.validatedURL || (webview.getURL && webview.getURL()),
          code: e.errorCode,
          description: e.errorDescription
        };
        setErrorData(errorInfo);
        onDidFailLoad && onDidFailLoad(errorInfo);
        if (window.electronAPI) {
          window.electronAPI.reportNavigationError(errorInfo);
        }
      };
      const handleDidStartLoading = () => {
        onLoading && onLoading(true);
        if (window.electronAPI) {
          window.electronAPI.setIsLoading(true);
        }
      };
      const handleDidStopLoading = () => {
        onLoading && onLoading(false);
        if (window.electronAPI) {
          window.electronAPI.setIsLoading(false);
          window.electronAPI.setCanGoBack(webview.canGoBack());
          window.electronAPI.setCanGoForward(webview.canGoForward());
          window.electronAPI.setCurrentURL(webview.getURL());
        }
      };
      webview.addEventListener('did-navigate', handleDidNavigate);
      webview.addEventListener('did-navigate-in-page', handleDidNavigate);
      webview.addEventListener('did-fail-load', handleDidFailLoad);
      webview.addEventListener('did-start-loading', handleDidStartLoading);
      webview.addEventListener('did-stop-loading', handleDidStopLoading);
      removeListeners = () => {
        webview.removeEventListener('did-navigate', handleDidNavigate);
        webview.removeEventListener('did-navigate-in-page', handleDidNavigate);
        webview.removeEventListener('did-fail-load', handleDidFailLoad);
        webview.removeEventListener('did-start-loading', handleDidStartLoading);
        webview.removeEventListener('did-stop-loading', handleDidStopLoading);
      };
    };

    if (domReady) {
      setupWebviewListeners();
    }

    // Set up listeners for IPC messages from main process (safe to do anytime)
    const setupIPCListeners = () => {
      if (window.electronAPI) {
        window.electronAPI.onWebviewGoBack(() => {
          if (webview.canGoBack()) {
            webview.goBack();
          }
        });
        window.electronAPI.onWebviewGoForward(() => {
          if (webview.canGoForward()) {
            webview.goForward();
          }
        });
        window.electronAPI.onWebviewReload(() => {
          webview.reload();
        });
        window.electronAPI.onWebviewLoadURL((_, url) => {
          if (url) {
            webview.src = url;
          }
        });
        window.electronAPI.onWebviewStop(() => {
          webview.stop();
        });
        window.electronAPI.onNavigationStateUpdate((_, state) => {
          if (onNavigationStateChange) {
            onNavigationStateChange(state);
          }
        });
      }
    };
    setupIPCListeners();

    // Cleanup event listeners
    return () => {
      webview.removeEventListener('dom-ready', handleDomReady);
      removeListeners();
    };
  }, [onDidNavigate, onDidFailLoad, onLoading, onNavigationStateChange, url, domReady]);

  // Update webview src if url prop changes and dom is ready
  useEffect(() => {
    const webview = webviewRef.current;
    if (webview && domReady && url && webview.getURL && webview.getURL() !== url) {
      webview.src = url;
    }
  }, [url, domReady]);

  // Render error state if there's an error
  if (errorData) {
    return (
      <div className="webview-error" style={{ 
        padding: '20px', 
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        ...style
      }}>
        <h2>Navigation Error</h2>
        <p>Could not navigate to: {errorData.url}</p>
        <p>Error: {errorData.description} (Code: {errorData.code})</p>
        <button onClick={() => {
          if (webviewRef.current) {
            webviewRef.current.reload();
            setErrorData(null);
          }
        }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <webview
      ref={webviewRef}
      src={url}
      style={{ 
        width: '100%', 
        height: '100%',
        border: 'none',
        ...style
      }}
      allowpopups="true"
      webpreferences="contextIsolation=yes, nodeIntegration=no"
    />
  );
};

export default BrowserView; 