const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const goalsRoutes = require('./routes/goals');
const quizRoutes = require('./routes/quiz');
const analyticsRoutes = require('./routes/analytics');
const supportRoutes = require('./routes/support');

const app = express();
const server = createServer(app);

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(limiter);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.emergent.sh"]
    }
  }
}));
app.use(compression());
// app.use(mongoSanitize()); // Temporarily disabled due to compatibility issue

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'YOU API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/support', supportRoutes);

// Root API endpoint
app.get('/api/', (req, res) => {
  res.json({
    message: 'YOU API - Seu Gêmeo IA',
    version: '1.0.0',
    documentation: '/api/docs',
    status: 'operational',
    features: [
      'Autenticação JWT',
      'Chat com IA personalizada',
      'Gerenciamento de objetivos',
      'Análises comportamentais',
      'Questionários de personalidade',
      'Sistema de suporte'
    ]
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'YOU API Documentation',
    version: '1.0.0',
    description: 'API completa para o aplicativo YOU - Seu Gêmeo IA personalizado',
    baseURL: '/api',
    authentication: 'Bearer Token (JWT)',
    endpoints: {
      auth: {
        'POST /auth/register': 'Registrar novo usuário',
        'POST /auth/login': 'Login do usuário',
        'POST /auth/logout': 'Logout do usuário',
        'GET /auth/me': 'Obter dados do usuário atual',
        'POST /auth/refresh': 'Renovar token JWT',
        'POST /auth/forgot-password': 'Solicitar redefinição de senha',
        'POST /auth/reset-password': 'Redefinir senha'
      },
      user: {
        'GET /user/profile': 'Obter perfil do usuário',
        'PUT /user/profile': 'Atualizar perfil',
        'GET /user/settings': 'Obter configurações',
        'PUT /user/settings': 'Atualizar configurações',
        'GET /user/stats': 'Obter estatísticas do usuário',
        'POST /user/change-password': 'Alterar senha',
        'DELETE /user/account': 'Deletar conta',
        'GET /user/data': 'Exportar dados'
      },
      chat: {
        'GET /chat/conversations': 'Listar conversas',
        'POST /chat/conversations': 'Criar nova conversa',
        'GET /chat/conversations/:id': 'Obter detalhes da conversa',
        'DELETE /chat/conversations/:id': 'Deletar conversa',
        'GET /chat/conversations/:id/messages': 'Obter mensagens',
        'POST /chat/conversations/:id/messages': 'Enviar mensagem',
        'PUT /chat/messages/:id/rating': 'Avaliar resposta da IA'
      },
      goals: {
        'GET /goals': 'Listar objetivos',
        'POST /goals': 'Criar novo objetivo',
        'GET /goals/:id': 'Obter detalhes do objetivo',
        'PUT /goals/:id': 'Atualizar objetivo',
        'DELETE /goals/:id': 'Deletar objetivo',
        'POST /goals/:id/progress': 'Atualizar progresso',
        'GET /goals/:id/insights': 'Obter insights da IA',
        'POST /goals/:id/milestones': 'Adicionar marco',
        'PUT /goals/:id/milestones/:milestoneId': 'Completar marco'
      },
      quiz: {
        'GET /quiz/questions': 'Obter perguntas do questionário',
        'POST /quiz/submit': 'Submeter respostas',
        'GET /quiz/results': 'Obter resultados',
        'GET /quiz/results/:id': 'Obter resultado específico',
        'GET /quiz/progress/:trait': 'Obter progresso de uma característica'
      },
      analytics: {
        'GET /analytics/dashboard': 'Obter dados do dashboard',
        'POST /analytics/mood': 'Registrar humor diário',
        'GET /analytics/mood-history': 'Obter histórico de humor',
        'GET /analytics/patterns': 'Obter padrões comportamentais',
        'GET /analytics/insights': 'Obter insights da IA',
        'GET /analytics/progress': 'Obter análise de progresso'
      },
      support: {
        'POST /support/contact': 'Enviar mensagem de contato',
        'GET /support/faq': 'Obter FAQ',
        'POST /support/feedback': 'Enviar feedback',
        'GET /support/status': 'Obter status do sistema',
        'GET /support/help': 'Obter ajuda contextual'
      }
    },
    rateLimits: {
      global: '1000 requests / 15 minutes',
      auth: '10 requests / 15 minutes',
      contact: '3 requests / 1 hour'
    },
    errorCodes: {
      400: 'Bad Request - Dados inválidos',
      401: 'Unauthorized - Token inválido ou ausente',
      403: 'Forbidden - Acesso negado',
      404: 'Not Found - Recurso não encontrado',
      429: 'Too Many Requests - Rate limit excedido',
      500: 'Internal Server Error - Erro interno do servidor'
    }
  });
});

// 404 handler for API routes
app.use('/api', (req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: 'Endpoint não encontrado',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    next();
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} já existe`,
      field
    });
  }

  // JWT errors
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

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 8001;

const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 YOU API Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`📚 Docs: http://localhost:${PORT}/api/docs`);
      console.log(`❤️ Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = { app, server };