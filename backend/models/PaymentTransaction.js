const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
  // User Info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Stripe Session Info
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  
  // Subscription Info
  stripePriceId: {
    type: String,
    default: null
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    required: true
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'initiated', 'paid', 'failed', 'expired', 'canceled'],
    default: 'initiated',
    index: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'complete', 'expired', 'canceled'],
    default: 'pending'
  },
  
  // Metadata
  metadata: {
    type: Object,
    default: {}
  },
  
  // URLs
  successUrl: String,
  cancelUrl: String,
  
  // Stripe Details
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  
  // Processing
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  processedAt: Date,
  
  // Timestamps
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true,
  collection: 'payment_transactions'
});

// Indexes
PaymentTransactionSchema.index({ userId: 1, paymentStatus: 1 });
PaymentTransactionSchema.index({ sessionId: 1, processed: 1 });
PaymentTransactionSchema.index({ createdAt: -1 });

// Methods
PaymentTransactionSchema.methods.markAsProcessed = function() {
  this.processed = true;
  this.processedAt = new Date();
  return this.save();
};

PaymentTransactionSchema.methods.updatePaymentStatus = function(status, paymentStatus) {
  this.status = status;
  this.paymentStatus = paymentStatus;
  
  if (paymentStatus === 'paid' && !this.processed) {
    this.processed = true;
    this.processedAt = new Date();
  }
  
  return this.save();
};

// Static methods
PaymentTransactionSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ sessionId });
};

PaymentTransactionSchema.statics.findUnprocessedPayments = function() {
  return this.find({ 
    paymentStatus: 'paid', 
    processed: false 
  });
};

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);