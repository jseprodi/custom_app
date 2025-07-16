import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ContentAssignment from './components/ContentAssignment';
import ContentOverview from './components/ContentOverview';
import UserManagement from './components/UserManagement';
import Analytics from './components/Analytics';
import kontentService from './services/kontentService';
import config from './config.js';

const App = ({ sdk }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for SDK to be ready
        await sdk.ready();
        
        // Get current user information
        const currentUser = await sdk.getCurrentUser();
        setUser(currentUser);

        // Get environment context
        const context = await sdk.getContext();
        
        // Initialize Kontent.ai service with environment data
        if (context.environmentId) {
          // Get API keys from config
          const managementApiKey = config.KONTENT_API_KEY;
          const subscriptionApiKey = config.KONTENT_SUBSCRIPTION_API_KEY;
          const subscriptionId = config.KONTENT_SUBSCRIPTION_ID;
          
          // Initialize service even without API keys for demo mode
                      await kontentService.initialize(
              config.KONTENT_ENVIRONMENT_ID, 
              managementApiKey || 'demo-key', 
              subscriptionApiKey,
              subscriptionId
            );
          
          // Get project information
          try {
            const project = await kontentService.getProjectInfo();
            setProjectInfo(project);
          } catch (projectError) {
            console.warn('Could not fetch project info:', projectError);
            // Set default project info for demo
            setProjectInfo({
              id: context.environmentId,
              name: 'Demo Project',
              environment: 'Development',
              settings: {
                languages: ['en-US'],
                timezone: 'UTC',
                features: ['content-management', 'user-management']
              }
            });
          }

          // Check subscription access
          if (kontentService.hasSubscriptionAccess()) {
            console.log('Subscription API access available');
          } else {
            console.warn('Subscription API key or subscription ID not provided. Running in demo mode.');
          }
        } else {
          // Initialize with demo data if no environment ID
          await kontentService.initialize('demo-environment', 'demo-key');
          setProjectInfo({
            id: 'demo-project',
            name: 'Demo Project',
            environment: 'Development',
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
        // Don't show error, just initialize with demo data
        try {
          await kontentService.initialize('demo-environment', 'demo-key');
          setProjectInfo({
            id: 'demo-project',
            name: 'Demo Project',
            environment: 'Development',
            settings: {
              languages: ['en-US'],
              timezone: 'UTC',
              features: ['content-management', 'user-management']
            }
          });
          setIsLoading(false);
        } catch (fallbackError) {
          console.error('Fallback initialization failed:', fallbackError);
          setError('Failed to initialize the application. Please check your configuration.');
          setIsLoading(false);
        }
      }
    };

    initializeApp();
  }, [sdk]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'content-assignment', label: 'Content Assignment', icon: FileText },
    { id: 'content-overview', label: 'Content Overview', icon: Calendar },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderContent = () => {
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
    </div>
  );
};

export default App; 