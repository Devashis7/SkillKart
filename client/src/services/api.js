// API configuration and utility functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Helper method to handle responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    const response = await fetch(url, config);
    return this.handleResponse(response);
  }

  // Generic HTTP methods
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // User methods
  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async updateProfile(data) {
    return this.request('/users/update', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Gig methods
  async getGigs(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    return this.request(`/gigs${queryString ? `?${queryString}` : ''}`);
  }

  async getGigById(id) {
    return this.request(`/gigs/${id}`);
  }

  async getGigForEdit(id) {
    return this.request(`/gigs/${id}/edit-details`);
  }

  async createGig(gigData) {
    // For file uploads, we need to use FormData
    const formData = new FormData();
    Object.entries(gigData).forEach(([key, value]) => {
      if (key === 'sampleFiles' && Array.isArray(value)) {
        value.forEach(file => formData.append('portfolioFiles', file));
      } else {
        formData.append(key, value);
      }
    });

    return this.request('/gigs', {
      method: 'POST',
      headers: {
        ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
      },
      body: formData
    });
  }

  async updateGig(id, gigData) {
    return this.request(`/gigs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gigData)
    });
  }

  async deleteGig(id) {
    return this.request(`/gigs/${id}`, {
      method: 'DELETE'
    });
  }

  async getMyGigs(filters = {}) {
    const queryString = Object.entries(filters)
      .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    return this.request(`/gigs/my-gigs${queryString ? `?${queryString}` : ''}`);
  }

  // Order methods
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getStudentOrders(studentId) {
    return this.request(`/orders/student/${studentId}`);
  }

  async getClientOrders(clientId) {
    return this.request(`/orders/client/${clientId}`);
  }

  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async uploadDelivery(orderId, files) {
    const formData = new FormData();
    files.forEach(file => formData.append('deliveryFiles', file));

    const token = localStorage.getItem('token');
    const url = `${this.baseURL}/orders/${orderId}/delivery`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
        // DO NOT set Content-Type - browser will set it automatically for FormData
      },
      body: formData
    });

    return this.handleResponse(response);
  }

  // Review methods
  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async createClientReview(reviewData) {
    return this.request('/reviews/client', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async getGigReviews(gigId) {
    return this.request(`/reviews/gig/${gigId}`);
  }

  async getClientReviews(clientId) {
    return this.request(`/reviews/client/${clientId}`);
  }

  async getStudentReviews(studentId) {
    return this.request(`/reviews/student/${studentId}`);
  }

  // Payment methods
  async createPaymentOrder(paymentData) {
    return this.request('/payment/checkout', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async confirmPayment(paymentData) {
    return this.request('/payment/confirm-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  // Admin methods
  async getAdminGigs(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    return this.request(`/gigs/admin/all${queryString ? `?${queryString}` : ''}`);
  }

  async updateGigStatus(gigId, status) {
    return this.request(`/gigs/${gigId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async getAllUsers(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    return this.request(`/users/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  async suspendUser(userId, status) {
    return this.request(`/users/${userId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async activateUser(userId) {
    return this.suspendUser(userId, 'active');
  }

  async getUserStats() {
    return this.request('/admin/stats');
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async updateUserRole(userId, role) {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  }

  // File upload method for profile pictures
  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profilePic', file);

    return this.request('/users/upload-profile-pic', {
      method: 'POST',
      headers: {
        ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
      },
      body: formData
    });
  }

  // Contact methods
  async sendPublicContactMessage(messageData) {
    return this.request('/contact/public', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async createContactRequest(contactData) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  }

  async getReceivedContactRequests() {
    return this.request('/contact/received');
  }

  async markContactRequestAsRead(requestId) {
    return this.request(`/contact/${requestId}/read`, {
      method: 'PATCH'
    });
  }

  // Additional order methods
  async requestRevision(orderId, revisionRequest) {
    return this.request(`/orders/${orderId}/request-revision`, {
      method: 'PATCH',
      body: JSON.stringify(revisionRequest)
    });
  }

  // Admin order methods
  async getAdminOrders(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    return this.request(`/orders/admin/all${queryString ? `?${queryString}` : ''}`);
  }

  async getOrderStats() {
    return this.request('/orders/admin/stats');
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  }

  // Admin method to mark any notification as read
  async markNotificationAsReadAdmin(notificationId) {
    return this.request(`/notifications/admin/${notificationId}/read`, { method: 'PATCH' });
  }

  // Admin notification methods
  async getAdminNotifications(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    return this.request(`/notifications/admin/all${queryString ? `?${queryString}` : ''}`);
  }

  async getNotificationStats() {
    return this.request('/notifications/admin/stats');
  }

  // Contact methods
  async getAdminContacts(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    return this.request(`/contact/admin/all${queryString ? `?${queryString}` : ''}`);
  }
}

const api = new ApiService();
export default api;