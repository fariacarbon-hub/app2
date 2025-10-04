const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Analytics = require('../models/Analytics');
const Message = require('../models/Message');
const Goal = require('../models/Goal');
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics
 * @access  Private
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get recent analytics
    const analytics = await Analytics.getDateRange(req.user._id, startDate, new Date());

    // Get mood trends
    const moodTrends = await Analytics.getMoodTrends(req.user._id, parseInt(days));

    // Get weekly average
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyAverage = await Analytics.getWeeklyAverage(req.user._id, weekStart);

    // Get insights summary
    const insightsSummary = await Analytics.getInsightsSummary(req.user._id, parseInt(days));

    // Calculate overall metrics
    const totalDays = analytics.length;
    const avgMood = analytics.length > 0 ? 
      analytics.reduce((sum, a) => sum + a.mood, 0) / analytics.length : 0;
    const avgEnergy = analytics.length > 0 ?
      analytics.reduce((sum, a) => sum + a.energy, 0) / analytics.length : 0;
    const avgStress = analytics.length > 0 ?
      analytics.reduce((sum, a) => sum + a.stress, 0) / analytics.length : 0;

    // Get goals progress
    const activeGoals = await Goal.find({
      userId: req.user._id,
      status: 'ativo'
    }).countDocuments();

    const completedGoals = await Goal.find({
      userId: req.user._id,
      status: 'concluido',
      completedAt: { $gte: startDate }
    }).countDocuments();

    res.json({
      success: true,
      data: {
        summary: {
          totalDays,
          averages: {
            mood: Math.round(avgMood * 10) / 10,
            energy: Math.round(avgEnergy * 10) / 10,
            stress: Math.round(avgStress * 10) / 10
          },
          goals: {
            active: activeGoals,
            completedThisPeriod: completedGoals
          }
        },
        moodTrends,
        weeklyAverage: weeklyAverage[0] || {},
        insightsSummary,
        dailyAnalytics: analytics
      }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/analytics/mood
 * @desc    Log daily mood and metrics
 * @access  Private
 */
router.post('/mood',
  auth,
  [
    body('date').isISO8601().withMessage('Data deve ser válida'),
    body('mood').isInt({ min: 1, max: 10 }).withMessage('Humor deve ser entre 1 e 10'),
    body('energy').isInt({ min: 1, max: 10 }).withMessage('Energia deve ser entre 1 e 10'),
    body('stress').isInt({ min: 1, max: 10 }).withMessage('Estresse deve ser entre 1 e 10'),
    body('productivity').optional().isInt({ min: 1, max: 10 }),
    body('sleep_quality').optional().isInt({ min: 1, max: 10 }),
    body('notes.userNote').optional().trim().isLength({ max: 1000 })
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

      const { date, mood, energy, stress, productivity, sleep_quality, notes } = req.body;
      const analyticsDate = new Date(date);
      analyticsDate.setHours(0, 0, 0, 0);

      // Check if analytics already exists for this date
      let analytics = await Analytics.findOne({
        userId: req.user._id,
        date: analyticsDate
      });

      if (analytics) {
        // Update existing analytics
        analytics.mood = mood;
        analytics.energy = energy;
        analytics.stress = stress;
        if (productivity !== undefined) analytics.productivity = productivity;
        if (sleep_quality !== undefined) analytics.sleep_quality = sleep_quality;
        if (notes) analytics.notes.userNote = notes.userNote || '';
      } else {
        // Create new analytics
        analytics = new Analytics({
          userId: req.user._id,
          date: analyticsDate,
          mood,
          energy,
          stress,
          productivity: productivity || 5,
          sleep_quality: sleep_quality || null,
          notes: notes || {}
        });
      }

      // Calculate wellbeing score
      await analytics.calculateWellbeing();

      // Generate AI insights based on the day's data
      try {
        const conversationSummary = `Humor: ${mood}/10, Energia: ${energy}/10, Estresse: ${stress}/10`;
        const dailyInsights = await aiService.generateDailyInsights(analytics, conversationSummary);
        
        // Add insights to analytics
        for (const insight of dailyInsights.insights) {
          await analytics.addInsight('daily_reflection', insight.message || insight, 0.8, 'media', 'humor');
        }
        
        for (const recommendation of dailyInsights.recommendations) {
          await analytics.addRecommendation(
            'Sugestão Diária',
            recommendation,
            'action',
            'bem_estar',
            'media'
          );
        }
      } catch (aiError) {
        console.error('AI insights generation error:', aiError);
      }

      res.json({
        success: true,
        message: 'Dados de humor registrados com sucesso',
        data: { analytics }
      });

    } catch (error) {
      console.error('Log mood error:', error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Dados já registrados para esta data'
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
 * @route   GET /api/analytics/mood-history
 * @desc    Get mood history
 * @access  Private
 */
router.get('/mood-history',
  auth,
  [
    query('days').optional().isInt({ min: 1, max: 365 }),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
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

      let startDate, endDate;

      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
      } else {
        const days = parseInt(req.query.days) || 30;
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
      }

      const moodHistory = await Analytics.getDateRange(req.user._id, startDate, endDate);

      // Calculate trends
      const trends = {
        mood: 0,
        energy: 0,
        stress: 0
      };

      if (moodHistory.length >= 2) {
        const recent = moodHistory.slice(-7); // Last 7 days
        const previous = moodHistory.slice(-14, -7); // Previous 7 days

        if (recent.length > 0 && previous.length > 0) {
          const recentAvg = {
            mood: recent.reduce((sum, r) => sum + r.mood, 0) / recent.length,
            energy: recent.reduce((sum, r) => sum + r.energy, 0) / recent.length,
            stress: recent.reduce((sum, r) => sum + r.stress, 0) / recent.length
          };

          const previousAvg = {
            mood: previous.reduce((sum, p) => sum + p.mood, 0) / previous.length,
            energy: previous.reduce((sum, p) => sum + p.energy, 0) / previous.length,
            stress: previous.reduce((sum, p) => sum + p.stress, 0) / previous.length
          };

          trends.mood = ((recentAvg.mood - previousAvg.mood) / previousAvg.mood) * 100;
          trends.energy = ((recentAvg.energy - previousAvg.energy) / previousAvg.energy) * 100;
          trends.stress = ((recentAvg.stress - previousAvg.stress) / previousAvg.stress) * 100;
        }
      }

      res.json({
        success: true,
        data: {
          history: moodHistory,
          trends,
          summary: {
            totalEntries: moodHistory.length,
            dateRange: { startDate, endDate }
          }
        }
      });

    } catch (error) {
      console.error('Get mood history error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   GET /api/analytics/patterns
 * @desc    Get behavior patterns analysis
 * @access  Private
 */
router.get('/patterns', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get analytics data
    const analytics = await Analytics.getDateRange(req.user._id, startDate, new Date());

    // Analyze patterns
    const patterns = {
      moodByDayOfWeek: {},
      energyByDayOfWeek: {},
      stressPatterns: {},
      productivityTrends: {},
      bestDays: [],
      challengingDays: []
    };

    // Group by day of week
    analytics.forEach(entry => {
      const dayOfWeek = entry.date.toLocaleDateString('pt-BR', { weekday: 'long' });
      
      if (!patterns.moodByDayOfWeek[dayOfWeek]) {
        patterns.moodByDayOfWeek[dayOfWeek] = { total: 0, count: 0 };
        patterns.energyByDayOfWeek[dayOfWeek] = { total: 0, count: 0 };
      }
      
      patterns.moodByDayOfWeek[dayOfWeek].total += entry.mood;
      patterns.moodByDayOfWeek[dayOfWeek].count += 1;
      patterns.energyByDayOfWeek[dayOfWeek].total += entry.energy;
      patterns.energyByDayOfWeek[dayOfWeek].count += 1;

      // Identify best and challenging days
      const wellbeingScore = (entry.mood + entry.energy + (11 - entry.stress)) / 3;
      
      if (wellbeingScore >= 7) {
        patterns.bestDays.push({
          date: entry.date,
          score: wellbeingScore,
          mood: entry.mood,
          energy: entry.energy,
          stress: entry.stress
        });
      } else if (wellbeingScore <= 4) {
        patterns.challengingDays.push({
          date: entry.date,
          score: wellbeingScore,
          mood: entry.mood,
          energy: entry.energy,
          stress: entry.stress
        });
      }
    });

    // Calculate averages
    Object.keys(patterns.moodByDayOfWeek).forEach(day => {
      const moodData = patterns.moodByDayOfWeek[day];
      const energyData = patterns.energyByDayOfWeek[day];
      
      patterns.moodByDayOfWeek[day] = Math.round(moodData.total / moodData.count * 10) / 10;
      patterns.energyByDayOfWeek[day] = Math.round(energyData.total / energyData.count * 10) / 10;
    });

    // Sort best and challenging days
    patterns.bestDays.sort((a, b) => b.score - a.score).slice(0, 5);
    patterns.challengingDays.sort((a, b) => a.score - b.score).slice(0, 5);

    res.json({
      success: true,
      data: {
        patterns,
        insights: [
          `Seu melhor dia da semana é ${Object.keys(patterns.moodByDayOfWeek).reduce((a, b) => 
            patterns.moodByDayOfWeek[a] > patterns.moodByDayOfWeek[b] ? a : b)}`,
          `Você teve ${patterns.bestDays.length} dias excepcionais no período analisado`,
          patterns.challengingDays.length > 0 ? 
            `${patterns.challengingDays.length} dias foram mais desafiadores - considere identificar padrões` :
            'Você manteve um bom equilíbrio emocional no período'
        ]
      }
    });

  } catch (error) {
    console.error('Get patterns error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/analytics/insights
 * @desc    Get AI-generated insights
 * @access  Private
 */
router.get('/insights', auth, async (req, res) => {
  try {
    const { days = 7, category } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get recent analytics with insights
    const query = {
      userId: req.user._id,
      date: { $gte: startDate },
      insights: { $ne: [] }
    };

    const analyticsWithInsights = await Analytics.find(query)
      .sort({ date: -1 })
      .select('date insights recommendations')
      .lean();

    // Flatten and categorize insights
    let allInsights = [];
    let allRecommendations = [];

    analyticsWithInsights.forEach(entry => {
      entry.insights.forEach(insight => {
        if (!category || insight.category === category) {
          allInsights.push({
            ...insight,
            date: entry.date
          });
        }
      });

      entry.recommendations.forEach(rec => {
        if (!category || rec.category === category) {
          allRecommendations.push({
            ...rec,
            date: entry.date
          });
        }
      });
    });

    // Sort by priority and confidence
    allInsights.sort((a, b) => {
      const priorityOrder = { 'alta': 3, 'media': 2, 'baixa': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });

    allRecommendations.sort((a, b) => {
      const urgencyOrder = { 'alta': 3, 'media': 2, 'baixa': 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });

    res.json({
      success: true,
      data: {
        insights: allInsights.slice(0, 10), // Top 10 insights
        recommendations: allRecommendations.slice(0, 5), // Top 5 recommendations
        categories: ['humor', 'produtividade', 'relacionamentos', 'objetivos', 'bem_estar'],
        summary: {
          totalInsights: allInsights.length,
          totalRecommendations: allRecommendations.length,
          period: `${days} dias`
        }
      }
    });

  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/analytics/progress
 * @desc    Get progress analytics
 * @access  Private
 */
router.get('/progress', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get analytics for period
    const analytics = await Analytics.getDateRange(req.user._id, startDate, new Date());

    // Get goals progress
    const goals = await Goal.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).select('progress status category createdAt completedAt');

    // Calculate progress metrics
    const progressMetrics = {
      overallWellbeing: 0,
      moodStability: 0,
      energyLevels: 0,
      stressManagement: 0,
      goalAchievement: 0,
      conversationEngagement: 0
    };

    if (analytics.length > 0) {
      // Calculate wellbeing trend
      const recentWellbeing = analytics.slice(-7).reduce((sum, a) => sum + (a.progress?.overallWellbeing || 0), 0) / 7;
      const earlierWellbeing = analytics.slice(0, 7).reduce((sum, a) => sum + (a.progress?.overallWellbeing || 0), 0) / 7;
      progressMetrics.overallWellbeing = recentWellbeing - earlierWellbeing;

      // Mood stability (lower variance = better)
      const moods = analytics.map(a => a.mood);
      const avgMood = moods.reduce((sum, m) => sum + m, 0) / moods.length;
      const variance = moods.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / moods.length;
      progressMetrics.moodStability = Math.max(0, 100 - variance * 10);

      // Energy levels trend
      const recentEnergy = analytics.slice(-7).reduce((sum, a) => sum + a.energy, 0) / 7;
      const earlierEnergy = analytics.slice(0, 7).reduce((sum, a) => sum + a.energy, 0) / 7;
      progressMetrics.energyLevels = ((recentEnergy - earlierEnergy) / earlierEnergy) * 100;

      // Stress management (improvement = lower stress)
      const recentStress = analytics.slice(-7).reduce((sum, a) => sum + a.stress, 0) / 7;
      const earlierStress = analytics.slice(0, 7).reduce((sum, a) => sum + a.stress, 0) / 7;
      progressMetrics.stressManagement = ((earlierStress - recentStress) / earlierStress) * 100;
    }

    // Goal achievement
    const completedGoals = goals.filter(g => g.status === 'concluido').length;
    const totalGoals = goals.length;
    progressMetrics.goalAchievement = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // Conversation engagement
    const totalConversations = analytics.reduce((sum, a) => sum + (a.activities?.conversationCount || 0), 0);
    progressMetrics.conversationEngagement = totalConversations;

    res.json({
      success: true,
      data: {
        progressMetrics,
        period,
        summary: {
          totalDays: analytics.length,
          avgMood: analytics.length > 0 ? 
            Math.round(analytics.reduce((sum, a) => sum + a.mood, 0) / analytics.length * 10) / 10 : 0,
          goalsCompleted: completedGoals,
          totalGoals,
          conversationsHad: totalConversations
        },
        trends: {
          improving: Object.entries(progressMetrics).filter(([_, value]) => value > 0).map(([key, _]) => key),
          stable: Object.entries(progressMetrics).filter(([_, value]) => Math.abs(value) <= 5).map(([key, _]) => key),
          needsAttention: Object.entries(progressMetrics).filter(([_, value]) => value < -5).map(([key, _]) => key)
        }
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;