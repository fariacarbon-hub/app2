const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');

// Import emergent integrations - create Python subprocess wrapper
let StripeCheckout = null;

// Real Stripe integration using Python service
const { exec } = require('child_process');
const path = require('path');

const createStripeCheckout = (apiKey, webhookUrl) => {
  return {
    async create_checkout_session(request) {
      return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, 'services/stripeService.py');
        const metadata = JSON.stringify(request.metadata || {});
        
        const command = `cd /app/backend && STRIPE_API_KEY="${apiKey}" WEBHOOK_URL="${webhookUrl}" python3 ${pythonScript} create_session "${request.price_id}" "${request.success_url}" "${request.cancel_url}" '${metadata}'`;
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('Stripe exec error:', error);
            reject(new Error('Stripe integration failed'));
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            if (result.success) {
              resolve({
                url: result.url,
                session_id: result.session_id
              });
            } else {
              reject(new Error(result.error));
            }
          } catch (parseError) {
            console.error('Stripe parse error:', parseError);
            reject(new Error('Invalid response from Stripe'));
          }
        });
      });
    },
    
    async get_checkout_status(sessionId) {
      return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, 'services/stripeService.py');
        const command = `cd /app/backend && STRIPE_API_KEY="${apiKey}" python3 ${pythonScript} get_status "${sessionId}"`;
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(new Error('Status check failed'));
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            if (result.success) {
              resolve(result);
            } else {
              reject(new Error(result.error));
            }
          } catch (parseError) {
            reject(new Error('Invalid status response'));
          }
        });
      });
    },
    
    async handle_webhook(body, signature) {
      // Webhook handling - for now return success
      return {
        event_type: 'checkout.session.completed',
        session_id: 'webhook_handled',
        payment_status: 'paid'
      };
    }
  };
};

const router = express.Router();

// Subscription Plans Configuration
const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Plano Básico',
    price: 9.99,
    currency: 'usd',
    stripePriceId: 'price_1OExample1', // Replace with real Stripe Price ID
    features: [
      'Chat ilimitado com IA',
      'Até 5 objetivos ativos',
      'Analytics básicas',
      'Suporte por email'
    ],
    limits: {
      conversations: 100,
      goals: 5,
      analytics: 'basic'
    }
  },
  premium: {
    name: 'Plano Premium',
    price: 19.99,
    currency: 'usd',
    stripePriceId: 'price_1OExample2', // Replace with real Stripe Price ID
    features: [
      'Tudo do plano básico',
      'Objetivos ilimitados',
      'Analytics avançadas',
      'Insights personalizados da IA',
      'Suporte prioritário',
      'Exportar dados'
    ],
    limits: {
      conversations: -1, // unlimited
      goals: -1, // unlimited
      analytics: 'advanced'
    }
  }
};

// Initialize Stripe checkout
const initializeStripe = (req) => {
  const apiKey = process.env.STRIPE_API_KEY;
  if (!apiKey) {
    throw new Error('Stripe API key not configured');
  }
  
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  const webhookUrl = `${hostUrl}/api/payments/webhook/stripe`;
  
  return createStripeCheckout(apiKey, webhookUrl);
};

// Get available subscription plans
router.get('/plans', (req, res) => {
  try {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      features: plan.features
    }));
    
    res.json({
      success: true,
      data: { plans }
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar planos'
    });
  }
});

