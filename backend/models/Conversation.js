const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Conversation Analysis
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'mixed'],
    default: 'neutral'
  },
  topics: [{
    type: String,
    trim: true
  }],
  
  // User Interaction
  archived: {
    type: Boolean,
    default: false
  },
  starred: {
    type: Boolean,
    default: false
  },
  
  // AI Analysis Metadata
  aiAnalysis: {
    dominantEmotion: String,
    userMood: {
      type: String,
      enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative']
    },
    conversationGoal: String,
    progressMade: Boolean,
    needsFollowUp: Boolean,
    riskFlags: [String] // e.g., ['crisis', 'self_harm', 'urgent']
  },
  
  // Session Information
  sessionType: {
    type: String,
    enum: ['chat', 'goal_setting', 'reflection', 'crisis_support', 'general'],
    default: 'chat'
  },
  duration: {
    type: Number, // in minutes
    default: 0
  }
  
}, {
  timestamps: true
});

// Indexes for performance
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, archived: 1 });
conversationSchema.index({ userId: 1, starred: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ tags: 1 });

// Update last message timestamp
conversationSchema.methods.updateLastMessage = function() {
  this.lastMessageAt = new Date();
  this.messageCount += 1;
  return this.save();
};

// Add tag to conversation
conversationSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// Remove tag from conversation
conversationSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Update AI analysis
conversationSchema.methods.updateAiAnalysis = function(analysis) {
  this.aiAnalysis = { ...this.aiAnalysis.toObject(), ...analysis };
  return this.save();
};

// Static method to get user's recent conversations
conversationSchema.statics.findRecentByUser = function(userId, limit = 10) {
  return this.find({ userId, archived: false })
    .sort({ lastMessageAt: -1 })
    .limit(limit);
};

// Static method to get conversation statistics
conversationSchema.statics.getStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        totalMessages: { $sum: '$messageCount' },
        avgMessagesPerConversation: { $avg: '$messageCount' },
        archivedConversations: {
          $sum: { $cond: ['$archived', 1, 0] }
        },
        starredConversations: {
          $sum: { $cond: ['$starred', 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Conversation', conversationSchema);