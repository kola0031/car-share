import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  // Log the secret being used (first 10 chars only for security)
  console.log('JWT_SECRET being used:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'undefined');
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification failed in middleware:', {
        error: err.name,
        message: err.message,
        tokenPreview: token.substring(0, 20) + '...',
        secretUsed: JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'undefined',
        secretFromEnv: !!process.env.JWT_SECRET
      });
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
    
    console.log('JWT verified successfully:', {
      userId: decoded.userId,
      hostId: decoded.hostId,
      role: decoded.role
    });
    
    req.user = decoded;
    next();
  });
};

