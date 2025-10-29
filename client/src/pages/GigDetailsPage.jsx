import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ContactFreelancerModal from '../components/ContactFreelancerModal';
import FilePreview from '../components/FilePreview';

const GigDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchGigDetails();
    fetchGigReviews();
  }, [id]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getGigById(id);
      setGig(response.gig);
    } catch (err) {
      setError(err.message || 'Failed to fetch gig details');
    } finally {
      setLoading(false);
    }
  };

  const fetchGigReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await api.getGigReviews(id);
      setReviews(response.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleBookGig = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'client') {
      alert('Only clients can book gigs');
      return;
    }

    // TODO: Implement booking logic
    alert('Booking functionality will be implemented soon');
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/gigs')}
              className="btn-primary"
            >
              Back to Gigs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gig not found</h2>
          <button
            onClick={() => navigate('/gigs')}
            className="btn-primary"
          >
            Back to Gigs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              {/* Back Button */}
              <button
                onClick={() => navigate('/gigs')}
                className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Gigs
              </button>

              {/* Category Badge */}
              <span className="inline-block px-3 py-1 text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full mb-4">
                {gig.category}
              </span>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {gig.title}
              </h1>

              {/* Freelancer Info */}
              <div className="flex items-center mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {gig.studentId?.name || 'Unknown Student'}
                  </h3>
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {gig.studentId?.averageStudentRating?.toFixed(1) || '0.0'} rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  About This Gig
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {gig.description}
                </p>
              </div>

              {/* Sample Files */}
              {gig.sampleFiles && gig.sampleFiles.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Sample Work
                  </h2>
                  <FilePreview files={gig.sampleFiles} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{gig.price.toLocaleString()}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {gig.deliveryTime} day{gig.deliveryTime > 1 ? 's' : ''} delivery
                </p>
              </div>

              {/* Gig Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.598-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {gig.averageRating.toFixed(1)} ({gig.reviewCount})
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{gig.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {gig.deliveryTime} day{gig.deliveryTime > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => navigate(`/gig/${id}/book`)}
                className="w-full btn-primary mb-4"
              >
                Book This Gig
              </button>

              {/* Contact Button */}
              <button 
                onClick={() => setShowContactModal(true)}
                className="w-full btn-outline"
              >
                Contact Freelancer
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Reviews ({gig.reviewCount || 0})
          </h2>
          
          {reviewsLoading ? (
            <div className="card p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="card p-8">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review this gig!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="card p-6">
                  <div className="flex items-start space-x-4">
                    {/* Reviewer Avatar */}
                    <div className="flex-shrink-0">
                      {review.reviewerId?.profilePic?.url ? (
                        <img
                          src={review.reviewerId.profilePic.url}
                          alt={review.reviewerId.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-medium">
                            {review.reviewerId?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {review.reviewerId?.name || 'Anonymous'}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        
                        {/* Rating Stars */}
                        <div className="flex items-center">
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
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      
                      {/* Review Comment */}
                      {review.comment && (
                        <p className="text-gray-700 dark:text-gray-300 mt-3">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Freelancer Modal */}
      <ContactFreelancerModal
        freelancer={gig?.studentId}
        gig={gig}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default GigDetailsPage;