// Create checkout session
router.post('/checkout/session', [
  auth,
  body('planId')
    .isIn(['basic', 'premium'])
    .withMessage('Plano inválido'),
  body('successUrl')
    .isURL()
    .withMessage('URL de sucesso inválida'),
  body('cancelUrl')
    .isURL()
    .withMessage('URL de cancelamento inválida')
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

    const { planId, successUrl, cancelUrl } = req.body;
    const userId = req.user.userId;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Get plan configuration
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    // Initialize Stripe
    const stripeCheckout = initializeStripe(req);
    
    // Create checkout session request
    const checkoutRequest = {
      price_id: plan.stripePriceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        planId: planId,
        userEmail: user.email,
        userName: user.name
      }
    };

    // Create Stripe checkout session
    const session = await stripeCheckout.create_checkout_session(checkoutRequest);
    
    // Create payment transaction record
    const transaction = new PaymentTransaction({
      userId: userId,
      sessionId: session.session_id,
      amount: plan.price,
      currency: plan.currency,
      subscriptionPlan: planId,
      stripePriceId: plan.stripePriceId,
      paymentStatus: 'initiated',
      status: 'pending',
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      metadata: checkoutRequest.metadata
    });
    
    await transaction.save();

    res.json({
      success: true,
      message: 'Sessão de checkout criada com sucesso',
      data: {
        url: session.url,
        sessionId: session.session_id,
        plan: {
          id: planId,
          name: plan.name,
          price: plan.price,
          currency: plan.currency
        }
      }
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao criar sessão de checkout'
    });
  }
});

// Get checkout status
router.get('/checkout/status/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    
    // Find transaction
    const transaction = await PaymentTransaction.findOne({
      sessionId: sessionId,
      userId: userId
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    // Initialize Stripe and check status
    const stripeCheckout = initializeStripe(req);
    const checkoutStatus = await stripeCheckout.get_checkout_status(sessionId);
    
    // Update transaction if status changed
    if (checkoutStatus.payment_status !== transaction.paymentStatus || 
        checkoutStatus.status !== transaction.status) {
      
      await transaction.updatePaymentStatus(
        checkoutStatus.status, 
        checkoutStatus.payment_status
      );
      
      // If payment is successful and not processed yet, upgrade user
      if (checkoutStatus.payment_status === 'paid' && !transaction.processed) {
        await upgradeUserSubscription(userId, transaction.subscriptionPlan);
        await transaction.markAsProcessed();
      }
    }

    res.json({
      success: true,
      data: {
        sessionId: sessionId,
        status: checkoutStatus.status,
        paymentStatus: checkoutStatus.payment_status,
        amountTotal: checkoutStatus.amount_total,
        currency: checkoutStatus.currency,
        plan: transaction.subscriptionPlan,
        processed: transaction.processed
      }
    });

  } catch (error) {
    console.error('Checkout status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do pagamento'
    });
  }
});

// Stripe webhook handler
router.post('/webhook/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).send('Missing Stripe signature');
    }

    // Initialize Stripe and handle webhook
    const stripeCheckout = initializeStripe(req);
    const webhookResponse = await stripeCheckout.handle_webhook(req.body, signature);
    
    if (webhookResponse.event_type === 'checkout.session.completed') {
      const sessionId = webhookResponse.session_id;
      
      // Find and update transaction
      const transaction = await PaymentTransaction.findBySessionId(sessionId);
      if (transaction && !transaction.processed) {
        
        await transaction.updatePaymentStatus('complete', 'paid');
        
        // Upgrade user subscription
        await upgradeUserSubscription(transaction.userId, transaction.subscriptionPlan);
        await transaction.markAsProcessed();
        
        console.log(`Payment processed for user ${transaction.userId}, plan: ${transaction.subscriptionPlan}`);
      }
    }

    res.status(200).send('Webhook received');

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Webhook error');
  }
});

// Helper function to upgrade user subscription
async function upgradeUserSubscription(userId, planId) {
  try {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) return;

    const updateData = {
      'subscription.plan': planId,
      'subscription.status': 'active',
      'subscription.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      'subscription.upgradedAt': new Date()
    };

    await User.findByIdAndUpdate(userId, updateData);
    console.log(`User ${userId} upgraded to ${planId} plan`);
    
  } catch (error) {
    console.error('Error upgrading user subscription:', error);
    throw error;
  }
}

// Get user payment history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const transactions = await PaymentTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('sessionId amount currency subscriptionPlan paymentStatus status createdAt processed');

    res.json({
      success: true,
      data: { transactions }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico de pagamentos'
    });
  }
});

module.exports = router;