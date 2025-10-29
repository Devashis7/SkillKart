import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingGigs, setPendingGigs] = useState([]);
  const [allGigs, setAllGigs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGigs: 0,
    pendingGigs: 0,
    totalOrders: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    contactRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1
  });
  const [orderFilters, setOrderFilters] = useState({
    search: '',
    status: '',
    page: 1
  });
  const [gigFilters, setGigFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1
  });
  const [notificationFilters, setNotificationFilters] = useState({
    search: '',
    type: '',
    unreadOnly: false,
    page: 1
  });
  const [notificationsPagination, setNotificationsPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });
  const [gigsPerPage] = useState(5);
  const [usersPagination, setUsersPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all gigs (admin can see all)
      const gigsResponse = await api.getAdminGigs();
      const fetchedGigs = gigsResponse.gigs || [];
      const pending = fetchedGigs.filter(gig => gig.status === 'pending');
      setAllGigs(fetchedGigs);
      setPendingGigs(pending);
      
      // Fetch user stats
      const usersResponse = await api.getAllUsers();
      const totalUsers = usersResponse.total || 0;
      
      // Fetch order stats
      const orderStatsResponse = await api.getOrderStats();
      const totalOrders = orderStatsResponse.stats?.totalOrders || 0;
      
      // Fetch notification stats
      const notificationStatsResponse = await api.getNotificationStats();
      const notificationStats = notificationStatsResponse.stats || {};
      
      // Update stats
      setStats({
        totalUsers,
        totalGigs: fetchedGigs.length,
        pendingGigs: pending.length,
        totalOrders,
        totalNotifications: notificationStats.totalNotifications || 0,
        unreadNotifications: notificationStats.unreadNotifications || 0,
        contactRequests: notificationStats.contactRequests || 0
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('Fetching users with filters:', userFilters); // Debug log
      const response = await api.getAllUsers(userFilters);
      console.log('Users API response:', response); // Debug log
      setAllUsers(response.users || []);
      setUsersPagination({
        total: response.total || 0,
        pages: response.pages || 0,
        currentPage: response.page || 1
      });
      console.log('Users state updated with', response.users?.length || 0, 'users'); // Debug log
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch users when filters change
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'users') {
      fetchUsers();
    }
  }, [user, activeTab, userFilters]);

  // Fetch orders when tab is active
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab, orderFilters]);

  // Fetch notifications when tab is active
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [user, activeTab, notificationFilters]);

  const fetchOrders = async () => {
    try {
      setUsersLoading(true); // Reuse loading state
      const params = new URLSearchParams();
      if (orderFilters.search) params.append('search', orderFilters.search);
      if (orderFilters.status) params.append('status', orderFilters.status);
      params.append('page', orderFilters.page);
      params.append('limit', 10);

      const response = await api.getAdminOrders(params.toString());
      setAllOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error fetching orders: ' + error.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserFilterChange = (key, value) => {
    setUserFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const fetchNotifications = async () => {
    try {
      setUsersLoading(true); // Reuse loading state
      const filters = {
        page: notificationFilters.page,
        limit: 10
      };
      
      if (notificationFilters.search) filters.search = notificationFilters.search;
      if (notificationFilters.type) filters.type = notificationFilters.type;
      if (notificationFilters.unreadOnly) filters.unreadOnly = 'true';

      const response = await api.getAdminNotifications(filters);
      setAllNotifications(response.notifications || []);
      setNotificationsPagination({
        total: response.total || 0,
        pages: response.pages || 0,
        currentPage: response.page || 1
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      alert('Error fetching notifications: ' + error.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOrderFilterChange = (key, value) => {
    setOrderFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const handleNotificationFilterChange = (key, value) => {
    setNotificationFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsReadAdmin(notificationId);
      
      // Update the local state to reflect the change
      setAllNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update the stats to reflect the change
      setStats(prev => ({
        ...prev,
        unreadNotifications: Math.max(0, prev.unreadNotifications - 1)
      }));

      alert('Notification marked as read successfully!');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Error marking notification as read: ' + error.message);
    }
  };

  const handleGigFilterChange = (key, value) => {
    setGigFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  // Filter gigs based on search and filter criteria
  const filteredGigs = allGigs.filter(gig => {
    const matchesSearch = !gigFilters.search || 
      gig.title.toLowerCase().includes(gigFilters.search.toLowerCase()) ||
      gig.description.toLowerCase().includes(gigFilters.search.toLowerCase()) ||
      gig.studentId?.name?.toLowerCase().includes(gigFilters.search.toLowerCase());
    
    const matchesCategory = !gigFilters.category || gig.category === gigFilters.category;
    const matchesStatus = !gigFilters.status || gig.status === gigFilters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination for gigs
  const totalGigPages = Math.ceil(filteredGigs.length / gigsPerPage);
  const startGigIndex = (gigFilters.page - 1) * gigsPerPage;
  const endGigIndex = startGigIndex + gigsPerPage;
  const paginatedGigs = filteredGigs.slice(startGigIndex, endGigIndex);

  const handleGigStatusUpdate = async (gigId, status) => {
    try {
      await api.updateGigStatus(gigId, status);
      alert(`Gig ${status} successfully!`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      alert('Error updating gig status: ' + error.message);
    }
  };

  const handleDeleteGig = async (gigId, gigTitle) => {
    setConfirmAction({
      type: 'deleteGig',
      gigId,
      message: `Are you sure you want to delete the gig "${gigTitle}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await api.deleteGig(gigId);
          console.log('Gig delete response:', response); // Debug log
          alert('Gig deleted successfully!');
          await fetchAdminData(); // Refresh data
          console.log('Admin data refetched after gig delete'); // Debug log
          setShowConfirmModal(false);
        } catch (error) {
          console.error('Error deleting gig:', error); // Debug log
          alert('Error deleting gig: ' + error.message);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleUserStatusChange = async (userId, status) => {
    try {
      const response = await api.suspendUser(userId, status);
      console.log('Status change response:', response); // Debug log
      alert(`User ${status === 'suspended' ? 'suspended' : 'activated'} successfully!`);
      await fetchUsers(); // Refresh users list
      console.log('Users refetched after status change'); // Debug log
    } catch (error) {
      console.error('Error updating user status:', error); // Debug log
      alert('Error updating user status: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    setConfirmAction({
      type: 'delete',
      userId,
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await api.deleteUser(userId);
          console.log('Delete response:', response); // Debug log
          alert('User deleted successfully!');
          await fetchUsers(); // Make sure it waits
          console.log('Users refetched after delete'); // Debug log
          setShowConfirmModal(false);
        } catch (error) {
          console.error('Error deleting user:', error); // Debug log
          alert('Error deleting user: ' + error.message);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleRoleChange = async (userId, newRole) => {
    setConfirmAction({
      type: 'role',
      userId,
      newRole,
      message: `Are you sure you want to change this user's role to ${newRole}?`,
      onConfirm: async () => {
        try {
          const response = await api.updateUserRole(userId, newRole);
          console.log('Role change response:', response); // Debug log
          alert('User role updated successfully!');
          await fetchUsers(); // Make sure it waits
          console.log('Users refetched after role change'); // Debug log
          setShowConfirmModal(false);
        } catch (error) {
          console.error('Error updating user role:', error); // Debug log
          alert('Error updating user role: ' + error.message);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleViewUser = (userData) => {
    setSelectedUser(userData);
    setShowUserModal(true);
  };



  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Only administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage users, gigs, and platform operations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div 
            className="card p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setActiveTab('all-gigs')}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5M5 19H3m2 0v-4a1 1 0 011-1h2a1 1 0 011 1v4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Gigs</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalGigs}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Approval</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pendingGigs}</p>
              </div>
            </div>
          </div>

          <div 
            className="card p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setActiveTab('orders')}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'gigs', 'all-gigs', 'orders', 'users', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab === 'all-gigs' ? 'All Gigs' : tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Platform Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Activity</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Orders:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Live Gigs:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalGigs - stats.pendingGigs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Users:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalUsers}</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-4">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.598 0L4.216 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Actions</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gig Approvals:</span>
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{stats.pendingGigs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Unread Notifications:</span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{stats.unreadNotifications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contact Requests:</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{stats.contactRequests}</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Platform Status:</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Notifications:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalNotifications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Read Rate:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.totalNotifications > 0 ? (((stats.totalNotifications - stats.unreadNotifications) / stats.totalNotifications * 100).toFixed(1)) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pending Reviews
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {stats.pendingGigs} gigs waiting for approval
                </p>
                <button
                  onClick={() => setActiveTab('gigs')}
                  className="btn-primary w-full"
                >
                  Review Gigs
                </button>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Orders Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  View and manage {stats.totalOrders} active orders
                </p>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="btn-primary w-full"
                >
                  Manage Orders
                </button>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  User Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Manage {stats.totalUsers} user accounts
                </p>
                <button
                  onClick={() => setActiveTab('users')}
                  className="btn-primary w-full"
                >
                  Manage Users
                </button>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {stats.unreadNotifications} unread notifications
                </p>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="btn-primary w-full"
                >
                  View Notifications
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gigs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gig Management</h2>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {stats.pendingGigs} pending approval
              </div>
            </div>

            <div className="space-y-4">
              {pendingGigs.map(gig => (
                <div key={gig._id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                          {gig.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                          {gig.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        by {gig.studentId?.name || 'Unknown Student'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Category: {gig.category}</span>
                        <span>Price: ₹{gig.price.toLocaleString()}</span>
                        <span>Delivery: {gig.deliveryTime} days</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {gig.description}
                  </p>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleDeleteGig(gig._id, gig.title)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleGigStatusUpdate(gig._id, 'rejected')}
                      className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-md transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleGigStatusUpdate(gig._id, 'approved')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}

              {pendingGigs.length === 0 && (
                <div className="card p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All caught up!</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No gigs pending approval at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Users: {usersPagination.total}
              </div>
            </div>

            {/* Filters */}
            <div className="card p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Users
                  </label>
                  <input
                    type="text"
                    value={userFilters.search}
                    onChange={(e) => handleUserFilterChange('search', e.target.value)}
                    placeholder="Search by name or email..."
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={userFilters.role}
                    onChange={(e) => handleUserFilterChange('role', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">All Roles</option>
                    <option value="student">Students</option>
                    <option value="client">Clients</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={userFilters.status}
                    onChange={(e) => handleUserFilterChange('status', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setUserFilters({ search: '', role: '', status: '', page: 1 })}
                    className="btn-outline w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {usersLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : allUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No users found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      allUsers.map((userData) => (
                        <tr key={userData._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {userData.profilePic?.url ? (
                                  <img className="h-10 w-10 rounded-full object-cover" src={userData.profilePic.url} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {userData.name?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {userData.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {userData.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={userData.role}
                              onChange={(e) => handleRoleChange(userData._id, e.target.value)}
                              className="text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              disabled={userData._id === user?.id} // Prevent admin from changing their own role
                            >
                              <option value="student">Student</option>
                              <option value="client">Client</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userData.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {userData.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(userData.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewUser(userData)}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              View
                            </button>
                            {userData.status === 'active' ? (
                              <button
                                onClick={() => handleUserStatusChange(userData._id, 'suspended')}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                disabled={userData._id === user?.id} // Prevent admin from suspending themselves
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserStatusChange(userData._id, 'active')}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(userData._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              disabled={userData._id === user?.id} // Prevent admin from deleting themselves
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersPagination.pages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handleUserFilterChange('page', Math.max(userFilters.page - 1, 1))}
                        disabled={userFilters.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handleUserFilterChange('page', Math.min(userFilters.page + 1, usersPagination.pages))}
                        disabled={userFilters.page === usersPagination.pages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Showing page <span className="font-medium">{userFilters.page}</span> of{' '}
                          <span className="font-medium">{usersPagination.pages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          {Array.from({ length: Math.min(usersPagination.pages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handleUserFilterChange('page', pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  userFilters.page === pageNum
                                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Orders: {allOrders.length}
              </div>
            </div>

            {/* Filters */}
            <div className="card p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Orders
                  </label>
                  <input
                    type="text"
                    value={orderFilters.search}
                    onChange={(e) => handleOrderFilterChange('search', e.target.value)}
                    placeholder="Search by gig title, user name..."
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={orderFilters.status}
                    onChange={(e) => handleOrderFilterChange('status', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">All Statuses</option>
                    <option value="booked">Booked</option>
                    <option value="accepted">Accepted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="revision_requested">Revision Requested</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setOrderFilters({
                        search: '',
                        status: '',
                        page: 1
                      });
                    }}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Loading orders...</p>
                </div>
              ) : allOrders.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {orderFilters.search || orderFilters.status ? 'Try adjusting your filters.' : 'No orders have been placed yet.'}
                  </p>
                </div>
              ) : (
                allOrders.map(order => (
                  <div key={order._id} className="card p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Order Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {order.gigId?.title || 'Unknown Gig'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            order.status === 'in_review' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Order ID: <span className="font-mono">{order._id}</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Price: <span className="font-semibold text-gray-900 dark:text-white">₹{order.price}</span>
                        </p>
                      </div>

                      {/* Client Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client</h4>
                        <div className="flex items-center space-x-2">
                          {order.clientId?.profilePic?.url ? (
                            <img className="h-8 w-8 rounded-full object-cover" src={order.clientId.profilePic.url} alt="" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {order.clientId?.name?.charAt(0) || 'C'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.clientId?.name || 'Unknown Client'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.clientId?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Student Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student</h4>
                        <div className="flex items-center space-x-2">
                          {order.studentId?.profilePic?.url ? (
                            <img className="h-8 w-8 rounded-full object-cover" src={order.studentId.profilePic.url} alt="" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {order.studentId?.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.studentId?.name || 'Unknown Student'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.studentId?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Created:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Not set'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
                            {order.paymentId || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      {order.instructions && (
                        <div className="mt-3">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Instructions:</span>
                          <p className="text-gray-900 dark:text-white text-sm mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {order.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'all-gigs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Gigs Management</h2>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Showing: {filteredGigs.length} / {stats.totalGigs} gigs
              </div>
            </div>

            {/* Filters */}
            <div className="card p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Gigs
                  </label>
                  <input
                    type="text"
                    value={gigFilters.search}
                    onChange={(e) => handleGigFilterChange('search', e.target.value)}
                    placeholder="Search by title, description, or student name..."
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={gigFilters.category}
                    onChange={(e) => handleGigFilterChange('category', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">All Categories</option>
                    <option value="Design">Design</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Writing & Translation">Writing & Translation</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Video & Animation">Video & Animation</option>
                    <option value="Music & Audio">Music & Audio</option>
                    <option value="Programming">Programming</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={gigFilters.status}
                    onChange={(e) => handleGigFilterChange('status', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setGigFilters({
                        search: '',
                        category: '',
                        status: '',
                        page: 1
                      });
                    }}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredGigs.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5M5 19H3m2 0v-4a1 1 0 011-1h2a1 1 0 011 1v4z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No gigs found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {gigFilters.search || gigFilters.category || gigFilters.status ? 'Try adjusting your filters.' : 'No gigs have been created yet.'}
                  </p>
                </div>
              ) : (
                paginatedGigs.map(gig => (
                <div key={gig._id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                          {gig.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          gig.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          gig.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {gig.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        by {gig.studentId?.name || 'Unknown Student'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Category: {gig.category}</span>
                        <span>Price: ₹{gig.price.toLocaleString()}</span>
                        <span>Delivery: {gig.deliveryTime} days</span>
                        <span>Rating: {gig.averageRating.toFixed(1)}/5 ({gig.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {gig.description}
                  </p>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleDeleteGig(gig._id, gig.title)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                    {gig.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleGigStatusUpdate(gig._id, 'rejected')}
                          className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-md transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleGigStatusUpdate(gig._id, 'approved')}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                        >
                          Approve
                        </button>
                      </>
                    )}
                    {gig.status === 'rejected' && (
                      <button
                        onClick={() => handleGigStatusUpdate(gig._id, 'approved')}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {gig.status === 'approved' && (
                      <button
                        onClick={() => handleGigStatusUpdate(gig._id, 'rejected')}
                        className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-md transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {filteredGigs.length > gigsPerPage && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 mt-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handleGigFilterChange('page', Math.max(1, gigFilters.page - 1))}
                    disabled={gigFilters.page === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleGigFilterChange('page', Math.min(totalGigPages, gigFilters.page + 1))}
                    disabled={gigFilters.page === totalGigPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{startGigIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endGigIndex, filteredGigs.length)}</span> of{' '}
                      <span className="font-medium">{filteredGigs.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handleGigFilterChange('page', Math.max(1, gigFilters.page - 1))}
                        disabled={gigFilters.page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: Math.min(5, totalGigPages) }, (_, i) => {
                        let pageNum;
                        if (totalGigPages <= 5) {
                          pageNum = i + 1;
                        } else {
                          const start = Math.max(1, gigFilters.page - 2);
                          pageNum = start + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleGigFilterChange('page', pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              gigFilters.page === pageNum
                                ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                : 'text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleGigFilterChange('page', Math.min(totalGigPages, gigFilters.page + 1))}
                        disabled={gigFilters.page === totalGigPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
            <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications Management</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing: {allNotifications.length} / {notificationsPagination.total} | Unread: {stats.unreadNotifications}
                </div>
                {stats.unreadNotifications > 0 && (
                  <button
                    onClick={() => {
                      // Mark all currently displayed unread notifications as read
                      const unreadNotifications = allNotifications.filter(n => !n.isRead);
                      unreadNotifications.forEach(notification => {
                        handleMarkNotificationAsRead(notification._id);
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
            </div>            {/* Filters */}
            <div className="card p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Notifications
                  </label>
                  <input
                    type="text"
                    value={notificationFilters.search}
                    onChange={(e) => handleNotificationFilterChange('search', e.target.value)}
                    placeholder="Search by message or type..."
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={notificationFilters.type}
                    onChange={(e) => handleNotificationFilterChange('type', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">All Types</option>
                    <option value="gig_approved">Gig Approved</option>
                    <option value="order_booked">Order Booked</option>
                    <option value="order_accepted">Order Accepted</option>
                    <option value="order_in_progress">Order In Progress</option>
                    <option value="order_completed">Order Completed</option>
                    <option value="delivery_submitted">Delivery Submitted</option>
                    <option value="contact_request">Contact Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationFilters.unreadOnly}
                      onChange={(e) => handleNotificationFilterChange('unreadOnly', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show unread only</span>
                  </label>
                  {notificationFilters.unreadOnly && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {stats.unreadNotifications} unread
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setNotificationFilters({
                        search: '',
                        type: '',
                        unreadOnly: false,
                        page: 1
                      });
                    }}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Loading notifications...</p>
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 4v12a2 2 0 002 2h6l4-4V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {notificationFilters.search || notificationFilters.type ? 'Try adjusting your filters.' : 'No notifications have been created yet.'}
                  </p>
                </div>
              ) : (
                allNotifications.map(notification => (
                  <div key={notification._id} className="card p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Notification Icon */}
                        <div className={`p-2 rounded-full ${
                          notification.isRead 
                            ? 'bg-gray-100 dark:bg-gray-700' 
                            : 'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          {notification.type === 'gig_approved' && (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {notification.type.includes('order') && (
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          )}
                          {notification.type === 'contact_request' && (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          {!notification.type.includes('gig') && !notification.type.includes('order') && notification.type !== 'contact_request' && (
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                            </svg>
                          )}
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                              {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            {!notification.isRead && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                New
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'} mb-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>To: {notification.userId?.name || 'Unknown User'}</span>
                            <span>•</span>
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                            {notification.link && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 dark:text-blue-400">Has Link</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Read Status & Actions */}
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs font-medium ${
                          notification.isRead 
                            ? 'text-gray-500 dark:text-gray-400' 
                            : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {notification.isRead ? 'Read' : 'Unread'}
                        </span>
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkNotificationAsRead(notification._id)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {notificationsPagination.total > 10 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handleNotificationFilterChange('page', Math.max(1, notificationFilters.page - 1))}
                    disabled={notificationFilters.page === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleNotificationFilterChange('page', Math.min(notificationsPagination.pages, notificationFilters.page + 1))}
                    disabled={notificationFilters.page === notificationsPagination.pages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{((notificationFilters.page - 1) * 10) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(notificationFilters.page * 10, notificationsPagination.total)}</span> of{' '}
                      <span className="font-medium">{notificationsPagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handleNotificationFilterChange('page', Math.max(1, notificationFilters.page - 1))}
                        disabled={notificationFilters.page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: Math.min(5, notificationsPagination.pages) }, (_, i) => {
                        let pageNum;
                        if (notificationsPagination.pages <= 5) {
                          pageNum = i + 1;
                        } else {
                          const start = Math.max(1, notificationFilters.page - 2);
                          pageNum = start + i;
                        }
                        if (pageNum > notificationsPagination.pages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleNotificationFilterChange('page', pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              notificationFilters.page === pageNum
                                ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                : 'text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleNotificationFilterChange('page', Math.min(notificationsPagination.pages, notificationFilters.page + 1))}
                        disabled={notificationFilters.page === notificationsPagination.pages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
            )}

            {/* System Statistics */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotifications}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Notifications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.unreadNotifications}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.totalNotifications - stats.unreadNotifications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Read</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalNotifications > 0 ? (((stats.totalNotifications - stats.unreadNotifications) / stats.totalNotifications * 100).toFixed(1)) : 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Read Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Details
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                {selectedUser.profilePic?.url ? (
                  <img className="h-20 w-20 rounded-full object-cover" src={selectedUser.profilePic.url} alt="" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {selectedUser.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      selectedUser.role === 'student' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                      <span className="text-gray-900 dark:text-white font-mono text-xs">{selectedUser._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(selectedUser.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Performance Metrics
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedUser.averageRating || 0}/5 ⭐
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Reviews:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedUser.reviewCount || 0}
                      </span>
                    </div>
                    {selectedUser.role === 'student' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Earnings:</span>
                        <span className="text-gray-900 dark:text-white">
                          ₹{selectedUser.totalEarnings || 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={async () => {
                    setShowUserModal(false);
                    await handleUserStatusChange(selectedUser._id, selectedUser.status === 'active' ? 'suspended' : 'active');
                  }}
                  className={`flex-1 px-4 py-2 rounded-md font-medium ${
                    selectedUser.status === 'active'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  disabled={selectedUser._id === user?.id}
                >
                  {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                </button>
                <button
                  onClick={async () => {
                    setShowUserModal(false);
                    await handleDeleteUser(selectedUser._id);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                  disabled={selectedUser._id === user?.id}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Confirm Action
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {confirmAction.message}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;