import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGigs } from '../hooks/useApi';

const BrowseGigsPage = () => {
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    priceMin: '',
    priceMax: '',
    deliveryTimeMax: '',
    sortBy: 'relevance'
  });

  const { data: gigsData, isLoading: loading, error, refetch } = useGigs(filters);
  const [sortedGigs, setSortedGigs] = useState([]);
  const gigs = gigsData?.gigs || [];

  const categories = ['All', 'Design', 'Programming', 'Writing', 'Data', 'Marketing', 'Video', 'Music', 'Others'];

  // Sort gigs when data changes or sortBy changes
  useEffect(() => {
    if (!gigs.length) {
      setSortedGigs([]);
      return;
    }

    let sorted = [...gigs];
    
    switch (filters.sortBy) {
      case 'price_low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'delivery':
        sorted.sort((a, b) => a.deliveryTime - b.deliveryTime);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default: // relevance
        // Keep original order from API
        break;
    }
    
    setSortedGigs(sorted);
  }, [gigs, filters.sortBy]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Gigs
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover talented student freelancers ready to help with your projects
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Filters
              </h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  name="q"
                  value={filters.q}
                  onChange={handleFilterChange}
                  className="input"
                  placeholder="Search gigs..."
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="input"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'All' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="priceMin"
                    value={filters.priceMin}
                    onChange={handleFilterChange}
                    className="input"
                    placeholder="Min"
                    min="0.01"
                    step="0.01"
                  />
                  <input
                    type="number"
                    name="priceMax"
                    value={filters.priceMax}
                    onChange={handleFilterChange}
                    className="input"
                    placeholder="Max"
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Delivery Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Time (days)
                </label>
                <select
                  name="deliveryTimeMax"
                  value={filters.deliveryTimeMax}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">Any time</option>
                  <option value="1">1 day</option>
                  <option value="3">Up to 3 days</option>
                  <option value="7">Up to 1 week</option>
                  <option value="14">Up to 2 weeks</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({ q: '', category: '', priceMin: '', priceMax: '', deliveryTimeMax: '', sortBy: 'relevance' })}
                className="w-full btn-outline"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="lg:col-span-3 flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="lg:col-span-3">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">Error: {error}</p>
              </div>
            </div>
          )}

          {/* Gigs Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                {loading ? 'Loading...' : `${sortedGigs.length} gigs found`}
              </p>
              <select 
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="input w-auto"
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="delivery">Delivery Time</option>
                <option value="rating">Rating</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Gigs Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedGigs.map(gig => (
                  <Link
                    key={gig._id}
                    to={`/gig/${gig._id}`}
                    className="card hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Gig Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-primary-100 to-indigo-200 dark:from-gray-700 dark:to-gray-600 rounded-t-lg flex items-center justify-center">
                      <div className="text-4xl font-bold text-primary-500 dark:text-primary-400">
                        {gig.category.charAt(0)}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Category Badge */}
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full mb-3">
                        {gig.category}
                      </span>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors duration-200">
                        {gig.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {gig.description}
                      </p>

                      {/* Freelancer Info */}
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                          {gig.studentId?.profilePic?.url ? (
                            <img 
                              src={gig.studentId.profilePic.url} 
                              alt={gig.studentId?.name || 'Student'} 
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {gig.studentId?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {gig.studentId?.name || 'Unknown Student'}
                          </p>
                          {/* Gig Rating */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(gig.averageRating || 0)
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
                              {gig.averageRating > 0 ? gig.averageRating.toFixed(1) : '0.0'} ({gig.reviewCount || 0})
                            </span>
                          </div>
                          {/* Student Rating */}
                          {gig.studentId?.averageStudentRating > 0 && (
                            <div className="flex items-center mt-0.5">
                              <svg className="w-3 h-3 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                              </svg>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Seller: {gig.studentId.averageStudentRating.toFixed(1)} ⭐
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price and Delivery */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₹{gig.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {gig.deliveryTime} day{gig.deliveryTime > 1 ? 's' : ''} delivery
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && sortedGigs.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0l3.297 1.587-.749.749A7.979 7.979 0 014.003 16c1.194-1.194 2.85-1.9 4.65-1.9S12.297 14.806 13.5 16c1.194-1.194 2.85-1.9 4.65-1.9S19.803 14.806 21 16M9 4.75V7l5-5-5 5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No gigs found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseGigsPage;