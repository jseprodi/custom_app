import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';
import kontentService from '../services/kontentService';

const Analytics = ({ sdk }) => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalContent: 156,
      totalUsers: 12,
      completionRate: 78,
      averageTimeToComplete: 3.2
    },
    monthlyStats: [
      { month: 'Jan', created: 12, completed: 10, assigned: 15 },
      { month: 'Feb', created: 18, completed: 14, assigned: 20 },
      { month: 'Mar', created: 22, completed: 19, assigned: 25 },
      { month: 'Apr', created: 15, completed: 12, assigned: 18 },
      { month: 'May', created: 28, completed: 25, assigned: 30 },
      { month: 'Jun', created: 32, completed: 28, assigned: 35 }
    ],
    topPerformers: [
      { name: 'John Doe', completed: 15, rate: 94 },
      { name: 'Jane Smith', completed: 12, rate: 88 },
      { name: 'Mike Johnson', completed: 10, rate: 85 },
      { name: 'Sarah Wilson', completed: 8, rate: 82 },
      { name: 'David Brown', completed: 7, rate: 78 }
    ],
    contentTypes: [
      { type: 'Blog Post', count: 45, percentage: 29 },
      { type: 'Page Content', count: 38, percentage: 24 },
      { type: 'Hero Banner', count: 25, percentage: 16 },
      { type: 'Landing Page', count: 22, percentage: 14 },
      { type: 'Email Template', count: 18, percentage: 12 },
      { type: 'Other', count: 8, percentage: 5 }
    ]
  });
  const [timeRange, setTimeRange] = useState('6months');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real analytics data from Kontent.ai
        const analyticsData = await kontentService.getAnalyticsData(timeRange);
        setAnalyticsData(analyticsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
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
          {subtitle && (
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div style={{
              fontSize: '12px',
              color: trend > 0 ? 'var(--success-color)' : 'var(--danger-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px'
            }}>
              <TrendingUp size={12} />
              {trend > 0 ? '+' : ''}{trend}% from last month
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

  const ChartBar = ({ value, maxValue, label, color }) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{value}</span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        background: 'var(--secondary-color)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(value / maxValue) * 100}%`,
          height: '100%',
          background: color,
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Analytics & Insights</h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
              Track performance and content creation metrics
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="form-control"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <button className="btn btn-secondary">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <StatCard
          title="Total Content"
          value={analyticsData.overview.totalContent}
          icon={FileText}
          color="var(--primary-color)"
          trend={12}
        />
        <StatCard
          title="Active Users"
          value={analyticsData.overview.totalUsers}
          icon={Users}
          color="var(--success-color)"
          trend={8}
        />
        <StatCard
          title="Completion Rate"
          value={`${analyticsData.overview.completionRate}%`}
          icon={CheckCircle}
          color="var(--warning-color)"
          trend={5}
        />
        <StatCard
          title="Avg. Time to Complete"
          value={`${analyticsData.overview.averageTimeToComplete} days`}
          icon={Clock}
          color="var(--danger-color)"
          trend={-3}
        />
      </div>

      {/* Charts and Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
        {/* Monthly Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Content Trends</h3>
          </div>
          
          <div style={{ padding: '20px 0' }}>
            {analyticsData.monthlyStats.map((stat, index) => (
              <div key={stat.month} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
                padding: '12px',
                background: 'var(--secondary-color)',
                borderRadius: 'var(--border-radius)'
              }}>
                <div style={{
                  width: '60px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  {stat.month}
                </div>
                
                <div style={{ flex: 1 }}>
                  <ChartBar
                    value={stat.created}
                    maxValue={Math.max(...analyticsData.monthlyStats.map(s => s.created))}
                    label="Created"
                    color="var(--primary-color)"
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <ChartBar
                    value={stat.completed}
                    maxValue={Math.max(...analyticsData.monthlyStats.map(s => s.completed))}
                    label="Completed"
                    color="var(--success-color)"
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <ChartBar
                    value={stat.assigned}
                    maxValue={Math.max(...analyticsData.monthlyStats.map(s => s.assigned))}
                    label="Assigned"
                    color="var(--warning-color)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Performers</h3>
          </div>
          
          <div style={{ padding: '20px 0' }}>
            {analyticsData.topPerformers.map((performer, index) => (
              <div key={performer.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: index < analyticsData.topPerformers.length - 1 ? '1px solid var(--border-color)' : 'none'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: index < 3 ? 'var(--warning-color)' : 'var(--secondary-color)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: index < 3 ? 'white' : 'var(--text-secondary)'
                }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                    {performer.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    {performer.completed} completed • {performer.rate}% success rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Types and Additional Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginTop: '24px'
      }}>
        {/* Content Types Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Content Types Distribution</h3>
          </div>
          
          <div style={{ padding: '20px 0' }}>
            {analyticsData.contentTypes.map((type, index) => (
              <div key={type.type} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: [
                    'var(--primary-color)',
                    'var(--success-color)',
                    'var(--warning-color)',
                    'var(--danger-color)',
                    'var(--text-secondary)',
                    'var(--border-color)'
                  ][index % 6]
                }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>
                    {type.type}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {type.count}
                  </span>
                  <span style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px'
                  }}>
                    ({type.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Insights</h3>
          </div>
          
          <div style={{ padding: '20px 0' }}>
            <div style={{
              padding: '16px',
              background: 'var(--secondary-color)',
              borderRadius: 'var(--border-radius)',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <TrendingUp size={16} style={{ color: 'var(--success-color)' }} />
                <span style={{ fontWeight: '500' }}>Content Creation Up</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                Content creation has increased by 15% compared to last month, with blog posts being the most popular type.
              </p>
            </div>

            <div style={{
              padding: '16px',
              background: 'var(--secondary-color)',
              borderRadius: 'var(--border-radius)',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Users size={16} style={{ color: 'var(--primary-color)' }} />
                <span style={{ fontWeight: '500' }}>Team Performance</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                John Doe leads the team with 94% completion rate, followed by Jane Smith at 88%.
              </p>
            </div>

            <div style={{
              padding: '16px',
              background: 'var(--secondary-color)',
              borderRadius: 'var(--border-radius)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Clock size={16} style={{ color: 'var(--warning-color)' }} />
                <span style={{ fontWeight: '500' }}>Efficiency Gains</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                Average completion time has decreased by 0.8 days, indicating improved workflow efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 