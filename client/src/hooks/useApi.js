import { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../services/api';

// Custom hook for API calls with loading and error states
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, isLoading, error, refetch };
};

// Hook for gigs with filters
export const useGigs = (filters = {}) => {
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  
  return useApi(
    () => apiService.getGigs(filters), 
    [filtersKey]
  );
};

// Hook for single gig
export const useGig = (gigId) => {
  return useApi(() => apiService.getGigById(gigId), [gigId]);
};

// Hook for user orders
export const useOrders = (userId, userType) => {
  return useApi(() => {
    if (userType === 'student') {
      return apiService.getStudentOrders(userId);
    } else {
      return apiService.getClientOrders(userId);
    }
  }, [userId, userType]);
};

// Hook for gig reviews
export const useGigReviews = (gigId) => {
  return useApi(() => apiService.getGigReviews(gigId), [gigId]);
};

// Hook for notifications
export const useNotifications = () => {
  return useApi(() => apiService.getNotifications(), []);
};

// Hook for async operations with manual trigger
export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = async (asyncFunction) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };

  return { execute, isLoading, error, data, reset };
};