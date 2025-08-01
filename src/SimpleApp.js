import React from 'react';

const SimpleApp = () => {
  console.log('SimpleApp rendering...');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1>🎉 Kontent.ai Dashboard</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Debug Info:</h3>
        <p><strong>URL:</strong> {window.location.href}</p>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        <p><strong>Screen Size:</strong> {window.screen.width}x{window.screen.height}</p>
      </div>
    </div>
  );
};

export default SimpleApp; 