const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

/**
 * @route   POST /api/ai/generate
 * @desc    Generate dynamic AI response with no limitations
 * @access  Private
 */
router.post('/generate', [
  auth,
  body('userMessage')
    .trim()
    .notEmpty()
    .withMessage('Mensagem do usuário é obrigatória')
    .isLength({ max: 2000 })
    .withMessage('Mensagem muito longa')
], async (req, res) => {
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

    const { systemPrompt, userMessage, conversationHistory = [] } = req.body;
    const userId = req.user.userId;

    console.log('🤖 Generating unrestricted AI response for:', userMessage.substring(0, 50));

    // Use AI service to generate completely free response
    const aiResult = await aiService.generateUnrestrictedResponse(
      userId, 
      conversationHistory, 
      userMessage, 
      systemPrompt
    );

    if (aiResult.success) {
      res.json({
        success: true,
        response: aiResult.message,
        metadata: aiResult.metadata
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro na geração da resposta IA',
        error: aiResult.error
      });
    }

  } catch (error) {
    console.error('AI generate route error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/ai/context
 * @desc    Analyze conversation context and generate insights
 * @access  Private
 */
router.post('/context', [
  auth,
  body('messages')
    .isArray({ min: 1 })
    .withMessage('Mensagens da conversa são obrigatórias')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { messages } = req.body;
    const userId = req.user.userId;

    // Analyze conversation context
    const contextAnalysis = await aiService.analyzeConversationContext(userId, messages);

    res.json({
      success: true,
      data: {
        context: contextAnalysis,
        suggestions: contextAnalysis.suggestions || [],
        mood: contextAnalysis.detectedMood || 'neutral',
        topics: contextAnalysis.detectedTopics || []
      }
    });

  } catch (error) {
    console.error('Context analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na análise de contexto'
    });
  }
});

module.exports = router;