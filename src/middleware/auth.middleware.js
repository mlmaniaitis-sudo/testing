import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // The header format is "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // No token provided
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Token is expired or invalid
      return res.sendStatus(403); // Forbidden
    }
    // Token is valid, attach the payload to the request object
    req.user = user;
    next(); // Proceed to the next middleware or the route handler
  });
};

// Optional: Middleware to check for specific roles
export const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ error: 'User does not have the required permissions.' });
    }
  };
};
