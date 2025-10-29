// Navigation utility functions for role-based routing

/**
 * Get the appropriate dashboard route based on user role
 * @param {Object} user - User object with role property
 * @returns {string} - Dashboard route path
 */
export const getDashboardRoute = (user) => {
  if (!user || !user.role) return '/';
  
  switch (user.role) {
    case 'admin':
      return '/admin-dashboard';
    case 'student':
      return '/student-dashboard';
    case 'client':
      return '/client-dashboard';
    default:
      return '/';
  }
};

/**
 * Get the appropriate home route based on user authentication and role
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Object} user - User object with role property
 * @returns {string} - Home route path
 */
export const getHomeRoute = (isAuthenticated, user) => {
  // If not authenticated, go to generic home page
  if (!isAuthenticated || !user) return '/';
  
  // If authenticated, go to their dashboard (which is their "home")
  return getDashboardRoute(user);
};

/**
 * Role-based navigation titles
 */
export const getRoleBasedTitle = (user) => {
  if (!user || !user.role) return 'SkillKart';
  
  switch (user.role) {
    case 'admin':
      return 'Admin Panel';
    case 'student':
      return 'Student Dashboard';
    case 'client':
      return 'Client Dashboard';
    default:
      return 'SkillKart';
  }
};

/**
 * Get appropriate landing page message based on role
 */
export const getWelcomeMessage = (user) => {
  if (!user || !user.role) return 'Welcome to SkillKart';
  
  switch (user.role) {
    case 'admin':
      return `Welcome back, Admin ${user.name}`;
    case 'student':
      return `Welcome back, ${user.name}! Ready to work on some projects?`;
    case 'client':
      return `Welcome back, ${user.name}! Find the perfect freelancer for your project.`;
    default:
      return `Welcome, ${user.name}!`;
  }
};