const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Token de acesso requerido' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido - usuário não encontrado' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Conta desativada' 
      });
    }

    // Update user activity
    await user.updateActivity();

    // Add user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado' 
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
};

// Optional auth - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
      await user.updateActivity();
    }
    
    next();
  } catch (error) {
    // Ignore auth errors and continue
    next();
  }
};

// Check subscription level
const requireSubscription = (minimumPlan) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Autenticação requerida' 
      });
    }

    const planLevels = {
      'free': 1,
      'basic': 2,
      'premium': 3,
      'enterprise': 4
    };

    const userLevel = planLevels[req.user.subscription.plan] || 1;
    const requiredLevel = planLevels[minimumPlan] || 1;

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        success: false,
        message: 'Plano de assinatura insuficiente',
        required_plan: minimumPlan,
        current_plan: req.user.subscription.plan
      });
    }

    // Check if subscription is active
    if (req.user.subscription.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        message: 'Assinatura inativa ou expirada',
        subscription_status: req.user.subscription.status
      });
    }

    next();
  };
};

// Admin only
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Acesso negado - privilégios de administrador requeridos' 
    });
  }
  next();
};

module.exports = {
  auth,
  optionalAuth,
  requireSubscription,
  requireAdmin
};