const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'No user information found. Authorization denied.' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      // Check if user is the owner for specific actions, if not, deny
      // This is a basic example and might need more complex logic for ownership checks
      return res.status(403).json({ message: 'Forbidden: You do not have the necessary role to access this resource.' });
    }
    next();
  };
};

module.exports = authorize;
