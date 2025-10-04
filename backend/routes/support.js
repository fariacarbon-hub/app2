const express = require('express');
const { body, validationResult } = require('express-validator');
const { optionalAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    message: 'Muitas mensagens enviadas. Tente novamente em 1 hora.'
  }
});

// FAQ data
const faqData = [
  {
    id: 1,
    question: "O que é um Gêmeo IA?",
    answer: "Seu Gêmeo IA é um modelo de inteligência artificial personalizado que aprende especificamente sobre você - seus valores, padrões de pensamento, objetivos e experiências. Ao contrário de assistentes de IA genéricos, seu Gêmeo IA se torna unicamente seu, fornecendo insights e orientação adaptados à sua personalidade e necessidades específicas.",
    category: "produto"
  },
  {
    id: 2,
    question: "Meu Gêmeo IA pode substituir a terapia?",
    answer: "Não, o YOU não substitui a terapia profissional ou o aconselhamento de saúde mental. É uma ferramenta complementar projetada para apoiar seu crescimento pessoal e autoconsciência. Se você estiver lidando com problemas sérios de saúde mental, recomendamos procurar ajuda de um profissional qualificado.",
    category: "saude"
  },
  {
    id: 3,
    question: "Como meu Gêmeo IA personaliza sua orientação?",
    answer: "Seu Gêmeo IA aprende através de suas conversas, respostas ao questionário inicial e interações contínuas. Ele identifica seus padrões únicos, valores e objetivos para fornecer insights personalizados que se tornam mais precisos ao longo do tempo.",
    category: "produto"
  },
  {
    id: 4,
    question: "Posso usar meu Gêmeo IA se já estiver fazendo terapia?",
    answer: "Absolutamente! O YOU pode complementar sua terapia existente fornecendo suporte contínuo entre as sessões. Muitos usuários acham útil ter acesso 24/7 a insights personalizados e um espaço seguro para refletir.",
    category: "saude"
  },
  {
    id: 5,
    question: "Meus dados estão seguros?",
    answer: "Sim, levamos a privacidade muito a sério. Todas as suas conversas são criptografadas e seus dados nunca são compartilhados com terceiros. Você tem controle total sobre suas informações pessoais.",
    category: "privacidade"
  },
  {
    id: 6,
    question: "Quanto custa o YOU?",
    answer: "Oferecemos uma primeira sessão gratuita para você experimentar. Nossos planos pagos começam em R$ 29,90/mês para o plano Básico, com opções Premium e Enterprise disponíveis com recursos adicionais.",
    category: "preco"
  },
  {
    id: 7,
    question: "Como faço para cancelar minha assinatura?",
    answer: "Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta ou entrando em contato com nosso suporte. Não há taxas de cancelamento e você manterá acesso aos recursos premium até o final do período de cobrança atual.",
    category: "conta"
  },
  {
    id: 8,
    question: "O que acontece com meus dados se eu cancelar?",
    answer: "Seus dados permanecerão seguros e você poderá exportá-los a qualquer momento. Se desejar deletar permanentemente sua conta e todos os dados, você pode fazer isso nas configurações da conta.",
    category: "conta"
  },
  {
    id: 9,
    question: "O YOU funciona em dispositivos móveis?",
    answer: "Sim! O YOU é totalmente responsivo e funciona perfeitamente em smartphones, tablets e computadores. Você pode acessar seu Gêmeo IA a qualquer hora, em qualquer lugar.",
    category: "tecnico"
  },
  {
    id: 10,
    question: "Como posso melhorar as respostas do meu Gêmeo IA?",
    answer: "Quanto mais você conversa e compartilha sobre si mesmo, melhor seu Gêmeo IA te entende. Seja honesto sobre seus sentimentos, forneça feedback sobre as respostas e refaça o questionário periodicamente para manter seu perfil atualizado.",
    category: "produto"
  }
];

/**
 * @route   POST /api/support/contact
 * @desc    Send contact message
 * @access  Public (with rate limiting)
 */
router.post('/contact',
  contactLimiter,
  optionalAuth,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Assunto deve ter entre 5 e 200 caracteres'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Mensagem deve ter entre 10 e 2000 caracteres'),
    body('category')
      .optional()
      .isIn(['geral', 'tecnico', 'billing', 'feedback', 'bug'])
      .withMessage('Categoria inválida')
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

      const { name, email, subject, message, category = 'geral' } = req.body;

      // In a real application, this would:
      // 1. Save to database
      // 2. Send email notification to support team
      // 3. Send confirmation email to user
      // 4. Create support ticket in system

      // For now, we'll just log and return success
      console.log('Contact form submission:', {
        name,
        email,
        subject,
        message,
        category,
        userId: req.user?._id || null,
        timestamp: new Date()
      });

      // Simulate different response times based on category
      const responseTime = {
        'geral': '24 horas',
        'tecnico': '12 horas',
        'billing': '6 horas',
        'feedback': '48 horas',
        'bug': '8 horas'
      };

      res.status(201).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: {
          ticketId: `YOU-${Date.now()}`,
          expectedResponse: responseTime[category],
          nextSteps: [
            'Sua mensagem foi recebida e será analisada por nossa equipe',
            `Você receberá uma resposta em até ${responseTime[category]}`,
            'Mantenha este ID do ticket para referência futura'
          ]
        }
      });

    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   GET /api/support/faq
 * @desc    Get FAQ items
 * @access  Public
 */
