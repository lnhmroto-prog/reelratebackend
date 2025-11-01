const { auth, isConfigured } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  if (!isConfigured || !auth) {
    console.warn('  Authentication disabled - Firebase Admin not configured');
    req.user = { uid: 'dev-user', email: 'dev@example.com', emailVerified: true };
    return next();
  }
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No authentication token provided' 
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication token expired. Please log in again.' 
        });
      }
      
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid authentication token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Authentication verification failed' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  if (!isConfigured || !auth) {
    return next();
  }
  
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      
      try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified
        };
      } catch (error) {
        console.warn('Optional auth failed:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth
};
