import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ContactFreelancerModal = ({ freelancer, gig, isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: gig ? `Inquiry about: ${gig.title}` : '',
    message: '',
    gigId: gig?._id || '',
    budget: '',
    deadline: '',
    projectType: 'custom' // 'existing' for existing gig, 'custom' for custom work
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to contact freelancers');
      return;
    }

    if (user.role !== 'client') {
      alert('Only clients can contact freelancers');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Send contact request to the freelancer
      await api.createContactRequest({
        freelancerId: freelancer._id,
        ...formData
      });
      
      alert('Message sent successfully! The freelancer will be notified.');
      onClose();
      
      // Reset form
      setFormData({
        subject: gig ? `Inquiry about: ${gig.title}` : '',
        message: '',
        gigId: gig?._id || '',
        budget: '',
        deadline: '',
        projectType: 'custom'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact {freelancer.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Send a message to discuss your project requirements
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Freelancer Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {freelancer.profilePic?.url ? (
              <img
                src={freelancer.profilePic.url}
                alt={freelancer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {freelancer.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {freelancer.name}
              </h4>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(freelancer.averageRating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.598-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1">
                    ({freelancer.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
              {freelancer.skills && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {freelancer.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {freelancer.skills.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{freelancer.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="projectType"
                  value="existing"
                  checked={formData.projectType === 'existing'}
                  onChange={handleInputChange}
                  className="mr-2"
                  disabled={!gig}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Existing Gig{gig && ` (${gig.title})`}
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="projectType"
                  value="custom"
                  checked={formData.projectType === 'custom'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Custom Project
                </span>
              </label>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="input"
              placeholder="Brief description of your project..."
              required
            />
          </div>

          {/* Budget & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget (₹)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="input"
                placeholder="Your budget"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Details *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="input h-32"
              placeholder="Describe your project requirements, deliverables, and any specific instructions..."
              required
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.message.length}/1000 characters
            </p>
          </div>

          {/* Important Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Tips for Better Communication
                </h4>
                <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                  <li>Be specific about your requirements and expectations</li>
                  <li>Include any reference materials or examples if available</li>
                  <li>Mention your timeline and budget constraints upfront</li>
                  <li>Ask about the freelancer's availability and process</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFreelancerModal;