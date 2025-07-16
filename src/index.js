import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Create a mock SDK for development
class CustomAppSdk {
  constructor() {
    this.isReady = false;
    this.context = null;
  }

  async ready() {
    if (!this.isReady) {
      // Mock context for development - using hardcoded values for now
      // In a real custom app, these would come from the Kontent.ai SDK
      this.context = {
        environmentId: 'demo-environment',
        projectId: 'demo-project',
        config: {
          managementApiKey: null,
          subscriptionApiKey: null,
          subscriptionId: null
        }
      };
      this.isReady = true;
    }
    return this;
  }

  async getCurrentUser() {
    // Mock user for development
    return {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Content Manager'
    };
  }

  async getContext() {
    if (!this.context) {
      await this.ready();
    }
    return this.context;
  }
}

// Initialize the mock SDK
const sdk = new CustomAppSdk();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App sdk={sdk} />
  </React.StrictMode>
); 