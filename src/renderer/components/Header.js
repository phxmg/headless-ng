import React from 'react';

const headerStyle = {
  width: '100%',
  height: 64,
  background: 'linear-gradient(90deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 32px',
  boxShadow: '0 2px 8px rgba(66,133,244,0.08)',
  fontFamily: 'Roboto, Arial, sans-serif',
  zIndex: 1000
};

const logoStyle = {
  fontWeight: 700,
  fontSize: 24,
  letterSpacing: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 8
};

const controlsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 20
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: 22,
  cursor: 'pointer',
  padding: 4,
  transition: 'color 0.2s',
};

const Header = () => (
  <header style={headerStyle}>
    <div style={logoStyle}>
      <span style={{ fontSize: 28 }}>🌐</span>
      <span>HeadlessPilot</span>
    </div>
    <div style={controlsStyle}>
      <button style={iconBtnStyle} title="Help" aria-label="Help">
        <span role="img" aria-label="help">❓</span>
      </button>
      <button style={iconBtnStyle} title="Settings" aria-label="Settings">
        <span role="img" aria-label="settings">⚙️</span>
      </button>
    </div>
  </header>
);

export default Header; 