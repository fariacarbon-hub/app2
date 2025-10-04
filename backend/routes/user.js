const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Goal = require('../models/Goal');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  auth,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio deve ter no máximo 500 caracteres'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar deve ser uma URL válida')
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

      const allowedFields = ['name', 'bio', 'avatar'];
      const updates = {};

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: Object.values(error.errors).map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   GET /api/user/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: { settings: user.settings }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   PUT /api/user/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/settings',
  auth,
  [
    body('language').optional().isIn(['pt-BR', 'en-US', 'es-ES']),
    body('timezone').optional().isString(),
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    body('notifications.dailyReminder').optional().isBoolean(),
    body('notifications.weeklyReport').optional().isBoolean(),
    body('notifications.goalUpdates').optional().isBoolean(),
    body('notifications.emailNotifications').optional().isBoolean(),
    body('privacy.shareProgress').optional().isBoolean(),
    body('privacy.anonymousAnalytics').optional().isBoolean(),
    body('privacy.dataCollection').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Configurações inválidas',
          errors: errors.array()
        });
      }

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Update settings
      if (req.body.language) user.settings.language = req.body.language;
      if (req.body.timezone) user.settings.timezone = req.body.timezone;
      if (req.body.theme) user.settings.theme = req.body.theme;

      // Update notifications
      if (req.body.notifications) {
        Object.keys(req.body.notifications).forEach(key => {
          if (typeof req.body.notifications[key] === 'boolean') {
            user.settings.notifications[key] = req.body.notifications[key];
          }
        });
      }

      // Update privacy
      if (req.body.privacy) {
        Object.keys(req.body.privacy).forEach(key => {
          if (typeof req.body.privacy[key] === 'boolean') {
            user.settings.privacy[key] = req.body.privacy[key];
          }
        });
      }

      await user.save();

      res.json({
        success: true,
        message: 'Configurações atualizadas com sucesso',
        data: { settings: user.settings }
      });

    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   GET /api/user/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('stats subscription createdAt');

    // Get additional stats
    const [
      totalConversations,
      totalMessages,
      totalGoals,
      completedGoals,
      recentAnalytics
    ] = await Promise.all([
      Conversation.countDocuments({ userId: req.user._id }),
      Message.countDocuments({ userId: req.user._id, type: 'user' }),
      Goal.countDocuments({ userId: req.user._id }),
      Goal.countDocuments({ userId: req.user._id, status: 'concluido' }),
      Analytics.find({ userId: req.user._id }).sort({ date: -1 }).limit(7)
    ]);

    // Calculate days since joining
    const daysSinceJoining = Math.floor(
      (new Date() - user.createdAt) / (1000 * 60 * 60 * 24)
    );

    // Calculate recent mood average
    const recentMoodAvg = recentAnalytics.length > 0 ?
      recentAnalytics.reduce((sum, a) => sum + a.mood, 0) / recentAnalytics.length : 0;

    const stats = {
      basicStats: user.stats,
      subscriptionInfo: user.subscription,
      detailedStats: {
        totalConversations,
        totalMessages,
        totalGoals,
        completedGoals,
        goalCompletionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
        daysSinceJoining,
        recentMoodAvg: Math.round(recentMoodAvg * 10) / 10,
        averageMessagesPerConversation: totalConversations > 0 ? 
          Math.round(totalMessages / totalConversations) : 0
      },
      achievements: []
    };

    // Calculate achievements
    if (user.stats.currentStreak >= 7) {
      stats.achievements.push({
        id: 'week_streak',
        title: 'Sequência Semanal',
        description: `${user.stats.currentStreak} dias consecutivos de atividade`,
        icon: '🔥'
      });
    }

    if (completedGoals >= 5) {
      stats.achievements.push({
        id: 'goal_achiever',
        title: 'Realizador de Objetivos',
        description: `${completedGoals} objetivos completados`,
        icon: '🎯'
      });
    }

    if (user.stats.totalMessages >= 100) {
      stats.achievements.push({
        id: 'conversationalist',
        title: 'Conversador',
        description: `${user.stats.totalMessages} mensagens enviadas`,
        icon: '💬'
      });
    }

    if (user.stats.growthScore >= 80) {
      stats.achievements.push({
        id: 'growth_master',
        title: 'Mestre do Crescimento',
        description: `Pontuação de crescimento: ${user.stats.growthScore}%`,
        icon: '🌟'
      });
    }

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/user/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password',
  auth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Senha atual é obrigatória'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Nova senha deve ter pelo menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Nova senha deve conter pelo menos uma letra minúscula, maiúscula e um número')
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

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id);

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      // Update password
      user.password = newPassword; // Will be hashed by pre-save middleware
      await user.save();

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   DELETE /api/user/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account',
  auth,
  [
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória para deletar a conta'),
    body('confirmation')
      .equals('DELETE')
      .withMessage('Confirmação deve ser "DELETE"')
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

      const { password } = req.body;

      const user = await User.findById(req.user._id);

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Senha incorreta'
        });
      }

      // Delete all user data
      await Promise.all([
        Message.deleteMany({ userId: req.user._id }),
        Conversation.deleteMany({ userId: req.user._id }),
        Goal.deleteMany({ userId: req.user._id }),
        Analytics.deleteMany({ userId: req.user._id }),
        User.findByIdAndDelete(req.user._id)
      ]);

      res.json({
        success: true,
        message: 'Conta deletada com sucesso'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   GET /api/user/data
 * @desc    Export user data
 * @access  Private
 */
router.get('/data', auth, async (req, res) => {
  try {
    const [user, conversations, messages, goals, analytics] = await Promise.all([
      User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken'),
      Conversation.find({ userId: req.user._id }),
      Message.find({ userId: req.user._id }),
      Goal.find({ userId: req.user._id }),
      Analytics.find({ userId: req.user._id })
    ]);

    const exportData = {
      user,
      conversations,
      messages,
      goals,
      analytics,
      exportDate: new Date(),
      disclaimer: 'Este arquivo contém todos os seus dados do YOU. Mantenha-o seguro e privado.'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="you_user_data.json"');
    
    res.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;