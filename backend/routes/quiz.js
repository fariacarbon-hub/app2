const express = require('express');
const { body, validationResult } = require('express-validator');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Quiz questions data
const quizQuestions = [
  {
    id: 1,
    question: "Como você se sente quando está sozinho(a)?",
    type: "scale",
    options: [
      { value: 1, label: "Muito desconfortável" },
      { value: 2, label: "Desconfortável" },
      { value: 3, label: "Neutro" },
      { value: 4, label: "Confortável" },
      { value: 5, label: "Muito confortável" }
    ]
  },
  {
    id: 2,
    question: "O que mais te preocupa atualmente?",
    type: "multiple",
    options: [
      { value: "relacionamentos", label: "Relacionamentos" },
      { value: "carreira", label: "Carreira" },
      { value: "saude", label: "Saúde" },
      { value: "financas", label: "Finanças" },
      { value: "autoestima", label: "Autoestima" }
    ]
  },
  {
    id: 3,
    question: "Como você lidaria com uma decisão difícil no trabalho?",
    type: "text",
    placeholder: "Descreva seu processo de tomada de decisão..."
  },
  {
    id: 4,
    question: "Quais são seus principais objetivos de vida?",
    type: "multiple",
    options: [
      { value: "crescimento_pessoal", label: "Crescimento pessoal" },
      { value: "sucesso_profissional", label: "Sucesso profissional" },
      { value: "relacionamentos_saudaveis", label: "Relacionamentos saudáveis" },
      { value: "saude_mental", label: "Saúde mental" },
      { value: "estabilidade_financeira", label: "Estabilidade financeira" }
    ]
  },
  {
    id: 5,
    question: "Como você reage ao estresse?",
    type: "single",
    options: [
      { value: "isolamento", label: "Me isolo das outras pessoas" },
      { value: "busco_ajuda", label: "Busco ajuda de amigos ou familiares" },
      { value: "exercicios", label: "Faço exercícios ou atividades físicas" },
      { value: "procrastino", label: "Procrastino ou evito o problema" },
      { value: "enfrento", label: "Enfrento o problema diretamente" }
    ]
  }
];

/**
 * @route   GET /api/quiz/questions
 * @desc    Get quiz questions
 * @access  Public
 */
router.get('/questions', (req, res) => {
  res.json({
    success: true,
    data: {
      questions: quizQuestions
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
      const requiredQuestions = quizQuestions.map(q => q.id.toString());
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

      // Generate AI analysis
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
          scores: {},
          traits: aiAnalysis ? aiAnalysis.personality_analysis.traits : [],
          insights: aiAnalysis ? aiAnalysis.insights : [],
          recommendations: aiAnalysis ? aiAnalysis.recommendations.map(rec => ({
            category: 'Geral',
            recommendation: rec,
            priority: 'media'
          })) : []
        },
        aiAnalysis: aiAnalysis ? {
          personalityType: 'Explorador',
          dominantTraits: aiAnalysis.personality_analysis.strengths || [],
          growthAreas: aiAnalysis.personality_analysis.growth_areas || [],
          strengths: aiAnalysis.personality_analysis.strengths || [],
          communicationStyle: aiAnalysis.personality_analysis.communication_style || 'reflexivo',
          motivationalFactors: ['Autoconhecimento', 'Crescimento pessoal'],
          stressIndicators: ['Pressão no trabalho', 'Incertezas'],
          copingStrategies: ['Mindfulness', 'Conversa com IA'],
          confidenceScore: 0.8
        } : {}
      });

      // Calculate basic scores from answers
      const scores = {};
      
      // Loneliness/Social comfort score (question 1)
      if (answers['1']) {
        scores.conforto_social = parseInt(answers['1']) * 2; // Scale to 10
      }
      
      // Stress response (question 5)
      if (answers['5']) {
        const stressResponse = answers['5'];
        switch (stressResponse) {
          case 'enfrento':
            scores.gestao_estresse = 9;
            break;
          case 'busco_ajuda':
            scores.gestao_estresse = 8;
            break;
          case 'exercicios':
            scores.gestao_estresse = 7;
            break;
          case 'procrastino':
            scores.gestao_estresse = 4;
            break;
          case 'isolamento':
            scores.gestao_estresse = 3;
            break;
          default:
            scores.gestao_estresse = 5;
        }
      }

      // Decision making (based on text response quality)
      if (answers['3'] && typeof answers['3'] === 'string') {
        const responseLength = answers['3'].length;
        scores.tomada_decisao = Math.min(10, Math.max(3, Math.floor(responseLength / 10) + 3));
      }

      quizResult.results.scores = scores;

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