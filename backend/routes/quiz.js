const express = require('express');
const { body, validationResult } = require('express-validator');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');
const { personalityQuestions, analyzePersonality } = require('../data/quizQuestions');

const router = express.Router();

// Use imported quiz questions

/**
 * @route   GET /api/quiz/questions
 * @desc    Get quiz questions
 * @access  Public
 */
router.get('/questions', (req, res) => {
  res.json({
    success: true,
    data: {
      questions: personalityQuestions
    }
  });
});

/**
 * @route   POST /api/quiz/submit
 * @desc    Submit quiz answers
 * @access  Private
 */
router.post('/submit',
  auth,
  [
    body('quizType')
      .isIn(['personalidade', 'humor', 'avaliacao_inicial', 'check_in_semanal'])
      .withMessage('Tipo de quiz inválido'),
    body('answers')
      .isObject()
      .withMessage('Respostas devem ser um objeto'),
    body('completionTime')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tempo de conclusão deve ser um número positivo')
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

      const { quizType, answers, completionTime } = req.body;

      // Validate answers have required questions
      const requiredQuestions = personalityQuestions.map(q => q.id.toString());
      const providedQuestions = Object.keys(answers);
      
      const missingQuestions = requiredQuestions.filter(q => !providedQuestions.includes(q));
      if (missingQuestions.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Algumas perguntas não foram respondidas',
          missing_questions: missingQuestions
        });
      }

      // Get previous results for comparison
      const previousResult = await QuizResult.getLatestByType(req.user._id, quizType);

      // Analyze personality using local algorithm
      const personalityAnalysis = analyzePersonality(answers);
      
      // Generate AI insights using the service
      let aiAnalysis = null;
      try {
        const analysisResult = await aiService.generateQuizInsights(
          answers,
          previousResult ? previousResult.results : null
        );
        
        if (analysisResult.success) {
          aiAnalysis = analysisResult.analysis;
        }
      } catch (aiError) {
        console.error('Quiz AI analysis error:', aiError);
      }

      // Create quiz result
      const quizResult = new QuizResult({
        userId: req.user._id,
        quizType,
        answers,
        completionTime,
        results: {
          scores: personalityAnalysis.scores,
          traits: personalityAnalysis.traits,
          insights: personalityAnalysis.insights,
          recommendations: personalityAnalysis.recommendations.map(rec => ({
            category: 'Geral',
            recommendation: rec,
            priority: 'media'
          })),
          communicationStyle: personalityAnalysis.overallStyle.name,
          growthAreas: aiAnalysis?.analysis?.growth_plan?.focus_areas || ['autoconhecimento'],
          overallStyle: personalityAnalysis.overallStyle
        },
        aiAnalysis: {
          personalityType: personalityAnalysis.overallStyle.name,
          dominantTraits: personalityAnalysis.traits.map(t => t.name),
          growthAreas: aiAnalysis?.personality_analysis?.growth_areas || ['autoconhecimento'],
          strengths: personalityAnalysis.traits.filter(t => t.level === 'Alto').map(t => t.name),
          communicationStyle: personalityAnalysis.overallStyle.name,
          motivationalFactors: ['Autoconhecimento', 'Crescimento pessoal'],
          stressIndicators: ['Pressão no trabalho', 'Incertezas'],
          copingStrategies: ['Mindfulness', 'Conversa com IA'],
          confidenceScore: 0.8,
          localAnalysis: personalityAnalysis
        }
      });

      // Scores are now calculated by the personality analysis function

      await quizResult.save();

      // Calculate insights and recommendations
      await quizResult.calculateInsights();
      await quizResult.generateRecommendations();

      // Compare with previous results if available
      if (previousResult) {
        await quizResult.compareWithPrevious();
      }

      // Update user's AI profile
      const user = await User.findById(req.user._id);
      user.aiProfile.personality = {
        ...user.aiProfile.personality,
        ...answers
      };
      user.aiProfile.lastUpdated = new Date();
      
      // Set conversation style based on quiz results
      if (answers['5'] === 'busco_ajuda') {
        user.aiProfile.conversationStyle = 'supportive';
      } else if (answers['5'] === 'enfrento') {
        user.aiProfile.conversationStyle = 'analytical';
      } else {
        user.aiProfile.conversationStyle = 'gentle';
      }

      await user.save();

      res.status(201).json({
        success: true,
        message: 'Quiz submetido com sucesso',
        data: {
          result: quizResult
        }
      });

    } catch (error) {
      console.error('Submit quiz error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   GET /api/quiz/results
 * @desc    Get user's quiz results
 * @access  Private
 */
router.get('/results', auth, async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;

    const query = { userId: req.user._id };
    if (type) query.quizType = type;

    const results = await QuizResult.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        results
      }
    });

  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/quiz/results/:id
 * @desc    Get specific quiz result
 * @access  Private
 */
router.get('/results/:id', auth, async (req, res) => {
  try {
    const result = await QuizResult.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Resultado não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        result
      }
    });

  } catch (error) {
    console.error('Get quiz result error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de resultado inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/quiz/progress/:trait
 * @desc    Get progress over time for a specific trait
 * @access  Private
 */
router.get('/progress/:trait', auth, async (req, res) => {
  try {
    const { trait } = req.params;
    const { quizType = 'personalidade' } = req.query;

    const progress = await QuizResult.getProgressOverTime(
      req.user._id,
      quizType,
      trait
    );

    res.json({
      success: true,
      data: {
        trait,
        quizType,
        progress: progress.map(p => ({
          date: p.createdAt,
          value: p.results.scores[trait]
        }))
      }
    });

  } catch (error) {
    console.error('Get trait progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;