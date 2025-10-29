import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useApi';
import api from '../services/api';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [orderFilter, setOrderFilter] = useState('all');
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useOrders(user?._id, 'client');
  const orders = ordersData?.orders || [];
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchNotifications();
    if (activeTab === 'reviews') {
      fetchMyReviews();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchMyReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await api.getClientReviews(user._id);
      setReviews(response.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      refetchOrders();
    } catch (error) {
      alert('Error updating order status: ' + error.message);
    }
  };

  const handleRequestRevision = async (orderId, revisionText) => {
    try {
      await api.requestRevision(orderId, { revisionRequest: revisionText });
      refetchOrders();
      alert('Revision requested successfully!');
    } catch (error) {
      alert('Error requesting revision: ' + error.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.createReview({
        orderId: selectedOrder._id,
        gigId: selectedOrder.gigId._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      setSelectedOrder(null);
      refetchOrders();
      alert('Review submitted successfully!');
    } catch (error) {
      alert('Error submitting review: ' + error.message);
    }
  };

  // Calculate real stats from actual data
  const stats = {
    activeOrders: orders.filter(o => ['booked', 'accepted', 'in_progress', 'in_review'].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalSpent: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.price || 0), 0)
  };

  const recentOrders = orders.slice(0, 5); // Get recent 5 orders

  // Filter orders based on selected filter
  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === orderFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'accepted': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_review': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
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
                Manage your orders and find new talent
              </p>
            </div>
            <Link
              to="/gigs"
              className="btn-primary"
            >
              Browse Gigs
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
              { id: 'orders', label: 'My Orders' },
              { id: 'reviews', label: 'Reviews' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">₹{stats.totalSpent.toLocaleString()}</p>
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
                        Freelancer
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
                    {ordersLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No orders yet. <Link to="/gigs" className="text-primary-600 hover:underline">Browse gigs</Link> to get started!
                        </td>
                      </tr>
                    ) : recentOrders.map(order => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.gigId?.title || 'Order'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                              {order.studentId?.profilePic?.url ? (
                                <img 
                                  src={order.studentId.profilePic.url} 
                                  alt={order.studentId?.name || 'Freelancer'} 
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {(order.studentId?.name || 'UF').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.studentId?.name || 'Unknown Freelancer'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{order.price?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/gigs" className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Browse Gigs</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Find the perfect freelancer</p>
                  </div>
                </div>
              </Link>

              <Link to="/orders" className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Orders</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track your projects</p>
                  </div>
                </div>
              </Link>

              <Link to="/help" className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Get Help</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Support & FAQ</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Orders</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {orders.length} total orders
                </div>
                <Link to="/gigs" className="btn btn-primary">
                  Browse Gigs
                </Link>
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
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Freelancer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Delivery
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                              {orderFilter === 'all' ? 'No orders yet' : `No ${orderFilter.replace('_', ' ')} orders`}
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                              {orderFilter === 'all' ? (
                                <>
                                  <Link to="/gigs" className="text-primary-600 hover:underline">Browse gigs</Link> to place your first order!
                                </>
                              ) : (
                                `Orders with ${orderFilter.replace('_', ' ')} status will appear here`
                              )}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredOrders.map(order => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.gigId?.title || 'Order'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                              {order.studentId?.profilePic?.url ? (
                                <img 
                                  src={order.studentId.profilePic.url} 
                                  alt={order.studentId?.name || 'Freelancer'} 
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {(order.studentId?.name || 'UF').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.studentId?.name || 'Unknown Freelancer'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{order.price?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/orders/${order._id}`}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 text-xs font-medium block mb-2"
                          >
                            View Details
                          </Link>
                          {order.status === 'in_review' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleOrderStatusUpdate(order._id, 'completed')}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  const revision = prompt('What revision would you like?');
                                  if (revision) handleRequestRevision(order._id, revision);
                                }}
                                className="text-yellow-600 hover:text-yellow-900 text-xs"
                              >
                                Revise
                              </button>
                            </div>
                          )}
                          {order.status === 'completed' && !order.hasReviewed && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowReviewModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-900 text-xs"
                            >
                              Review
                            </button>
                          )}
                          {order.status === 'completed' && order.hasReviewed && (
                            <span className="text-gray-400 text-xs">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Reviews</h2>
            
            {reviewsLoading ? (
              <div className="card p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="card p-6">
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  You haven't left any reviews yet. Complete an order to leave a review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {review.gigId?.title || 'Gig'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Freelancer: {review.revieweeId?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/gig/${review.gigId?._id}`}
                        className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
                      >
                        View Gig
                      </Link>
                    </div>
                    
                    {/* Rating Stars */}
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.598-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {review.rating} / 5
                      </span>
                    </div>
                    
                    {/* Review Comment */}
                    {review.comment && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          "{review.comment}"
                        </p>
                      </div>
                    )}
                    
                    {/* Order Info */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Order Total: ₹{review.orderId?.price?.toLocaleString() || 'N/A'}</span>
                        <span>Ordered: {review.orderId?.createdAt ? new Date(review.orderId.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Review Order: {selectedOrder.gigId?.title}
            </h3>
            
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Rating
                </label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Share your experience..."
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedOrder(null);
                    setReviewForm({ rating: 5, comment: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;