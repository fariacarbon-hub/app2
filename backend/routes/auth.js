const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, maiúscula e um número')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password // Will be hashed by pre-save middleware
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update user stats for first login
    await user.updateStreak();

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          subscription: user.subscription,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o suporte.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update user activity and streak
    await user.updateStreak();
    await user.calculateGrowthScore();

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          subscription: user.subscription,
          settings: user.settings,
          stats: user.stats,
          aiProfile: user.aiProfile
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token deletion)
 * @access  Private
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // In a more sophisticated implementation, we could blacklist the token
    // For now, we just send a success response as logout is handled client-side
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken')
      .populate('stats');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', auth, async (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user._id);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', 
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      // Always return success for security (don't reveal if email exists)
      if (!user) {
        return res.json({
          success: true,
          message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Save reset token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // In a real app, send email here
      console.log(`Password reset token for ${email}: ${resetToken}`);

      res.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token é obrigatório'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter pelo menos uma letra minúscula, maiúscula e um número')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { token, password } = req.body;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'password_reset') {
          throw new Error('Invalid token type');
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      // Find user with valid reset token
      const user = await User.findOne({
        _id: decoded.userId,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      // Update password
      user.password = password; // Will be hashed by pre-save middleware
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Senha redefinida com sucesso'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

module.exports = router;