const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  
  // Daily Mood and Wellness Metrics
  mood: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  energy: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  stress: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  productivity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  sleep_quality: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  
  // Activity Metrics
  activities: {
    conversationCount: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 }, // in minutes
    goalsWorkedOn: { type: Number, default: 0 },
    goalsCompleted: { type: Number, default: 0 },
    quizzesCompleted: { type: Number, default: 0 }
  },
  
  // Behavioral Patterns
  patterns: {
    peakActivityHour: Number, // 0-23
    mostActiveDay: String, // 'monday', 'tuesday', etc.
    averageSessionLength: Number, // in minutes
    preferredTopics: [String],
    communicationStyle: String, // 'direct', 'detailed', 'emotional', etc.
  },
  
  // AI-Generated Insights
  insights: [{
    type: String, // 'mood_pattern', 'productivity_tip', 'wellness_alert', 'progress_celebration'
    message: String,
    confidence: { type: Number, min: 0, max: 1 },
    priority: { type: String, enum: ['baixa', 'media', 'alta'] },
    category: String, // 'mood', 'productivity', 'relationships', 'goals'
  }],
  
  // Recommendations
  recommendations: [{
    title: String,
    description: String,
    type: String, // 'action', 'resource', 'technique', 'goal'
    category: String,
    urgency: { type: String, enum: ['baixa', 'media', 'alta'] },
    implemented: { type: Boolean, default: false },
    implementedAt: Date
  }],
  
  // Emotional Analysis
  emotionalProfile: {
    dominantEmotions: [String],
    emotionalVariability: Number, // 0-1, higher = more variable
    emotionalTrends: [{
      emotion: String,
      trend: String, // 'increasing', 'stable', 'decreasing'
      strength: Number // 0-1
    }],
    riskFactors: [String], // 'isolation', 'stress_overload', 'goal_abandonment'
  },
  
  // Progress Tracking
  progress: {
    overallWellbeing: Number, // 1-100
    goalAchievement: Number, // 1-100
    emotionalRegulation: Number, // 1-100
    socialConnection: Number, // 1-100
    personalGrowth: Number, // 1-100
  },
  
  // Weekly/Monthly Summaries (calculated fields)
  summaries: {
    weeklyAverage: {
      mood: Number,
      energy: Number,
      stress: Number,
      productivity: Number
    },
    monthlyTrends: [{
      metric: String,
      trend: String,
      percentage: Number
    }]
  },
  
  // Notes and Reflections
  notes: {
    userNote: String, // User's own reflection for the day
    aiSummary: String, // AI-generated summary of the day
    highlights: [String], // Key moments or achievements
    challenges: [String] // Difficulties faced
  }
  
}, {
  timestamps: true
});

// Indexes for efficient querying
analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ userId: 1, date: 1 });
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ userId: 1, 'progress.overallWellbeing': -1 });

// Ensure one record per user per day
analyticsSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate overall wellbeing score
analyticsSchema.methods.calculateWellbeing = function() {
  const { mood, energy, stress } = this;
  
  // Invert stress (lower stress = better wellbeing)
  const invertedStress = 11 - stress;
  
  // Weighted average
  const wellbeingScore = Math.round(
    (mood * 0.4 + energy * 0.3 + invertedStress * 0.3) * 10
  );
  
  this.progress.overallWellbeing = Math.max(1, Math.min(100, wellbeingScore));
  return this.save();
};

// Add AI insight
analyticsSchema.methods.addInsight = function(type, message, confidence = 0.8, priority = 'media', category = 'geral') {
  this.insights.push({
    type,
    message,
    confidence,
    priority,
    category
  });
  
  // Keep only last 5 insights per day
  if (this.insights.length > 5) {
    this.insights = this.insights.slice(-5);
  }
  
  return this.save();
};

// Add recommendation
analyticsSchema.methods.addRecommendation = function(title, description, type = 'action', category = 'geral', urgency = 'media') {
  this.recommendations.push({
    title,
    description,
    type,
    category,
    urgency
  });
  
  // Keep only last 3 recommendations per day
  if (this.recommendations.length > 3) {
    this.recommendations = this.recommendations.slice(-3);
  }
  
  return this.save();
};

// Update emotional profile
analyticsSchema.methods.updateEmotionalProfile = function(emotions, variability, trends, risks = []) {
  this.emotionalProfile = {
    dominantEmotions: emotions,
    emotionalVariability: variability,
    emotionalTrends: trends,
    riskFactors: risks
  };
  return this.save();
};

// Static method to get date range analytics
analyticsSchema.statics.getDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: 1 });
};

// Static method to get weekly average
analyticsSchema.statics.getWeeklyAverage = function(userId, weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: weekStart, $lte: weekEnd }
      }
    },
    {
      $group: {
        _id: null,
        avgMood: { $avg: '$mood' },
        avgEnergy: { $avg: '$energy' },
        avgStress: { $avg: '$stress' },
        avgProductivity: { $avg: '$productivity' },
        totalConversations: { $sum: '$activities.conversationCount' },
        totalMessages: { $sum: '$activities.messageCount' }
      }
    }
  ]);
};

// Static method to get mood trends
analyticsSchema.statics.getMoodTrends = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    userId,
    date: { $gte: startDate }
  })
    .select('date mood energy stress productivity')
    .sort({ date: 1 });
};

// Static method to get insights summary
analyticsSchema.statics.getInsightsSummary = function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    { $unwind: '$insights' },
    {
      $group: {
        _id: '$insights.category',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$insights.confidence' },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$insights.priority', 'alta'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema);