import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGig } from '../hooks/useApi';
import api from '../services/api';

const BookGigPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: gigData, isLoading: gigLoading } = useGig(id);
  const gig = gigData?.gig;

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    instructions: '',
    deadline: '',
    contactInfo: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookGig = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'client') {
      alert('Only clients can book gigs');
      return;
    }

    try {
      setIsProcessing(true);

      // Create Stripe Checkout Session
      const paymentResponse = await api.createPaymentOrder({
        amount: gig.price,
        gigId: gig._id,
        instructions: formData.instructions,
        deadline: formData.deadline,
        contactInfo: formData.contactInfo
      });
      
      // Redirect to Stripe Checkout
      if (paymentResponse.url) {
        window.location.href = paymentResponse.url;
      } else {
        throw new Error('Payment URL not received');
      }
      
    } catch (error) {
      alert('Error booking gig: ' + error.message);
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please Login
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to be logged in to book a gig.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Only clients can book gigs.
          </p>
          <button
            onClick={() => navigate('/gigs')}
            className="btn-primary"
          >
            Browse Gigs
          </button>
        </div>
      </div>
    );
  }

  if (gigLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Gig Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The gig you're looking for doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => navigate('/gigs')}
            className="btn-primary"
          >
            Browse Gigs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/gig/${id}`)}
            className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gig
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Book This Gig
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Provide details for your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <form onSubmit={handleBookGig} className="space-y-6">
                {/* Gig Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Gig Summary
                  </h3>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-indigo-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                      <div className="text-lg font-bold text-primary-500 dark:text-primary-400">
                        {gig.category.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{gig.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        by {gig.studentId?.name || 'Unknown Student'}
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>₹{gig.price.toLocaleString()}</span>
                        <span>{gig.deliveryTime} day delivery</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Instructions *
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    className="input h-32"
                    placeholder="Describe your project requirements, expectations, and any specific details the freelancer should know..."
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Be as detailed as possible to ensure the best results
                  </p>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="input"
                    min={new Date(Date.now() + gig.deliveryTime * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum delivery time: {gig.deliveryTime} days
                  </p>
                </div>

                {/* Contact Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Information
                  </label>
                  <textarea
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    className="input h-20"
                    placeholder="Provide your contact details (email, phone) for project communication..."
                  />
                </div>

                {/* Terms */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Order Terms
                      </h3>
                      <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                        <li>Payment will be processed securely through Stripe</li>
                        <li>You can request revisions during the review phase</li>
                        <li>Full refund available if work is not delivered</li>
                        <li>Communicate respectfully with the freelancer</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/gig/${id}`)}
                    className="btn-outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${gig.price.toLocaleString()} & Book Now`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>

              {/* Freelancer Info */}
              <div className="flex items-center mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                  {gig.studentId?.profilePic?.url ? (
                    <img 
                      src={gig.studentId.profilePic.url} 
                      alt={gig.studentId?.name || 'Student'} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {gig.studentId?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {gig.studentId?.name || 'Unknown Student'}
                  </h4>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(gig.studentId?.averageStudentRating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.598-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {gig.studentId?.averageStudentRating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gig Price:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{gig.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹0</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{gig.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {gig.deliveryTime} Day{gig.deliveryTime > 1 ? 's' : ''} Delivery
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Expected by {new Date(Date.now() + gig.deliveryTime * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookGigPage;