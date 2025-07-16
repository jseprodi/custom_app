import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import kontentService from '../services/kontentService';

const ContentOverview = ({ sdk }) => {
  const [contentItems, setContentItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('lastModified');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        console.log('Loading real content from Kontent.ai...');
        const contentItems = await kontentService.getContentItems();
        console.log('ContentOverview received content items:', contentItems);
        setContentItems(contentItems);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load content:', error);
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const filteredAndSortedContent = contentItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesType = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastModified':
          return b.lastModified - a.lastModified;
        case 'createdDate':
          return b.createdDate - a.createdDate;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', class: 'badge-info' },
      review: { label: 'In Review', class: 'badge-warning' },
      published: { label: 'Published', class: 'badge-success' },
      archived: { label: 'Archived', class: 'badge-secondary' }
    };

    const config = statusConfig[status] || { label: status, class: 'badge-info' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'var(--danger-color)';
      case 'medium':
        return 'var(--warning-color)';
      case 'low':
        return 'var(--success-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const handleViewContent = (itemId) => {
    // In real implementation, this would open the content in Kontent.ai
    console.log('Viewing content:', itemId);
  };

  const handleEditContent = (itemId) => {
    // In real implementation, this would open the content for editing
    console.log('Editing content:', itemId);
  };

  const handleDeleteContent = (itemId) => {
    if (confirm('Are you sure you want to delete this content item?')) {
      setContentItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading content overview...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Content Overview</h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
              Manage and monitor all content items
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary">
              <Calendar size={16} />
              Export Report
            </button>
            <button className="btn btn-primary">
              <FileText size={16} />
              Create Content
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr auto',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div className="form-group">
            <label className="form-label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">In Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-control"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Blog Post">Blog Post</option>
              <option value="Page Content">Page Content</option>
              <option value="Hero Banner">Hero Banner</option>
              <option value="Landing Page">Landing Page</option>
              <option value="Email Template">Email Template</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="lastModified">Last Modified</option>
              <option value="createdDate">Created Date</option>
              <option value="name">Name</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {filteredAndSortedContent.map(item => (
          <div key={item.id} className="card" style={{ margin: 0 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    {item.name}
                  </h3>
                  {getStatusBadge(item.status)}
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px'
                }}>
                  <span>{item.type}</span>
                  <span>•</span>
                  <span style={{
                    color: getPriorityColor(item.priority),
                    fontWeight: '500',
                    textTransform: 'uppercase'
                  }}>
                    {item.priority}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px' }}
                  onClick={() => handleViewContent(item.id)}
                  title="View"
                >
                  <Eye size={14} />
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px' }}
                  onClick={() => handleEditContent(item.id)}
                  title="Edit"
                >
                  <Edit size={14} />
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '4px 8px' }}
                  onClick={() => handleDeleteContent(item.id)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '14px'
            }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Assigned To
                </div>
                <div style={{ fontWeight: '500' }}>
                  {item.assignedTo || 'Unassigned'}
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Author
                </div>
                <div style={{ fontWeight: '500' }}>
                  {item.author}
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Created
                </div>
                <div>
                  {item.createdDate.toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Last Modified
                </div>
                <div>
                  {item.lastModified.toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Views
                </div>
                <div>
                  {item.views.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Status
                </div>
                <div>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedContent.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <FileText size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            No content found
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentOverview; 