import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const authMiddleware = async (req, res, next) => {
  // Skip auth for login route and static files
  if (req.path === '/login' || req.path.startsWith('/public')) {
    return next();
  }
  
  // Check for token in cookies or headers
  const token = req.cookies?.adminjs || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Please authenticate' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Verify user still exists
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'User no longer exists' 
      });
    }
    
    req.user = admin;
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    
    let message = 'Invalid token';
    if (err.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      message = 'Invalid token format';
    }
    
    return res.status(401).json({ 
      success: false,
      message 
    });
  }
};

export default authMiddleware;