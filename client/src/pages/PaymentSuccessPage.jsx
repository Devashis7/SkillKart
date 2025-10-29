import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing your payment...');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setMessage('Invalid payment session');
        return;
      }

      try {
        // Confirm payment and create order
        const response = await api.confirmPayment({ sessionId });
        
        setStatus('success');
        setMessage('Payment successful! Your order has been created.');
        setOrder(response.order);

        // Redirect to client dashboard after 3 seconds
        setTimeout(() => {
          navigate('/client-dashboard');
        }, 3000);

      } catch (error) {
        console.error('Payment confirmation error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to confirm payment. Please contact support.');
      }
    };

    confirmPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Processing Payment
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {message}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <svg
                  className="h-10 w-10 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              
              {order && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Order Details
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Order ID:</span>
                      <span className="font-mono text-xs">{order._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span className="font-semibold">₹{order.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Redirecting to your dashboard in 3 seconds...
              </p>

              <button
                onClick={() => navigate('/client-dashboard')}
                className="btn-primary w-full"
              >
                Go to Dashboard Now
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg
                  className="h-10 w-10 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Error
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/gigs')}
                  className="btn-primary w-full"
                >
                  Browse Gigs
                </button>
                <button
                  onClick={() => navigate('/client-dashboard')}
                  className="btn-outline w-full"
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                What's Next?
              </h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>• The freelancer will be notified about your order</li>
                <li>• Track your order status in the dashboard</li>
                <li>• You'll receive updates on order progress</li>
                <li>• Review the work once delivered</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
