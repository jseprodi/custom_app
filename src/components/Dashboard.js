import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';
import kontentService from '../services/kontentService';

const Dashboard = ({ sdk, user, projectInfo }) => {
  const [stats, setStats] = useState({
    totalContent: 0,
    totalUsers: 0,
    assignedContent: 0,
    completedContent: 0
  });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Check if we have the required API keys and context
        if (!sdk?.apiKeys?.managementApiKey || !sdk?.apiKeys?.environmentId) {
          // Don't throw an error, just show a message that API keys are needed
          setError('Please configure your Management API Key and Environment ID to view dashboard data. This app requires valid Kontent.ai credentials to function.');
          setLoading(false);
          return;
        }

        // Initialize service with API keys from SDK
        await kontentService.initialize(
          sdk.apiKeys.environmentId, // Use environment ID from API keys
          sdk.apiKeys.managementApiKey,
          sdk.apiKeys.subscriptionApiKey,
          sdk.apiKeys.subscriptionId
        );

        // Fetch content items
        const contentItems = await kontentService.getContentItems();
        
        // Calculate stats
        const totalContent = contentItems.length;
        const assignedContent = contentItems.filter(item => item.assignedTo).length;
        const completedContent = contentItems.filter(item => item.status === 'published').length;
        
        // Get recent content (last 5 items)
        const recent = contentItems
          .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
          .slice(0, 5);

        // Try to get users if subscription API is available
        let totalUsers = 0;
        try {
          if (kontentService.hasSubscriptionAccess()) {
            const users = await kontentService.getUsers();
            totalUsers = users.length;
          }
        } catch (userError) {
          console.warn('Could not fetch users:', userError);
        }

        setStats({
          totalContent,
          totalUsers,
          assignedContent,
          completedContent
        });
        
        setRecentContent(recent);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [sdk]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircle size={16} color="green" />;
      case 'draft':
        return <Clock size={16} color="orange" />;
      default:
        return <AlertCircle size={16} color="gray" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'green';
      case 'draft':
        return 'orange';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: 'red'
      }}>
        <AlertCircle size={48} style={{ marginBottom: '16px' }} />
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <p>Please check your API keys and try again.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
          Welcome back, {user?.firstName || 'User'}!
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Here's what's happening with your content today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FileText size={20} color="var(--primary-color)" />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Content</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {stats.totalContent}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Users size={20} color="var(--primary-color)" />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active Users</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {stats.totalUsers}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <TrendingUp size={20} color="var(--primary-color)" />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Assigned Content</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {stats.assignedContent}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CheckCircle size={20} color="var(--primary-color)" />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Completed</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {stats.completedContent}
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Recent Content
          </h3>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            border: 'none',
            background: 'var(--primary-color)',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <Plus size={16} />
            Add Content
          </button>
        </div>

        <div>
          {recentContent.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No content items found.</p>
              <p>Create your first content item to get started.</p>
            </div>
          ) : (
            recentContent.map((item) => (
              <div key={item.id} style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                      {item.name}
                    </span>
                    {getStatusIcon(item.status)}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {item.type} • {item.author} • {new Date(item.lastModified).toLocaleDateString()}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px'
                }}>
                  {item.assignedTo && (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Assigned to {item.assignedTo}
                    </span>
                  )}
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: `var(--${getStatusColor(item.status)}-light)`,
                    color: `var(--${getStatusColor(item.status)})`
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 