const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  
  // AI Response Metadata
  aiModel: {
    type: String,
    default: null // 'gpt-4', 'claude-3.5-sonnet', 'gemini-pro'
  },
  responseTime: {
    type: Number, // in milliseconds
    default: null
  },
  tokens: {
    input: { type: Number, default: 0 },
    output: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  
  // Content Analysis
  sentiment: {
    score: { type: Number, min: -1, max: 1 },
    label: {
      type: String,
      enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative']
    }
  },
  emotions: [{
    emotion: String, // 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'
    confidence: { type: Number, min: 0, max: 1 }
  }],
  topics: [{
    topic: String,
    relevance: { type: Number, min: 0, max: 1 }
  }],
  
  // User Feedback
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  helpful: {
    type: Boolean,
    default: null
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  
  // Message Status
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  
  // Context and References
  contextMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  references: [{
    type: String // URLs, documents, or resource references
  }]
  
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, type: 1 });
messageSchema.index({ conversationId: 1, type: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ 'sentiment.label': 1 });

// Add user feedback
messageSchema.methods.addFeedback = function(rating, helpful, feedback = '') {
  this.rating = rating;
  this.helpful = helpful;
  this.feedback = feedback;
  return this.save();
};

// Mark as edited
messageSchema.methods.markAsEdited = function() {
  this.edited = true;
  this.editedAt = new Date();
  return this.save();
};

// Soft delete message
messageSchema.methods.softDelete = function() {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Add sentiment analysis
messageSchema.methods.analyzeSentiment = function(sentimentData) {
  this.sentiment = sentimentData;
  return this.save();
};

// Add emotion analysis
messageSchema.methods.analyzeEmotions = function(emotions) {
  this.emotions = emotions;
  return this.save();
};

// Add topic analysis
messageSchema.methods.analyzeTopics = function(topics) {
  this.topics = topics;
  return this.save();
};

// Static method to get conversation context
messageSchema.statics.getConversationContext = function(conversationId, limit = 20) {
  return this.find({ 
    conversationId, 
    deleted: { $ne: true } 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name aiProfile');
};

// Static method to get user's message statistics
messageSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), deleted: { $ne: true } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgSentiment: { $avg: '$sentiment.score' },
        totalTokens: { $sum: '$tokens.total' }
      }
    }
  ]);
};

// Static method to get recent messages by sentiment
messageSchema.statics.getMessagesBySentiment = function(userId, sentiment, limit = 10) {
  return this.find({
    userId,
    'sentiment.label': sentiment,
    deleted: { $ne: true }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('conversationId', 'title');
};

// Pre-save middleware to update conversation
messageSchema.post('save', async function() {
  if (this.isNew) {
    const Conversation = mongoose.model('Conversation');
    await Conversation.findByIdAndUpdate(this.conversationId, {
      lastMessageAt: this.createdAt,
      $inc: { messageCount: 1 }
    });
  }
});

module.exports = mongoose.model('Message', messageSchema);