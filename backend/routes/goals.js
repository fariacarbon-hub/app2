const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Goal = require('../models/Goal');
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const goalValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Descrição deve ter entre 1 e 1000 caracteres'),
  body('category')
    .isIn(['relacionamentos', 'carreira', 'saude_mental', 'crescimento_pessoal', 
           'educacao', 'financas', 'saude_fisica', 'espiritualidade', 'hobbies', 'outro'])
    .withMessage('Categoria inválida'),
  body('targetDate')
    .isISO8601()
    .withMessage('Data alvo deve ser uma data válida'),
  body('priority')
    .optional()
    .isIn(['baixa', 'media', 'alta'])
    .withMessage('Prioridade deve ser baixa, média ou alta')
];

/**
 * @route   GET /api/goals
 * @desc    Get user's goals
 * @access  Private
 */
router.get('/', 
  auth,
  [
    query('status').optional().isIn(['ativo', 'concluido', 'pausado', 'cancelado']),
    query('category').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: errors.array()
        });
      }

      const { status, category, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      // Build query
      const query = { userId: req.user._id };
      if (status) query.status = status;
      if (category) query.category = category;

      const goals = await Goal.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Goal.countDocuments(query);

      // Add virtual fields
      const goalsWithVirtuals = goals.map(goal => ({
        ...goal,
        daysUntilTarget: goal.targetDate ? 
          Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
        milestoneProgress: goal.milestones.length > 0 ? 
          (goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100 : 0
      }));

      res.json({
        success: true,
        data: {
          goals: goalsWithVirtuals,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get goals error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   POST /api/goals
 * @desc    Create new goal
 * @access  Private
 */
router.post('/', auth, goalValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const goalData = {
      userId: req.user._id,
      ...req.body
    };

    // Validate target date is in the future
    if (new Date(goalData.targetDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Data alvo deve ser no futuro'
      });
    }

    const goal = new Goal(goalData);
    await goal.save();

    // Generate AI insights for the new goal
    try {
      const insightsResult = await aiService.generateGoalInsights(goal, req.user.stats);
      if (insightsResult.success) {
        goal.aiInsights = insightsResult.insights.insights.map(insight => ({
          insight,
          confidence: 0.8
        }));
        goal.recommendations = insightsResult.insights.recommendations;
        await goal.save();
      }
    } catch (aiError) {
      console.error('AI insights generation error:', aiError);
    }

    res.status(201).json({
      success: true,
      message: 'Objetivo criado com sucesso',
      data: { goal }
    });

  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/goals/:id
 * @desc    Get goal details
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).lean();

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Objetivo não encontrado'
      });
    }

    // Add virtual fields
    const goalWithVirtuals = {
      ...goal,
      daysUntilTarget: goal.targetDate ? 
        Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      milestoneProgress: goal.milestones.length > 0 ? 
        (goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100 : 0
    };

    res.json({
      success: true,
      data: { goal: goalWithVirtuals }
    });

  } catch (error) {
    console.error('Get goal error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de objetivo inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   PUT /api/goals/:id
 * @desc    Update goal
 * @access  Private
 */
router.put('/:id', auth, goalValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Objetivo não encontrado'
      });
    }

    // Update goal fields
    Object.assign(goal, req.body);
    await goal.save();

    res.json({
      success: true,
      message: 'Objetivo atualizado com sucesso',
      data: { goal }
    });

  } catch (error) {
    console.error('Update goal error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de objetivo inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete goal
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Objetivo não encontrado'
      });
    }

    await Goal.findByIdAndDelete(goal._id);

    res.json({
      success: true,
      message: 'Objetivo deletado com sucesso'
    });

  } catch (error) {
    console.error('Delete goal error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de objetivo inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/goals/:id/progress
 * @desc    Update goal progress
 * @access  Private
 */
router.post('/:id/progress',
  auth,
  [
    body('progress')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Progresso deve ser entre 0 e 100'),
    body('note')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Nota deve ter no máximo 500 caracteres')
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

      const { progress, note } = req.body;

      const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Objetivo não encontrado'
        });
      }

      await goal.updateProgress(progress, note, 'user');

      // Update user stats if goal completed
      if (progress === 100 && goal.status === 'concluido') {
        req.user.stats.goalsCompleted += 1;
        await req.user.calculateGrowthScore();
      }

      res.json({
        success: true,
        message: 'Progresso atualizado com sucesso',
        data: { goal }
      });

    } catch (error) {
      console.error('Update progress error:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de objetivo inválido'
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
 * @route   GET /api/goals/:id/insights
 * @desc    Get AI insights for goal
 * @access  Private
 */
router.get('/:id/insights', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Objetivo não encontrado'
      });
    }

    // Generate fresh insights
    try {
      const insightsResult = await aiService.generateGoalInsights(
        goal, 
        req.user.stats,
        [] // Could pass recent conversations here
      );

      if (insightsResult.success) {
        // Add new insights to goal
        const newInsights = insightsResult.insights.insights.map(insight => ({
          insight,
          confidence: 0.8
        }));
        
        goal.aiInsights.push(...newInsights);
        goal.recommendations.push(...insightsResult.insights.recommendations);
        
        // Keep only last 10 insights and 15 recommendations
        goal.aiInsights = goal.aiInsights.slice(-10);
        goal.recommendations = goal.recommendations.slice(-15);
        
        await goal.save();

        res.json({
          success: true,
          data: {
            insights: insightsResult.insights,
            goal: {
              aiInsights: goal.aiInsights,
              recommendations: goal.recommendations
            }
          }
        });
      } else {
        throw new Error('Failed to generate insights');
      }

    } catch (aiError) {
      console.error('AI insights error:', aiError);
      
      // Return existing insights if AI fails
      res.json({
        success: true,
        data: {
          insights: {
            insights: goal.aiInsights.map(ai => ai.insight),
            recommendations: goal.recommendations,
            next_steps: ["Continue focando em pequenos passos diários"],
            motivation_boost: "Você está no caminho certo para alcançar seu objetivo!"
          },
          goal: {
            aiInsights: goal.aiInsights,
            recommendations: goal.recommendations
          }
        }
      });
    }

  } catch (error) {
    console.error('Get insights error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de objetivo inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/goals/:id/milestones
 * @desc    Add milestone to goal
 * @access  Private
 */
router.post('/:id/milestones',
  auth,
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Título do marco deve ter entre 1 e 200 caracteres'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }),
    body('dueDate')
      .optional()
      .isISO8601()
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

      const goal = await Goal.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Objetivo não encontrado'
        });
      }

      await goal.addMilestone(req.body);

      res.status(201).json({
        success: true,
        message: 'Marco adicionado com sucesso',
        data: { goal }
      });

    } catch (error) {
      console.error('Add milestone error:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de objetivo inválido'
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
 * @route   PUT /api/goals/:id/milestones/:milestoneId
 * @desc    Complete milestone
 * @access  Private
 */
router.put('/:id/milestones/:milestoneId', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Objetivo não encontrado'
      });
    }

    await goal.completeMilestone(req.params.milestoneId);

    res.json({
      success: true,
      message: 'Marco completado com sucesso',
      data: { goal }
    });

  } catch (error) {
    console.error('Complete milestone error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;