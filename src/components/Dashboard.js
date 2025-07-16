import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Plus,
  Calendar
} from 'lucide-react';
import kontentService from '../services/kontentService';

const Dashboard = ({ sdk, user }) => {
  const [stats, setStats] = useState({
    totalContent: 0,
    assignedContent: 0,
    pendingContent: 0,
    completedContent: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('Loading real dashboard data from Kontent.ai...');
        
        // Fetch real content items
        const contentItems = await kontentService.getContentItems();
        console.log('Dashboard received content items:', contentItems);
        
        // Fetch real users for accurate user count
        const users = await kontentService.getUsers();
        const activeUsers = users.filter(user => user.status === 'active').length;
        
        // Calculate stats from real data
        const totalContent = contentItems.length;
        const assignedContent = contentItems.filter(item => item.assignedTo).length;
        const pendingContent = contentItems.filter(item => item.status === 'draft').length;
        const completedContent = contentItems.filter(item => item.status === 'published').length;
        
        setStats({
          totalContent,
          assignedContent,
          pendingContent,
          completedContent,
          activeUsers
        });

        // Create recent activity from real content
        const recentActivity = contentItems.slice(0, 5).map((item, index) => ({
          id: index + 1,
          type: item.status === 'published' ? 'completion' : 'creation',
          message: `Content "${item.name}" ${item.status === 'published' ? 'completed' : 'created'}`,
          timestamp: item.lastModified,
          user: item.author
        }));

        setRecentActivity(recentActivity);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card" style={{ flex: 1, minWidth: '200px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            {value}
          </div>
          {trend && (
            <div style={{
              fontSize: '12px',
              color: trend > 0 ? 'var(--success-color)' : 'var(--danger-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <TrendingUp size={12} />
              {trend > 0 ? '+' : ''}{trend}% from last week
            </div>
          )}
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'assignment':
          return <Users size={16} />;
        case 'completion':
          return <CheckCircle size={16} />;
        case 'creation':
          return <Plus size={16} />;
        default:
          return <FileText size={16} />;
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'assignment':
          return 'var(--primary-color)';
        case 'completion':
          return 'var(--success-color)';
        case 'creation':
          return 'var(--warning-color)';
        default:
          return 'var(--text-secondary)';
      }
    };

    return (
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: getActivityColor(activity.type),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0
        }}>
          {getActivityIcon(activity.type)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            {activity.message}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{activity.user}</span>
            <span>•</span>
            <span>{activity.timestamp.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
              Welcome back, {user?.firstName || 'User'}!
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Here's what's happening with your content today.
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus size={16} />
            Create New Assignment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <StatCard
          title="Total Content"
          value={stats.totalContent}
          icon={FileText}
          color="var(--primary-color)"
          trend={12}
        />
        <StatCard
          title="Assigned Content"
          value={stats.assignedContent}
          icon={Users}
          color="var(--warning-color)"
          trend={8}
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingContent}
          icon={Clock}
          color="var(--danger-color)"
          trend={-5}
        />
        <StatCard
          title="Completed"
          value={stats.completedContent}
          icon={CheckCircle}
          color="var(--success-color)"
          trend={15}
        />
      </div>

      {/* Content Overview and Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
        {/* Content Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Content Overview</h3>
            <button className="btn btn-secondary">
              <Calendar size={16} />
              View Calendar
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '16px',
              background: 'var(--secondary-color)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--primary-color)',
                marginBottom: '4px'
              }}>
                {Math.round((stats.assignedContent / stats.totalContent) * 100)}%
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontWeight: '500'
              }}>
                Assigned
              </div>
            </div>
            
            <div style={{
              padding: '16px',
              background: 'var(--secondary-color)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--success-color)',
                marginBottom: '4px'
              }}>
                {Math.round((stats.completedContent / stats.totalContent) * 100)}%
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontWeight: '500'
              }}>
                Completed
              </div>
            </div>
            
            <div style={{
              padding: '16px',
              background: 'var(--secondary-color)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--danger-color)',
                marginBottom: '4px'
              }}>
                {Math.round((stats.pendingContent / stats.totalContent) * 100)}%
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontWeight: '500'
              }}>
                Pending
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          
          <div>
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 