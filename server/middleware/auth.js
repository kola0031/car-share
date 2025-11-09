import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Provide more detailed error information for debugging
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ 
          message: 'Token expired',
          error: 'TokenExpiredError',
          expiredAt: err.expiredAt
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          message: 'Invalid token',
          error: 'JsonWebTokenError'
        });
      }
      return res.status(403).json({ 
        message: 'Invalid or expired token',
        error: err.name || 'UnknownError'
      });
    }
    req.user = user;
    next();
  });
};

