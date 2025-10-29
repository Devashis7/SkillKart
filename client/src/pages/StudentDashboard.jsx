import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useApi';
import api from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [gigs, setGigs] = useState([]);
  const [gigsLoading, setGigsLoading] = useState(true);
  const [gigFilter, setGigFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [contactRequests, setContactRequests] = useState([]);
  const [contactRequestsLoading, setContactRequestsLoading] = useState(true);
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useOrders(user?._id, 'student');
  
  // Client Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  
  const orders = ordersData?.orders || [];

  useEffect(() => {
    fetchStudentGigs();
    fetchContactRequests();
  }, [user]);

  const fetchStudentGigs = async () => {
    try {
      setGigsLoading(true);
      // Fetch student's own gigs (including pending ones)
      const response = await api.getMyGigs();
      setGigs(response.gigs || []);
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setGigsLoading(false);
    }
  };

  const fetchContactRequests = async () => {
    try {
      setContactRequestsLoading(true);
      const response = await api.getReceivedContactRequests();
      setContactRequests(response.contactRequests || []);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    } finally {
      setContactRequestsLoading(false);
    }
  };

  const markContactAsRead = async (requestId) => {
    try {
      await api.markContactRequestAsRead(requestId);
      fetchContactRequests(); // Refresh the list
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  const openReviewModal = (order) => {
    setSelectedOrderForReview(order);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleSubmitClientReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    
    try {
      await api.createClientReview({
        orderId: selectedOrderForReview._id,
        rating: reviewRating,
        comment: reviewComment
      });
      
      alert('Thank you for your review!');
      setShowReviewModal(false);
      setSelectedOrderForReview(null);
      setReviewRating(5);
      setReviewComment('');
      refetchOrders(); // Refresh orders to update hasReviewedClient
    } catch (error) {
      alert(error.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Calculate real stats from actual data
  const stats = {
    totalGigs: gigs.length,
    approvedGigs: gigs.filter(g => g.status === 'approved').length,
    pendingGigs: gigs.filter(g => g.status === 'pending').length,
    activeOrders: orders.filter(o => ['booked', 'accepted', 'in_progress'].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalEarnings: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.price || 0), 0)
  };

  const recentOrders = orders.slice(0, 5); // Get recent 5 orders
  
  // Filter gigs based on selected filter
  const myGigs = gigFilter === 'all' 
    ? gigs 
    : gigs.filter(gig => gig.status === gigFilter);

  // Filter orders based on selected filter
  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === orderFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'booked': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'accepted': return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-300';
      case 'in_progress': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300';
      case 'in_review': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'revision_requested': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your gigs and track your earnings
              </p>
            </div>
            <Link
              to="/gigs/create"
              className="btn-primary"
            >
              Create New Gig
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'gigs', label: 'My Gigs' },
              { id: 'orders', label: 'Orders' },
              { id: 'messages', label: 'Messages', badge: contactRequests.filter(cr => !cr.isRead).length },
              { id: 'earnings', label: 'Earnings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved Gigs</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.approvedGigs}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Orders</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeOrders}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completedOrders}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pendingGigs}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Delivery
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentOrders.map(order => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.gigId?.title || 'Order'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{order.clientId?.name || 'Unknown Client'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                          {order.status === 'booked' && (
                            <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                              Needs attention
                            </div>
                          )}
                          {order.status === 'revision_requested' && (
                            <div className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                              Action required
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{order.price?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {order.deadline ? new Date(order.deadline).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* My Gigs Tab */}
        {activeTab === 'gigs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Gigs</h2>
              <Link to="/gigs/create" className="btn-primary">
                Create New Gig
              </Link>
            </div>

            {/* Gig Status Filters */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setGigFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  gigFilter === 'all'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All ({gigs.length})
              </button>
              <button
                onClick={() => setGigFilter('approved')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  gigFilter === 'approved'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Approved ({stats.approvedGigs})
              </button>
              <button
                onClick={() => setGigFilter('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  gigFilter === 'pending'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Pending ({stats.pendingGigs})
              </button>
            </div>

            {/* Info message for pending gigs */}
            {gigFilter === 'pending' && stats.pendingGigs > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Pending Approval
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      These gigs are waiting for admin approval. Once approved, they'll be visible to clients and you can start receiving orders.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGigs.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    {gigFilter === 'all' 
                      ? 'No gigs created yet. Create your first gig to get started!'
                      : `No ${gigFilter} gigs found.`
                    }
                  </p>
                  {gigFilter === 'all' && (
                    <Link to="/gigs/create" className="btn-primary mt-4 inline-flex">
                      Create Your First Gig
                    </Link>
                  )}
                </div>
              ) : myGigs.map(gig => (
                <div key={gig._id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{gig.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(gig.status)}`}>
                      {gig.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">₹{gig.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orders:</span>
                      <span className="font-medium">{gig.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="font-medium">{gig.rating > 0 ? `${gig.rating}/5` : 'No ratings yet'}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/gigs/${gig._id}/edit`}
                      className="flex-1 text-center btn-outline text-sm py-2"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/gig/${gig._id}`}
                      className="flex-1 text-center btn-primary text-sm py-2"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Orders</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {orders.length} total orders
              </div>
            </div>

            {/* Order Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'booked', label: 'New Orders' },
                { key: 'accepted', label: 'Accepted' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'in_review', label: 'Under Review' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map(filter => {
                const count = filter.key === 'all' ? orders.length : 
                             orders.filter(o => o.status === filter.key).length;
                
                return (
                  <button
                    key={filter.key}
                    onClick={() => setOrderFilter(filter.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      orderFilter === filter.key
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>
            
            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                              {orderFilter === 'all' ? 'No orders yet' : `No ${orderFilter.replace('_', ' ')} orders`}
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                              {orderFilter === 'all' ? 
                                'Orders will appear here when clients book your gigs' :
                                `Orders with ${orderFilter.replace('_', ' ')} status will appear here`
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredOrders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.gigId?.title || 'Order'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              #{order._id.slice(-8)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                              {order.clientId?.profilePic?.url ? (
                                <img 
                                  src={order.clientId.profilePic.url} 
                                  alt={order.clientId?.name || 'Client'} 
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {(order.clientId?.name || 'UC').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {order.clientId?.name || 'Unknown Client'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {order.clientId?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {order.status === 'booked' && (
                            <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                              Needs attention
                            </div>
                          )}
                          {order.status === 'revision_requested' && (
                            <div className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                              Action required
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{order.price?.toLocaleString() || 'N/A'}
                          </div>
                          {order.gigId?.price && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Base: ₹{order.gigId.price.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-gray-900 dark:text-white">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Ordered</div>
                            <div>{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                          </div>
                          {order.deadline && (
                            <div className="text-gray-900 dark:text-white mt-1">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Deadline</div>
                              <div className={`text-xs ${
                                new Date(order.deadline) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                              }`}>
                                {new Date(order.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col space-y-2">
                            <Link
                              to={`/orders/${order._id}`}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                            >
                              View Details
                            </Link>
                            {order.status === 'booked' && (
                              <span className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 cursor-pointer font-medium">
                                Quick Accept
                              </span>
                            )}
                            {order.status === 'completed' && !order.hasReviewedClient && (
                              <button
                                onClick={() => openReviewModal(order)}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-left"
                              >
                                Review Client
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orders Summary */}
            {orders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400">New Orders</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {orders.filter(o => o.status === 'booked').length}
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">In Progress</div>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {orders.filter(o => ['accepted', 'in_progress'].includes(o.status)).length}
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 dark:text-orange-400">Revisions</div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {orders.filter(o => o.status === 'revision_requested').length}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Under Review</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {orders.filter(o => o.status === 'in_review').length}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {orders.filter(o => o.status === 'completed').length}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Earnings Overview</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
            
            {/* Earnings Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{stats.totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{(() => {
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        return orders.filter(o => 
                          o.status === 'completed' && 
                          new Date(o.updatedAt).getMonth() === currentMonth &&
                          new Date(o.updatedAt).getFullYear() === currentYear
                        ).reduce((sum, o) => sum + (o.price || 0), 0).toLocaleString();
                      })()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payment</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      ₹{orders.filter(o => ['in_progress', 'in_review', 'accepted'].includes(o.status))
                        .reduce((sum, o) => sum + (o.price || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg per Order</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ₹{stats.completedOrders > 0 ? 
                        Math.round(stats.totalEarnings / stats.completedOrders).toLocaleString() : 
                        '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Chart Placeholder */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Earnings Trend</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Earnings chart coming soon</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Track your earnings growth over time</p>
              </div>
            </div>

            {/* Recent Earnings */}
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Earnings</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Last 10 transactions
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders
                      .filter(o => o.status === 'completed')
                      .slice(0, 10)
                      .map(order => (
                        <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.gigId?.title || 'Order'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              #{order._id.slice(-8)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.clientId?.name || 'Unknown Client'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                              +₹{order.price?.toLocaleString() || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                
                {orders.filter(o => o.status === 'completed').length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No earnings yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Complete your first order to start earning
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Earnings Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">Stripe</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">100%</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    All payments are processed securely through Stripe
                  </p>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Earning Gigs</h3>
                <div className="space-y-3">
                  {(() => {
                    const gigEarnings = {};
                    orders.filter(o => o.status === 'completed').forEach(order => {
                      const gigTitle = order.gigId?.title || 'Unknown Gig';
                      gigEarnings[gigTitle] = (gigEarnings[gigTitle] || 0) + (order.price || 0);
                    });
                    
                    return Object.entries(gigEarnings)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([title, amount], index) => (
                        <div key={title} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 mr-3">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white truncate">
                              {title}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            ₹{amount.toLocaleString()}
                          </span>
                        </div>
                      ));
                  })()}
                  
                  {Object.keys(orders.filter(o => o.status === 'completed').reduce((acc, order) => {
                    const gigTitle = order.gigId?.title || 'Unknown Gig';
                    acc[gigTitle] = true;
                    return acc;
                  }, {})).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No completed orders yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Requests</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {contactRequests.filter(cr => !cr.isRead).length} unread messages
              </div>
            </div>

            {contactRequestsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : contactRequests.length === 0 ? (
              <div className="card p-12">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    When clients contact you about projects, you'll see their messages here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {contactRequests.map((request) => {
                  const metadata = request.metadata || {};
                  return (
                    <div 
                      key={request._id} 
                      className={`card p-6 ${!request.isRead ? 'border-l-4 border-primary-500' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mr-2">
                              {metadata.subject || 'Contact Request'}
                            </h3>
                            {!request.isRead && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                                New
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {metadata.clientName || 'Client'}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(request.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        {!request.isRead && (
                          <button
                            onClick={() => markContactAsRead(request._id)}
                            className="ml-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {metadata.message || request.message}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {metadata.projectType && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Project Type:</span>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {metadata.projectType}
                            </p>
                          </div>
                        )}
                        {metadata.budget && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              ₹{metadata.budget.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {metadata.deadline && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Deadline:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(metadata.deadline).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {metadata.clientEmail && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Email:</span>
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {metadata.clientEmail}
                            </p>
                          </div>
                        )}
                      </div>

                      {metadata.gigId && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            to={`/gigs/${metadata.gigId}`}
                            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View related gig
                          </Link>
                        </div>
                      )}

                      <div className="mt-4 flex space-x-3">
                        <a
                          href={`mailto:${metadata.clientEmail}?subject=Re: ${metadata.subject}`}
                          className="btn-primary text-sm"
                        >
                          Reply via Email
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Client Modal */}
      {showReviewModal && selectedOrderForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Client</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedOrderForReview.clientId?.name || 'Client'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Order #{selectedOrderForReview._id.slice(-8)}
              </p>
            </div>

            <form onSubmit={handleSubmitClientReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= reviewRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        fill={star <= reviewRating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {reviewRating} {reviewRating === 1 ? 'star' : 'stars'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="4"
                  placeholder="Share your experience working with this client..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={reviewSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;