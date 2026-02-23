import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  startAfter,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../common/DashboardHeader';
import DataCard from '../common/DataCard';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import useForm from '../../hooks/useForm';
import useModal from '../../hooks/useModal';
import useAlert from '../../hooks/useAlert';
import usePagination from '../../hooks/usePagination';

// Role options for dropdown
const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' }
];

function UserManagement() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for users data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  
  // Custom hooks
  const { form: editForm, updateForm, setForm } = useForm({
    name: '',
    username: '',
    phoneNumber: '',
    role: ''
  });
  
  const { isOpen: isEditModalOpen, open: openEditModal, close: closeEditModal } = useModal();
  const { isOpen: isDeleteModalOpen, open: openDeleteModal, close: closeDeleteModal } = useModal();
  const { alert, showSuccess, showError, clearAlert } = useAlert();
  
  const USERS_PER_PAGE = 10;
  const { 
    page, 
    setPage, 
    firstDoc, 
    setFirstDoc, 
    lastDoc, 
    setLastDoc, 
    hasMore, 
    setHasMore 
  } = usePagination();
  
  // Delete confirmation state
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Fetch users with pagination
  const fetchUsers = async (pageDirection) => {
    try {
      setLoading(true);
      clearAlert();
      
      let usersQuery;
      
      if (pageDirection === 'next' && lastDoc) {
        usersQuery = query(
          collection(db, 'users'),
          orderBy('name'),
          startAfter(lastDoc),
          limit(USERS_PER_PAGE)
        );
        setPage(page + 1);
      } else if (pageDirection === 'prev') {
        usersQuery = query(
          collection(db, 'users'),
          orderBy('name'),
          limit(USERS_PER_PAGE)
        );
        setPage(1);
      } else {
        usersQuery = query(
          collection(db, 'users'),
          orderBy('name'),
          limit(USERS_PER_PAGE)
        );
        setPage(1);
      }
      
      const snapshot = await getDocs(usersQuery);
      
      if (snapshot.empty) {
        setUsers([]);
        setHasMore(false);
        return;
      }
      
      // Update pagination trackers
      setFirstDoc(snapshot.docs[0]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === USERS_PER_PAGE);
      
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      username: user.username || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'user'
    });
    openEditModal();
  };
  
  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      setLoading(true);
      
      const userRef = doc(db, 'users', editingUser.id);
      
      // Update the Firestore document
      await updateDoc(userRef, {
        name: editForm.name,
        username: editForm.username,
        phoneNumber: editForm.phoneNumber,
        role: editForm.role
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === editingUser.id 
            ? { 
                ...user, 
                name: editForm.name,
                username: editForm.username, 
                phoneNumber: editForm.phoneNumber,
                role: editForm.role
              } 
            : user
        )
      );
      
      showSuccess('User updated successfully');
      closeEditModal();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete user
  const handleDeleteUser = (userId) => {
    setDeleteUserId(userId);
    setDeleteConfirmation('');
    openDeleteModal();
  };
  
  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (deleteConfirmation !== 'delete') {
      showError('Please type "delete" to confirm');
      return;
    }
    
    if (!deleteUserId) return;
    
    try {
      setLoading(true);
      
      // Check if trying to delete self
      if (deleteUserId === currentUser.uid) {
        showError('You cannot delete your own account');
        return;
      }
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', deleteUserId));
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== deleteUserId));
      
      showSuccess('User deleted successfully');
      closeDeleteModal();
      setDeleteUserId(null);
      setDeleteConfirmation('');
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Table columns configuration
  const userColumns = [
    { key: 'name', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'role', label: 'Role' }
  ];

  // Action buttons for each row
  const renderActions = (user) => (
    <>
      <button 
        onClick={() => handleEditUser(user)} 
        className="btn btn-secondary"
        style={{ marginRight: '5px' }}
      >
        Edit
      </button>
      <button 
        onClick={() => handleDeleteUser(user.id)} 
        className="btn btn-danger"
      >
        Delete
      </button>
    </>
  );
  
  return (
    <div className="dashboard-container">
      <DashboardHeader
        title="User Management"
        links={[
          { to: "/admin", label: "Dashboard" },
          { to: "/admin/events", label: "Manage Events" }
        ]}
        onLogout={handleLogout}
      />
      
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}
      
      <DataCard title="User List">
        {loading && !isEditModalOpen && !isDeleteModalOpen ? (
          <div>Loading users...</div>
        ) : (
          <>
            <DataTable
              columns={userColumns}
              data={users}
              emptyMessage="No users found"
              actions={renderActions}
            />
            
            <div className="pagination">
              <button 
                onClick={() => fetchUsers('prev')} 
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span style={{ margin: '0 10px' }}>Page {page}</span>
              <button 
                onClick={() => fetchUsers('next')} 
                disabled={!hasMore}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </>
        )}
      </DataCard>
      
      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        title="Edit User"
        onClose={closeEditModal}
        footer={
          <>
            <button onClick={closeEditModal} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveEdit} className="btn">Save Changes</button>
          </>
        }
      >
        <form>
          <FormField
            id="name"
            label="Name"
            type="text"
            value={editForm.name}
            onChange={(e) => updateForm('name', e.target.value)}
          />
          
          <FormField
            id="username"
            label="Username"
            type="text"
            value={editForm.username}
            onChange={(e) => updateForm('username', e.target.value)}
          />
          
          <FormField
            id="phoneNumber"
            label="Phone Number"
            type="tel"
            value={editForm.phoneNumber}
            onChange={(e) => updateForm('phoneNumber', e.target.value)}
          />
          
          <FormField
            id="role"
            label="Role"
            type="select"
            value={editForm.role}
            onChange={(e) => updateForm('role', e.target.value)}
            options={roleOptions}
          />
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete User"
        onClose={closeDeleteModal}
        footer={
          <>
            <button onClick={closeDeleteModal} className="btn btn-secondary">Cancel</button>
            <button onClick={handleConfirmDelete} className="btn btn-danger">Confirm Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        <p>Please type "delete" to confirm:</p>
        <FormField
          type="text"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default UserManagement;