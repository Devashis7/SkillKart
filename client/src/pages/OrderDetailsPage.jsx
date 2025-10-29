import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FilePreview from '../components/FilePreview';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.order);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      await fetchOrderDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const submitDelivery = async () => {
    try {
      setActionLoading(true);
      
      if (deliveryFiles.length === 0) {
        setError('Please select at least one file to upload');
        setActionLoading(false);
        return;
      }

      // Use the uploadDelivery method from api service
      await api.uploadDelivery(id, deliveryFiles);

      await fetchOrderDetails();
      setDeliveryFiles([]);
      setDeliveryMessage('');
    } catch (err) {
      setError(err.message || 'Failed to submit delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionFeedback.trim()) {
      setError('Please provide feedback for the revision request');
      return;
    }

    try {
      setActionLoading(true);
      await api.requestRevision(id, { feedback: revisionFeedback });
      await fetchOrderDetails();
      setShowRevisionModal(false);
      setRevisionFeedback('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request revision');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      booked: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      in_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      revision_requested: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const canAcceptOrder = () => {
    return user?.role === 'student' && order?.status === 'booked';
  };

  const canStartProgress = () => {
    return user?.role === 'student' && order?.status === 'accepted';
  };

  const canSubmitDelivery = () => {
    return user?.role === 'student' && order?.status === 'in_progress';
  };

  const canCompleteOrder = () => {
    return user?.role === 'client' && order?.status === 'in_review';
  };

  const canRequestRevision = () => {
    return user?.role === 'client' && order?.status === 'in_review';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={user?.role === 'student' ? '/student-dashboard' : '/client-dashboard'}
            className="text-primary-600 hover:text-primary-500 mb-4 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Order #{order._id.slice(-8)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <div className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {order.gigId?.title || 'Order'}
                  </h2>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{order.price?.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Ordered On</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Deadline</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.deadline ? 
                      new Date(order.deadline).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 
                      'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {user?.role === 'student' ? 'Client' : 'Freelancer'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.role === 'student' ? 
                      order.clientId?.name || 'Unknown Client' : 
                      order.studentId?.name || 'Unknown Freelancer'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.updatedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Instructions */}
            {order.instructions && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Instructions</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {order.instructions}
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Section - For Students */}
            {user?.role === 'student' && canSubmitDelivery() && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submit Delivery</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Files
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setDeliveryFiles(Array.from(e.target.files))}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100
                        dark:file:bg-primary-900 dark:file:text-primary-300"
                    />
                    {deliveryFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {deliveryFiles.length} file(s) selected
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Message (Optional)
                    </label>
                    <textarea
                      value={deliveryMessage}
                      onChange={(e) => setDeliveryMessage(e.target.value)}
                      placeholder="Add any notes about your delivery..."
                      rows={4}
                      className="input w-full"
                    />
                  </div>

                  <button
                    onClick={submitDelivery}
                    disabled={actionLoading || deliveryFiles.length === 0}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Delivery'}
                  </button>
                </div>
              </div>
            )}

            {/* Delivered Files */}
            {order.deliveryFiles && order.deliveryFiles.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivered Files</h3>
                <FilePreview files={order.deliveryFiles} />
                {order.deliveryMessage && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Message:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.deliveryMessage}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div className="space-y-3">
                {canAcceptOrder() && (
                  <button
                    onClick={() => updateOrderStatus('accepted')}
                    disabled={actionLoading}
                    className="w-full btn btn-primary"
                  >
                    Accept Order
                  </button>
                )}

                {canStartProgress() && (
                  <button
                    onClick={() => updateOrderStatus('in_progress')}
                    disabled={actionLoading}
                    className="w-full btn btn-primary"
                  >
                    Start Working
                  </button>
                )}

                {canCompleteOrder() && (
                  <button
                    onClick={() => updateOrderStatus('completed')}
                    disabled={actionLoading}
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as Complete
                  </button>
                )}

                {canRequestRevision() && (
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    disabled={actionLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Request Revision
                  </button>
                )}

                {order.status === 'booked' && (
                  <button
                    onClick={() => updateOrderStatus('cancelled')}
                    disabled={actionLoading}
                    className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Order Progress */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Progress</h3>
              <div className="space-y-4">
                {[
                  { status: 'booked', label: 'Order Placed', icon: '📋' },
                  { status: 'accepted', label: 'Order Accepted', icon: '✅' },
                  { status: 'in_progress', label: 'Work in Progress', icon: '⚡' },
                  { status: 'in_review', label: 'Under Review', icon: '👀' },
                  { status: 'completed', label: 'Completed', icon: '🎉' }
                ].map((step, index) => {
                  const isCompleted = getStatusIndex(order.status) >= index;
                  const isCurrent = getStatusIndex(order.status) === index;
                  
                  return (
                    <div key={step.status} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        isCompleted 
                          ? 'bg-primary-600 text-white' 
                          : isCurrent
                          ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? '✓' : step.icon}
                      </div>
                      <span className={`ml-3 text-sm ${
                        isCompleted || isCurrent 
                          ? 'text-gray-900 dark:text-white font-medium' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gig Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gig Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.gigId?.category || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Delivery Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.gigId?.deliveryTime ? `${order.gigId.deliveryTime} days` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Revisions</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.gigId?.revisions || 0} included
                  </p>
                </div>
                {order.gigId && (
                  <Link
                    to={`/gigs/${order.gigId._id}`}
                    className="inline-flex text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    View Original Gig →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Request Revision
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide detailed feedback explaining what changes you'd like the freelancer to make.
            </p>
            <textarea
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              placeholder="Describe the changes needed..."
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionFeedback('');
                  setError(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={actionLoading || !revisionFeedback.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Requesting...' : 'Request Revision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get status index for progress tracking
const getStatusIndex = (status) => {
  const statuses = ['booked', 'accepted', 'in_progress', 'in_review', 'completed'];
  return statuses.indexOf(status);
};

export default OrderDetailsPage;