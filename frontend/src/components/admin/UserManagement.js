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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        title="User Management"
        links={[
          { to: "/admin", label: "Dashboard" },
          { to: "/admin/events", label: "Manage Events" }
        ]}
        onLogout={handleLogout}
      />

      {alert.show && (
        <div className={`p-4 mb-6 rounded-lg font-medium flex items-center gap-2 ${alert.type === 'danger' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
          {alert.type === 'danger' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          )}
          {alert.message}
        </div>
      )}

      <DataCard title={<h3 className="text-lg font-bold text-gray-800 m-0">User List</h3>}>
        {loading && !isEditModalOpen && !isDeleteModalOpen ? (
          <div className="py-12 flex justify-center text-gray-500 font-medium">Loading users...</div>
        ) : (
          <>
            <DataTable
              columns={userColumns}
              data={users}
              emptyMessage="No users found"
              actions={renderActions}
            />

            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => fetchUsers('prev')}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers('next')}
                  disabled={!hasMore}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span>
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => fetchUsers('prev')}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                      {page}
                    </span>
                    <button
                      onClick={() => fetchUsers('next')}
                      disabled={!hasMore}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
            <button onClick={closeEditModal} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors w-full sm:w-auto">Cancel</button>
            <button onClick={handleSaveEdit} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto flex justify-center items-center">
              {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              Save Changes
            </button>
          </div>
        }
      >
        <form className="space-y-4">
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
            <button onClick={closeDeleteModal} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors w-full sm:w-auto">Cancel</button>
            <button onClick={handleConfirmDelete} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto disabled:opacity-50">Confirm Delete</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex gap-3">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div>
              <h4 className="font-bold text-red-900 mb-1">Warning: Destructive Action</h4>
              <p className="text-sm">Are you sure you want to delete this user? This action cannot be undone and will remove all their data.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Please type "delete" to confirm:</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="delete"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UserManagement;