const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { auth, requireSubscription } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', 
  auth,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
    query('archived').optional().isBoolean().withMessage('Archived deve ser boolean')
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

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const archived = req.query.archived === 'true';
      const skip = (page - 1) * limit;

      const conversations = await Conversation.find({ 
        userId: req.user._id,
        archived
      })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title lastMessageAt messageCount tags sentiment topics starred aiAnalysis')
        .lean();

      const total = await Conversation.countDocuments({ 
        userId: req.user._id,
        archived
      });

      res.json({
        success: true,
        data: {
          conversations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   POST /api/chat/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post('/conversations',
  auth,
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Título deve ter entre 1 e 200 caracteres'),
    body('initialMessage')
      .optional()
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Mensagem inicial deve ter entre 1 e 10000 caracteres')
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

      const { title, initialMessage } = req.body;

      // Create new conversation
      const conversation = new Conversation({
        userId: req.user._id,
        title,
        sessionType: 'chat'
      });

      await conversation.save();

      // If there's an initial message, create it and get AI response
      let messages = [];
      if (initialMessage) {
        // Create user message
        const userMessage = new Message({
          conversationId: conversation._id,
          userId: req.user._id,
          type: 'user',
          content: initialMessage
        });
        await userMessage.save();
        messages.push(userMessage);

        // Generate AI response
        const aiResponse = await aiService.generateResponse(
          req.user._id,
          [],
          initialMessage,
          req.user
        );

        if (aiResponse.success) {
          const aiMessage = new Message({
            conversationId: conversation._id,
            userId: req.user._id,
            type: 'ai',
            content: aiResponse.message,
            aiModel: aiResponse.metadata.model,
            responseTime: aiResponse.metadata.responseTime,
            tokens: aiResponse.metadata.tokens
          });
          await aiMessage.save();
          messages.push(aiMessage);

          // Analyze user message sentiment
          const sentimentAnalysis = await aiService.analyzeMessage(initialMessage);
          if (sentimentAnalysis.success) {
            userMessage.sentiment = sentimentAnalysis.analysis.sentiment;
            userMessage.emotions = sentimentAnalysis.analysis.emotions;
            userMessage.topics = sentimentAnalysis.analysis.topics;
            await userMessage.save();
          }
        }

        // Update conversation
        await conversation.updateLastMessage();
        
        // Update user stats
        req.user.stats.totalMessages += messages.length;
        req.user.stats.totalSessions += 1;
        await req.user.save();
      }

      res.status(201).json({
        success: true,
        message: 'Conversa criada com sucesso',
        data: {
          conversation,
          messages
        }
      });

    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   GET /api/chat/conversations/:id
 * @desc    Get conversation details
 * @access  Private
 */
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversa não encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        conversation
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de conversa inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   DELETE /api/chat/conversations/:id
 * @desc    Delete conversation
 * @access  Private
 */
router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversa não encontrada'
      });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversationId: conversation._id });
    
    // Delete conversation
    await Conversation.findByIdAndDelete(conversation._id);

    res.json({
      success: true,
      message: 'Conversa deletada com sucesso'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de conversa inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/chat/conversations/:id/messages
 * @desc    Get conversation messages
 * @access  Private
 */
router.get('/conversations/:id/messages',
  auth,
  [
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

      // Verify conversation belongs to user
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversa não encontrada'
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const messages = await Message.find({
        conversationId: req.params.id,
        deleted: { $ne: true }
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Reverse to show oldest first
      messages.reverse();

      const total = await Message.countDocuments({
        conversationId: req.params.id,
        deleted: { $ne: true }
      });

      res.json({
        success: true,
        data: {
          messages,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get messages error:', error);
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
  }
);

/**
 * @route   POST /api/chat/conversations/:id/messages
 * @desc    Send message in conversation
 * @access  Private
 */
router.post('/conversations/:id/messages',
  auth,
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Mensagem deve ter entre 1 e 10000 caracteres')
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

      const { content } = req.body;

      // Verify conversation belongs to user
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversa não encontrada'
        });
      }

      // Create user message
      const userMessage = new Message({
        conversationId: conversation._id,
        userId: req.user._id,
        type: 'user',
        content
      });
      await userMessage.save();

      // Get conversation history for context
      const conversationHistory = await Message.getConversationContext(
        conversation._id,
        20
      );

      // Generate AI response
      const aiResponse = await aiService.generateResponse(
        req.user._id,
        conversationHistory.reverse(), // Reverse to chronological order
        content,
        req.user
      );

      let aiMessage = null;
      if (aiResponse.success) {
        aiMessage = new Message({
          conversationId: conversation._id,
          userId: req.user._id,
          type: 'ai',
          content: aiResponse.message,
          aiModel: aiResponse.metadata.model,
          responseTime: aiResponse.metadata.responseTime,
          tokens: aiResponse.metadata.tokens
        });
        await aiMessage.save();
      }

      // Analyze user message sentiment (async)
      aiService.analyzeMessage(content).then(async (sentimentAnalysis) => {
        if (sentimentAnalysis.success) {
          userMessage.sentiment = sentimentAnalysis.analysis.sentiment;
          userMessage.emotions = sentimentAnalysis.analysis.emotions;
          userMessage.topics = sentimentAnalysis.analysis.topics;
          await userMessage.save();
          
          // Update conversation sentiment if needed
          if (sentimentAnalysis.analysis.urgency === 'alta') {
            conversation.aiAnalysis.needsFollowUp = true;
            if (sentimentAnalysis.analysis.needs_followup) {
              conversation.aiAnalysis.riskFlags = ['urgent'];
            }
            await conversation.save();
          }
        }
      }).catch(console.error);

      // Update conversation
      await conversation.updateLastMessage();

      // Update user stats
      req.user.stats.totalMessages += aiMessage ? 2 : 1;
      await req.user.calculateGrowthScore();

      const responseMessages = [userMessage];
      if (aiMessage) responseMessages.push(aiMessage);

      res.status(201).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: {
          messages: responseMessages
        }
      });

    } catch (error) {
      console.error('Send message error:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de conversa inválido'
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
 * @route   PUT /api/chat/messages/:id/rating
 * @desc    Rate AI message
 * @access  Private
 */
router.put('/messages/:id/rating',
  auth,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating deve ser entre 1 e 5'),
    body('helpful').optional().isBoolean(),
    body('feedback').optional().trim().isLength({ max: 1000 })
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

      const { rating, helpful, feedback } = req.body;

      const message = await Message.findOne({
        _id: req.params.id,
        userId: req.user._id,
        type: 'ai'
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem não encontrada'
        });
      }

      await message.addFeedback(rating, helpful, feedback);

      res.json({
        success: true,
        message: 'Avaliação registrada com sucesso'
      });

    } catch (error) {
      console.error('Rate message error:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de mensagem inválido'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

module.exports = router;