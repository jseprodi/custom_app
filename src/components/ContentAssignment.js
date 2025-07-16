import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  X,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';
import kontentService from '../services/kontentService';

const ContentAssignment = ({ sdk }) => {
  const [contentItems, setContentItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedContent, setSelectedContent] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentDate, setAssignmentDate] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load content items and users in parallel
        const [contentData, usersData] = await Promise.all([
          kontentService.getContentItems(),
          kontentService.getUsers()
        ]);

        setContentItems(contentData);
        setUsers(usersData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load content data:', error);
        setError('Failed to load content data. Please try again.');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = () => {
    if (selectedContent.length === filteredContent.length) {
      setSelectedContent([]);
    } else {
      setSelectedContent(filteredContent.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedContent(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAssign = () => {
    if (selectedContent.length === 0 || !selectedUser) {
      alert('Please select content items and assignee');
      return;
    }
    setShowAssignmentModal(true);
  };

  const handleConfirmAssignment = async () => {
    try {
      setError(null);
      
      // Get the selected user's name for the assignment
      const selectedUserData = users.find(u => u.id === selectedUser);
      const assigneeName = selectedUserData ? `${selectedUserData.firstName} ${selectedUserData.lastName}` : 'Unknown';

      // Update all selected content items using bulk update
      const updateResults = await kontentService.bulkUpdateContentItems(selectedContent, {
        assignedTo: assigneeName,
        // You could also update other fields like priority, status, etc.
      });

      // Check if all updates were successful
      const failedUpdates = updateResults.filter(result => !result.success);
      if (failedUpdates.length > 0) {
        console.warn('Some content items failed to update:', failedUpdates);
      }

      // Update local state
      setContentItems(prev => prev.map(item => 
        selectedContent.includes(item.id) 
          ? { ...item, assignedTo: assigneeName }
          : item
      ));

      setSelectedContent([]);
      setSelectedUser('');
      setShowAssignmentModal(false);
      setAssignmentDate('');
      setAssignmentNotes('');

      // Show success message
      const successCount = updateResults.filter(result => result.success).length;
      const totalCount = selectedContent.length;
      
      if (successCount === totalCount) {
        alert(`Successfully assigned ${totalCount} content items to ${assigneeName}!`);
      } else {
        alert(`Assigned ${successCount} out of ${totalCount} content items to ${assigneeName}. Some items failed to update.`);
      }
    } catch (error) {
      console.error('Failed to assign content:', error);
      setError('Failed to assign content. Please try again.');
    }
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

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Content Assignment</h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
              Assign content items to creators in bulk (Using demo user data)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary"
              onClick={handleBulkAssign}
              disabled={selectedContent.length === 0 || !selectedUser}
            >
              <UserCheck size={16} />
              Assign Selected ({selectedContent.length})
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div className="form-group">
            <label className="form-label">Search Content</label>
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
                placeholder="Search by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Filter by Status</label>
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
            <label className="form-label">Assign to</label>
            <select
              className="form-control"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Available Content</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {filteredContent.length} items
            </span>
            <button 
              className="btn btn-secondary"
              onClick={handleSelectAll}
            >
              {selectedContent.length === filteredContent.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedContent.length === filteredContent.length && filteredContent.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Content Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Last Modified</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map(item => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedContent.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                  </td>
                  <td>{item.type}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <span style={{
                      color: getPriorityColor(item.priority),
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {item.priority}
                    </span>
                  </td>
                  <td>{item.createdDate.toLocaleDateString()}</td>
                  <td>{item.lastModified.toLocaleDateString()}</td>
                  <td>
                    {item.assignedTo ? (
                      <span className="badge badge-success">Assigned</span>
                    ) : (
                      <span className="badge badge-info">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Content</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAssignmentModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <div className="form-group">
                <label className="form-label">Selected Content ({selectedContent.length} items)</label>
                <div style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  padding: '8px'
                }}>
                  {contentItems
                    .filter(item => selectedContent.includes(item.id))
                    .map(item => (
                      <div key={item.id} style={{
                        padding: '4px 0',
                        fontSize: '14px'
                      }}>
                        {item.name}
                      </div>
                    ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--secondary-color)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '14px'
                }}>
                  {users.find(u => u.id === selectedUser)?.firstName} {users.find(u => u.id === selectedUser)?.lastName}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={assignmentDate}
                  onChange={(e) => setAssignmentDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Add any notes or instructions for the assignment..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAssignmentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmAssignment}
              >
                <Check size={16} />
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAssignment; 