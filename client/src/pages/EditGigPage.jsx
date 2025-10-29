import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LocalFilePreview from '../components/LocalFilePreview';
import FilePreview from '../components/FilePreview';

const EditGigPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    price: '',
    deliveryTime: '',
    sampleFiles: []
  });
  const [existingSampleFiles, setExistingSampleFiles] = useState([]);

  const categories = [
    'Design', 'Programming', 'Writing', 'Data', 'Marketing', 'Video', 'Music', 'Others'
  ];

  useEffect(() => {
    fetchGigDetails();
  }, [id]);

  const fetchGigDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.getGigForEdit(id);
      const gig = response.gig;

      // Set form data from gig
      const isStandardCategory = categories.includes(gig.category);
      setFormData({
        title: gig.title || '',
        description: gig.description || '',
        category: isStandardCategory ? gig.category : 'Others',
        customCategory: isStandardCategory ? '' : gig.category,
        price: gig.price?.toString() || '',
        deliveryTime: gig.deliveryTime?.toString() || '',
        sampleFiles: []
      });
      
      // Set existing sample files
      setExistingSampleFiles(gig.sampleFiles || []);
    } catch (error) {
      console.error('Error fetching gig:', error);
      setError(error.message || 'Failed to load gig details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      sampleFiles: files
    }));
  };

  const removeNewFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      sampleFiles: prev.sampleFiles.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'student') {
      alert('Only students can edit gigs');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare the data
      const gigData = {
        title: formData.title,
        description: formData.description,
        category: formData.category === 'Others' ? formData.customCategory : formData.category,
        price: parseFloat(formData.price),
        deliveryTime: parseInt(formData.deliveryTime)
      };

      // Validate required fields
      if (!gigData.title || !gigData.description || !gigData.category || !gigData.price || !gigData.deliveryTime) {
        alert('Please fill in all required fields');
        return;
      }

      if (gigData.price <= 0) {
        alert('Price must be greater than 0');
        return;
      }

      if (gigData.deliveryTime <= 0) {
        alert('Delivery time must be greater than 0');
        return;
      }

      console.log('Updating gig with data:', gigData);

      const response = await api.updateGig(id, gigData);
      
      if (response.success) {
        alert('Gig updated successfully!');
        navigate('/student-dashboard');
      } else {
        alert('Failed to update gig: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating gig:', error);
      alert('Error updating gig: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
            onClick={() => navigate('/student-dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Gig</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Update your gig details. Changes will be reviewed by admin before going live.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gig Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input"
                placeholder="I will..."
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Category */}
            {formData.category === 'Others' && (
              <div>
                <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Category *
                </label>
                <input
                  type="text"
                  id="customCategory"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter custom category"
                  required
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleInputChange}
                className="input resize-none"
                placeholder="Describe your service in detail..."
                required
              />
            </div>

            {/* Price and Delivery Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="500.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Time (days) *
                </label>
                <input
                  type="number"
                  id="deliveryTime"
                  name="deliveryTime"
                  min="1"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="7"
                  required
                />
              </div>
            </div>

            {/* Sample Files */}
            <div>
              <label htmlFor="sampleFiles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portfolio Files (Optional)
              </label>
              
              {/* Existing Sample Files */}
              {existingSampleFiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Sample Files:
                  </p>
                  <FilePreview files={existingSampleFiles} />
                </div>
              )}
              
              <input
                type="file"
                id="sampleFiles"
                name="sampleFiles"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload new images or documents showcasing your work (max 5 files, 5MB each)
              </p>
              
              {/* New Sample Files Preview */}
              {formData.sampleFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Files to Upload:
                  </p>
                  <LocalFilePreview files={formData.sampleFiles} onRemoveFile={removeNewFile} />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/student-dashboard')}
                className="flex-1 btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Gig'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGigPage;