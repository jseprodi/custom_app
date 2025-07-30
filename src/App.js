import React, { useState, useEffect } from 'react';
// FORCE REBUILD - CLEAR CACHE - TIMESTAMP: 2024-01-15
import { 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings,
  Plus,
  Search,
  Filter,
  Key,
  AlertCircle
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ContentAssignment from './components/ContentAssignment';
import ContentOverview from './components/ContentOverview';
import UserManagement from './components/UserManagement';
import Analytics from './components/Analytics';
import { getCustomAppContext } from './services/sdkWrapper';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);
  const [error, setError] = useState(null);
  const [sdkContext, setSdkContext] = useState(null);
  const [apiKeys, setApiKeys] = useState({
    managementApiKey: '',
    subscriptionApiKey: '',
    subscriptionId: '',
    environmentId: '' // Added environment ID
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(true); // Show modal by default

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Get context from the official Kontent.ai Custom App SDK
        const response = await getCustomAppContext();
        
        if (response.isError) {
          console.error('SDK Error:', { errorCode: response.code, description: response.description });
          
          // Check if it's a development environment error
          if (response.description.includes('Not running in Kontent.ai environment')) {
            // Don't set error, just show the API key modal
            setIsLoading(false);
            return;
          } else {
            setError(`Failed to initialize: ${response.description}`);
            setIsLoading(false);
            return;
          }
        }
        
        setSdkContext(response.context);
        
        // Extract user information from context
        if (response.context) {
          setUser({
            id: response.context.userId,
            email: response.context.userEmail,
            firstName: response.context.userEmail?.split('@')[0] || 'User',
            lastName: '',
            role: response.context.userRoles?.[0]?.codename || 'User'
          });
        }

        // Set project info from context, using environment ID from API keys if available
        const environmentId = apiKeys.environmentId || response.context?.environmentId;
        if (environmentId) {
          setProjectInfo({
            id: environmentId,
            name: 'Kontent.ai Project',
            environment: 'Production',
            settings: {
              languages: ['en-US'],
              timezone: 'UTC',
              features: ['content-management', 'user-management']
            }
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setError('Failed to initialize the application. Please check your configuration.');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []); // Empty dependency array - only run once on mount

  const handleApiKeySubmit = (keys) => {
    setApiKeys(keys);
    setShowApiKeyModal(false);
    // Re-initialize the app with the new API keys
    // This would typically trigger a re-fetch of data
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'content-assignment', label: 'Content Assignment', icon: FileText },
    { id: 'content-overview', label: 'Content Overview', icon: Calendar },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderContent = () => {
    const sdk = {
      context: sdkContext,
      apiKeys: apiKeys
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard sdk={sdk} user={user} projectInfo={projectInfo} />;
      case 'content-assignment':
        return <ContentAssignment sdk={sdk} />;
      case 'content-overview':
        return <ContentOverview sdk={sdk} />;
      case 'user-management':
        return <UserManagement sdk={sdk} />;
      case 'analytics':
        return <Analytics sdk={sdk} />;
      default:
        return <Dashboard sdk={sdk} user={user} projectInfo={projectInfo} />;
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" style={{ margin: '20px' }}>
        <h3>Error</h3>
        <p>{error}</p>
        <p>Please check your Kontent.ai configuration and try again.</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 0'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'var(--primary-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                K
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  Content Management Dashboard
                </h1>
                {projectInfo && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {projectInfo.name} • {projectInfo.environment}
                  </p>
                )}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {user && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}>
                  <span>Welcome, {user.firstName} {user.lastName}</span>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'var(--secondary-color)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '500'
                  }}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </div>
              )}
              
              
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '8px 0'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-primary)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '24px 0' }}>
        <div className="container">
          {renderContent()}
        </div>
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <ApiKeyModal 
          apiKeys={apiKeys}
          onSubmit={handleApiKeySubmit}
          onClose={() => setShowApiKeyModal(false)}
        />
      )}
    </div>
  );
};

// API Key Modal Component
const ApiKeyModal = ({ apiKeys, onSubmit, onClose }) => {
  const [keys, setKeys] = useState(apiKeys);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(keys);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '32px', 
        borderRadius: 'var(--border-radius)', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Welcome to Kontent.ai Dashboard</h3>
        <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
          Please enter your Kontent.ai API credentials to get started.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Management API Key
            </label>
            <input
              type="password"
              value={keys.managementApiKey}
              onChange={(e) => setKeys({...keys, managementApiKey: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius)',
                fontSize: '14px'
              }}
              placeholder="Enter Management API Key"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Subscription API Key
            </label>
            <input
              type="password"
              value={keys.subscriptionApiKey}
              onChange={(e) => setKeys({...keys, subscriptionApiKey: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius)',
                fontSize: '14px'
              }}
              placeholder="Enter Subscription API Key"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Environment ID
            </label>
            <input
              type="text"
              value={keys.environmentId}
              onChange={(e) => setKeys({...keys, environmentId: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius)',
                fontSize: '14px'
              }}
              placeholder="Enter Environment ID"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Subscription ID
            </label>
            <input
              type="text"
              value={keys.subscriptionId}
              onChange={(e) => setKeys({...keys, subscriptionId: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius)',
                fontSize: '14px'
              }}
              placeholder="Enter Subscription ID"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ 
              padding: '12px 24px', 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: 'var(--border-radius)', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Get Started
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App; 