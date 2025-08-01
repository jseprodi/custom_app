import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SimpleApp from './SimpleApp';
import './styles/global.css';

// Simple fallback component
const FallbackApp = () => (
  <div style={{ 
    padding: '20px', 
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
  }}>
    <h2>Kontent.ai Dashboard</h2>
    <p>Loading application...</p>
    <p>If this message persists, please check the browser console for errors.</p>
  </div>
);

// Initialize the app with error handling
try {
  console.log('Initializing React app...');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  if (!root) {
    console.error('Root element not found');
    document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h2>Error</h2><p>Root element not found</p></div>';
  } else {
    // Try SimpleApp first for debugging
    console.log('Rendering SimpleApp for testing...');
    root.render(<SimpleApp />);
  }
} catch (error) {
  console.error('Failed to initialize app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
      <h2>Error</h2>
      <p>Failed to initialize application: ${error.message}</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">Reload Page</button>
    </div>
  `;
} 