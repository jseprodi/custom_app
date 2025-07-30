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
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

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

        // Debug: Get available languages
        try {
          const languages = await kontentService.getLanguages();
          console.log('Available languages in environment:', languages);
          
          const defaultLanguage = await kontentService.getDefaultLanguageCodename();
          console.log('Using default language:', defaultLanguage);
        } catch (langError) {
          console.warn('Could not fetch languages:', langError);
        }

        // Load existing assignments for all content items
        if (contentData.length > 0) {
          const itemIds = contentData.map(item => item.id);
          const assignmentResults = await kontentService.getBulkContentAssignments(itemIds);
          
          // Update content items with assignment information
          setContentItems(prev => prev.map(item => {
            const assignmentResult = assignmentResults.find(r => r.itemId === item.id);
            if (assignmentResult?.success && assignmentResult.data.contributors.length > 0) {
              // Find the assigned user from our users list
              const assignedUser = usersData.find(u => 
                assignmentResult.data.contributors.some(c => c.id === u.id)
              );
              
              return {
                ...item,
                assignedTo: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Unknown User',
                assignmentContributors: assignmentResult.data.contributors,
                hasAssignment: true
              };
            }
            return item;
          }));
        }

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
      
      // Get the selected user's data for the assignment
      const selectedUserData = users.find(u => u.id === selectedUser);
      if (!selectedUserData) {
        throw new Error('Selected user not found');
      }

      // Prepare assignment options
      const assignmentOptions = {
        role: 'contributor', // Default role
        notes: assignmentNotes || undefined,
        dueDate: assignmentDate || undefined
      };

      // Use the new bulk assignment method that properly handles contributor assignments
      const updateResults = await kontentService.bulkAssignContentToUser(
        selectedContent, 
        selectedUser, 
        null, // Let the service determine the correct language
        assignmentOptions
      );

      // Check results and provide appropriate feedback
      const successfulAssignments = updateResults.filter(result => result.success);
      const failedAssignments = updateResults.filter(result => !result.success);

      // Update local state for successful assignments
      setContentItems(prev => prev.map(item => {
        const wasAssigned = selectedContent.includes(item.id);
        if (wasAssigned) {
          const assignmentResult = updateResults.find(r => r.itemId === item.id);
          if (assignmentResult?.success) {
            return { 
              ...item, 
              assignedTo: `${selectedUserData.firstName} ${selectedUserData.lastName}`,
              assignmentDate: assignmentDate || new Date().toISOString().split('T')[0],
              assignmentNotes: assignmentNotes || null
            };
          }
        }
        return item;
      }));

      // Reset form
      setSelectedContent([]);
      setSelectedUser('');
      setShowAssignmentModal(false);
      setAssignmentDate('');
      setAssignmentNotes('');

      // Show success/error message
      const successCount = successfulAssignments.length;
      const totalCount = selectedContent.length;
      const assigneeName = `${selectedUserData.firstName} ${selectedUserData.lastName}`;
      
      if (successCount === totalCount) {
        alert(`Successfully assigned ${totalCount} content items to ${assigneeName}!`);
      } else if (successCount > 0) {
        const errorDetails = failedAssignments.map(f => f.error).join(', ');
        alert(`Assigned ${successCount} out of ${totalCount} content items to ${assigneeName}. Some items failed: ${errorDetails}`);
      } else {
        const errorDetails = failedAssignments.map(f => f.error).join(', ');
        alert(`Assignment failed for all items: ${errorDetails}`);
      }
    } catch (error) {
      console.error('Failed to assign content:', error);
      setError(`Failed to assign content: ${error.message}`);
    }
  };

  const handleRemoveAssignment = (item) => {
    setItemToRemove(item);
    setShowRemoveModal(true);
  };

  const handleConfirmRemoveAssignment = async () => {
    if (!itemToRemove || !itemToRemove.assignmentContributors) {
      setShowRemoveModal(false);
      setItemToRemove(null);
      return;
    }

    try {
      setError(null);
      
      // Remove all contributors for this item
      const removeResults = [];
      for (const contributor of itemToRemove.assignmentContributors) {
        try {
          const result = await kontentService.removeContentAssignment(
            itemToRemove.id, 
            contributor.id, 
            null // Let the service determine the correct language
          );
          removeResults.push({ contributorId: contributor.id, success: true, data: result });
        } catch (error) {
          removeResults.push({ contributorId: contributor.id, success: false, error: error.message });
        }
      }

      // Update local state
      setContentItems(prev => prev.map(item => 
        item.id === itemToRemove.id 
          ? { ...item, assignedTo: null, assignmentContributors: [], hasAssignment: false }
          : item
      ));

      setShowRemoveModal(false);
      setItemToRemove(null);

      // Show result
      const successCount = removeResults.filter(r => r.success).length;
      const totalCount = removeResults.length;
      
      if (successCount === totalCount) {
        alert(`Successfully removed all assignments for "${itemToRemove.name}"!`);
      } else if (successCount > 0) {
        alert(`Removed ${successCount} out of ${totalCount} assignments for "${itemToRemove.name}". Some removals failed.`);
      } else {
        alert(`Failed to remove assignments for "${itemToRemove.name}".`);
      }
    } catch (error) {
      console.error('Failed to remove assignment:', error);
      setError(`Failed to remove assignment: ${error.message}`);
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
              Assign content items to creators using Kontent.ai language variants and contributor system. Assignments are stored in the content item's language variant.
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
            <button 
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  console.log('Running language detection debug...');
                  const result = await kontentService.debugLanguageDetection();
                  console.log('Debug result:', result);
                  if (result.success) {
                    alert(`Language detection debug completed successfully!\n\nAvailable languages: ${result.languages.length}\nDefault language: ${result.defaultLanguage}\nContent items: ${result.contentItemsCount}\n\nCheck console for detailed information.`);
                  } else {
                    alert(`Language detection debug failed: ${result.error}`);
                  }
                } catch (error) {
                  console.error('Debug failed:', error);
                  alert(`Debug failed: ${error.message}`);
                }
              }}
            >
              Debug Languages
            </button>
            <button 
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  console.log('Testing language codenames...');
                  const result = await kontentService.testLanguageCodenames();
                  console.log('Language codename test result:', result);
                  if (result.success) {
                    const workingCount = result.workingLanguages.length;
                    const recommended = result.recommendedLanguage;
                    alert(`Language codename test completed!\n\nWorking languages: ${workingCount}\nRecommended: ${recommended || 'None found'}\n\nWorking codenames: ${result.workingLanguages.join(', ')}\n\nCheck console for detailed results.`);
                    
                    if (recommended) {
                      // Automatically set the recommended language
                      kontentService.setDefaultLanguageCodename(recommended);
                      console.log(`Automatically set language codename to: ${recommended}`);
                    }
                  } else {
                    alert(`Language codename test failed: ${result.error}`);
                  }
                } catch (error) {
                  console.error('Language codename test failed:', error);
                  alert(`Language codename test failed: ${error.message}`);
                }
              }}
            >
              Test Language Codenames
            </button>
            <button 
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  console.log('Testing SDK response structure...');
                  const result = await kontentService.testSdkResponseStructure();
                  console.log('SDK response structure test result:', result);
                  if (result.success) {
                    alert(`SDK response structure test completed!\n\nCheck console for detailed response structure information.`);
                  } else {
                    alert(`SDK response structure test failed: ${result.error}`);
                  }
                } catch (error) {
                  console.error('SDK response structure test failed:', error);
                  alert(`SDK response structure test failed: ${error.message}`);
                }
              }}
            >
              Test SDK Response
            </button>
            <button 
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  console.log('Testing upsert data structures...');
                  const contentItems = await kontentService.getContentItems();
                  if (contentItems.length > 0) {
                    const testItem = contentItems[0];
                    const result = await kontentService.testUpsertDataStructures(testItem.id, 'default');
                    console.log('Upsert data structure test result:', result);
                    if (result.success) {
                      const successfulCount = result.successfulTests.length;
                      alert(`Upsert data structure test completed!\n\nSuccessful tests: ${successfulCount}\nSuccessful formats: ${result.successfulTests.join(', ')}\n\nCheck console for detailed results.`);
                    } else {
                      alert(`Upsert data structure test failed: ${result.error}`);
                    }
                  } else {
                    alert('No content items available for testing');
                  }
                } catch (error) {
                  console.error('Upsert data structure test failed:', error);
                  alert(`Upsert data structure test failed: ${error.message}`);
                }
              }}
            >
              Test Upsert Data
            </button>
            <button 
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  console.log('Testing raw API upsert...');
                  const contentItems = await kontentService.getContentItems();
                  if (contentItems.length > 0) {
                    const testItem = contentItems[0];
                    const result = await kontentService.testRawApiUpsert(testItem.id, 'default');
                    console.log('Raw API upsert test result:', result);
                    if (result.success) {
                      const successfulCount = result.successfulTests.length;
                      alert(`Raw API upsert test completed!\n\nSuccessful tests: ${successfulCount}\nSuccessful formats: ${result.successfulTests.join(', ')}\n\nCheck console for detailed results.`);
                    } else {
                      alert(`Raw API upsert test failed: ${result.error}`);
                    }
                  } else {
                    alert('No content items available for testing');
                  }
                } catch (error) {
                  console.error('Raw API upsert test failed:', error);
                  alert(`Raw API upsert test failed: ${error.message}`);
                }
              }}
            >
              Test Raw API
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
                <th>Actions</th>
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
                      <div>
                        <span className="badge badge-success">Assigned</span>
                        <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                          {item.assignedTo}
                        </div>
                        {item.assignmentContributors && item.assignmentContributors.length > 0 && (
                          <div style={{ fontSize: '11px', marginTop: '2px' }}>
                            {item.assignmentContributors.map(contributor => (
                              <span key={contributor.id} className="badge badge-info" style={{ marginRight: '4px' }}>
                                {contributor.role}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="badge badge-info">Unassigned</span>
                    )}
                  </td>
                  <td>
                    {item.assignedTo && (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveAssignment(item)}
                        title="Remove Assignment"
                      >
                        <X size={14} />
                      </button>
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

      {/* Remove Assignment Modal */}
      {showRemoveModal && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Remove Assignment</h3>
              <button 
                className="modal-close"
                onClick={() => setShowRemoveModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove all assignments for "{itemToRemove?.name}"? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowRemoveModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleConfirmRemoveAssignment}
              >
                <X size={16} />
                Remove Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAssignment; 