router.get('/faq', (req, res) => {
  try {
    const { category, search, limit } = req.query;

    let filteredFAQ = [...faqData];

    // Filter by category
    if (category) {
      filteredFAQ = filteredFAQ.filter(item => item.category === category);
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredFAQ = filteredFAQ.filter(item =>
        item.question.toLowerCase().includes(searchTerm) ||
        item.answer.toLowerCase().includes(searchTerm)
      );
    }

    // Limit results
    if (limit && !isNaN(parseInt(limit))) {
      filteredFAQ = filteredFAQ.slice(0, parseInt(limit));
    }

    // Get categories for filtering
    const categories = [...new Set(faqData.map(item => item.category))];

    res.json({
      success: true,
      data: {
        faq: filteredFAQ,
        categories,
        total: filteredFAQ.length,
        filters: {
          category: category || null,
          search: search || null
        }
      }
    });

  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   POST /api/support/feedback
 * @desc    Submit user feedback
 * @access  Private
 */
router.post('/feedback',
  optionalAuth,
  [
    body('type')
      .isIn(['bug', 'feature_request', 'improvement', 'compliment', 'complaint'])
      .withMessage('Tipo de feedback inválido'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Avaliação deve ser entre 1 e 5'),
    body('feedback')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Feedback deve ter entre 10 e 1000 caracteres'),
    body('page')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Página deve ter no máximo 100 caracteres')
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

      const { type, rating, feedback, page } = req.body;

      // In a real application, save to database
      console.log('Feedback submission:', {
        type,
        rating,
        feedback,
        page,
        userId: req.user?._id || 'anonymous',
        timestamp: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Feedback enviado com sucesso',
        data: {
          feedbackId: `FB-${Date.now()}`,
          message: 'Obrigado pelo seu feedback! Ele nos ajuda a melhorar o YOU continuamente.'
        }
      });

    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @route   GET /api/support/status
 * @desc    Get system status
 * @access  Public
 */
router.get('/status', (req, res) => {
  try {
    // In a real application, check various system components
    const status = {
      api: 'operational',
      database: 'operational',
      ai_service: 'operational',
      chat: 'operational',
      analytics: 'operational',
      last_updated: new Date()
    };

    const allOperational = Object.values(status).every(
      (value, index) => index === Object.values(status).length - 1 || value === 'operational'
    );

    res.json({
      success: true,
      data: {
        overall_status: allOperational ? 'operational' : 'partial_outage',
        services: status,
        uptime: '99.9%',
        response_time: '< 200ms'
      }
    });

  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route   GET /api/support/help
 * @desc    Get contextual help
 * @access  Public
 */
router.get('/help', (req, res) => {
  try {
    const { topic } = req.query;

    const helpTopics = {
      'getting-started': {
        title: 'Primeiros Passos',
        content: [
          'Faça o questionário de personalidade para configurar seu Gêmeo IA',
          'Comece uma conversa sobre algo que está em sua mente',
          'Defina seus primeiros objetivos pessoais',
          'Explore os diferentes tipos de apoio disponíveis'
        ],
        related_links: [
          { title: 'Fazer Quiz', url: '/quiz' },
          { title: 'Ver Preços', url: '/precos' }
        ]
      },
      'chat': {
        title: 'Como Conversar com seu Gêmeo IA',
        content: [
          'Seja honesto sobre seus sentimentos e pensamentos',
          'Compartilhe contexto sobre situações específicas',
          'Faça perguntas abertas para reflexão',
          'Avalie as respostas para melhorar a personalização'
        ],
        related_links: [
          { title: 'Iniciar Conversa', url: '/conversa' }
        ]
      },
      'goals': {
        title: 'Gerenciamento de Objetivos',
        content: [
          'Defina objetivos específicos e mensuráveis',
          'Estabeleça prazos realistas',
          'Acompanhe seu progresso regularmente',
          'Use os insights da IA para ajustes'
        ],
        related_links: [
          { title: 'Meus Objetivos', url: '/objetivos' }
        ]
      },
      'privacy': {
        title: 'Privacidade e Segurança',
        content: [
          'Todas as conversas são criptografadas',
          'Seus dados nunca são compartilhados',
          'Você pode exportar ou deletar seus dados',
          'Controle total sobre configurações de privacidade'
        ],
        related_links: [
          { title: 'Configurações', url: '/configuracoes' }
        ]
      }
    };

    if (topic && helpTopics[topic]) {
      res.json({
        success: true,
        data: {
          topic: helpTopics[topic]
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          topics: Object.keys(helpTopics).map(key => ({
            id: key,
            title: helpTopics[key].title
          })),
          featured: helpTopics['getting-started']
        }
      });
    }

  } catch (error) {
    console.error('Get help error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;