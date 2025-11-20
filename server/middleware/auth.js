import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification failed in middleware:', err.message);

      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({
          message: 'Token expired',
          error: 'TokenExpiredError',
          expiredAt: err.expiredAt
        });
      }

      return res.status(403).json({
        message: 'Invalid or expired token',
        error: err.name || 'UnknownError'
      });
    }

    req.user = decoded;
    next();
  });
};

