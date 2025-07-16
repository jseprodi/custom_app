import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  UserPlus,
  X,
  Check
} from 'lucide-react';
import kontentService from '../services/kontentService';

const UserManagement = ({ sdk }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Content Creator',
    phone: '',
    status: 'active'
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch real users from Kontent.ai
        const usersData = await kontentService.getUsers();
        setUsers(usersData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load users:', error);
        setError('Failed to load users. Please try again.');
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'Content Creator',
      phone: '',
      status: 'active'
    });
    setShowAddUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      // Edit existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? { ...user, ...userData } : user
      ));
      setShowEditUserModal(false);
      setEditingUser(null);
    } else {
      // Add new user
      const newUserWithId = {
        ...userData,
        id: Date.now().toString(),
        joinDate: new Date(),
        assignedContent: 0,
        completedContent: 0,
        pendingContent: 0,
        avatar: `${userData.firstName[0]}${userData.lastName[0]}`
      };
      setUsers(prev => [...prev, newUserWithId]);
      setShowAddUserModal(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="badge badge-success">Active</span>
      : <span className="badge badge-secondary">Inactive</span>;
  };

  const getCompletionRate = (completed, assigned) => {
    if (assigned === 0) return 0;
    return Math.round((completed / assigned) * 100);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading users...</div>
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
            <h2 className="card-title">User Management</h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
              Manage content creators and their assignments (Demo data - User management is handled through Kontent.ai web interface)
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleAddUser}>
            <UserPlus size={16} />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div className="form-group">
            <label className="form-label">Search Users</label>
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-control"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="Content Creator">Content Creator</option>
              <option value="Editor">Editor</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {filteredUsers.map(user => (
          <div key={user.id} className="card" style={{ margin: 0 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--primary-color)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {user.avatar}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>{user.role}</span>
                    <span>•</span>
                    {getStatusBadge(user.status)}
                  </div>
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
                  onClick={() => handleEditUser(user)}
                  title="Edit"
                >
                  <Edit size={14} />
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '4px 8px' }}
                  onClick={() => handleDeleteUser(user.id)}
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
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Email
                </div>
                <div style={{ fontWeight: '500' }}>
                  {user.email}
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Phone
                </div>
                <div>
                  {user.phone}
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Join Date
                </div>
                <div>
                  {user.joinDate.toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Status
                </div>
                <div>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div style={{
              background: 'var(--secondary-color)',
              borderRadius: 'var(--border-radius)',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Performance</span>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  {getCompletionRate(user.completedContent, user.assignedContent)}% completion rate
                </span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                fontSize: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                    {user.assignedContent}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Assigned</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', color: 'var(--success-color)' }}>
                    {user.completedContent}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Completed</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', color: 'var(--warning-color)' }}>
                    {user.pendingContent}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Pending</div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button className="btn btn-secondary" style={{ flex: 1, fontSize: '12px' }}>
                <Mail size={12} />
                Contact
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, fontSize: '12px' }}>
                <FileText size={12} />
                View Work
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Users size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            No users found
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <UserModal
          user={newUser}
          setUser={setNewUser}
          onSave={handleSaveUser}
          onClose={() => setShowAddUserModal(false)}
          title="Add New User"
        />
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <UserModal
          user={editingUser}
          setUser={setEditingUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowEditUserModal(false);
            setEditingUser(null);
          }}
          title="Edit User"
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, setUser, onSave, onClose, title }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                value={user.firstName}
                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={user.role}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
              >
                <option value="Content Creator">Content Creator</option>
                <option value="Editor">Editor</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={user.status}
                onChange={(e) => setUser({ ...user, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement; 