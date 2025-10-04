const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  dueDate: Date,
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

const goalSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'relacionamentos',
      'carreira',
      'saude_mental',
      'crescimento_pessoal',
      'educacao',
      'financas',
      'saude_fisica',
      'espiritualidade',
      'hobbies',
      'outro'
    ]
  },
  status: {
    type: String,
    enum: ['ativo', 'concluido', 'pausado', 'cancelado'],
    default: 'ativo'
  },
  priority: {
    type: String,
    enum: ['baixa', 'media', 'alta'],
    default: 'media'
  },
  
  // Progress Tracking
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  completedAt: Date,
  
  // Milestones and Tasks
  milestones: [milestoneSchema],
  
  // AI-Generated Insights
  aiInsights: [{
    insight: String,
    generatedAt: { type: Date, default: Date.now },
    confidence: { type: Number, min: 0, max: 1 }
  }],
  recommendations: [{
    recommendation: String,
    type: String, // 'action', 'resource', 'strategy'
    generatedAt: { type: Date, default: Date.now },
    implemented: { type: Boolean, default: false }
  }],
  
  // Progress History
  progressHistory: [{
    date: Date,
    progress: Number,
    note: String,
    updatedBy: String // 'user', 'ai', 'system'
  }],
  
  // Goal Metadata
  difficulty: {
    type: String,
    enum: ['facil', 'medio', 'dificil'],
    default: 'medio'
  },
  estimatedDuration: {
    value: Number,
    unit: String // 'days', 'weeks', 'months'
  },
  tags: [String],
  
  // Sharing and Privacy
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'collaborate'] }
  }],
  
  // Reminders
  reminders: [{
    type: String, // 'daily', 'weekly', 'custom'
    time: String, // HH:MM format
    days: [Number], // 0-6 (Sunday to Saturday)
    active: Boolean
  }]
  
}, {
  timestamps: true
});

// Indexes for performance
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });
goalSchema.index({ targetDate: 1 });
goalSchema.index({ status: 1, targetDate: 1 });

// Update progress with history
goalSchema.methods.updateProgress = function(newProgress, note = '', updatedBy = 'user') {
  // Add to history
  this.progressHistory.push({
    date: new Date(),
    progress: newProgress,
    note,
    updatedBy
  });
  
  // Update current progress
  const oldProgress = this.progress;
  this.progress = Math.max(0, Math.min(100, newProgress));
  
  // Auto-complete if progress reaches 100%
  if (this.progress === 100 && this.status !== 'concluido') {
    this.status = 'concluido';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Add milestone
goalSchema.methods.addMilestone = function(milestoneData) {
  const order = this.milestones.length;
  this.milestones.push({
    ...milestoneData,
    order
  });
  return this.save();
};

// Complete milestone
goalSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone && !milestone.completed) {
    milestone.completed = true;
    milestone.completedAt = new Date();
    
    // Update overall progress based on completed milestones
    const completedCount = this.milestones.filter(m => m.completed).length;
    const totalCount = this.milestones.length;
    
    if (totalCount > 0) {
      const milestoneProgress = (completedCount / totalCount) * 100;
      this.updateProgress(milestoneProgress, `Marco completado: ${milestone.title}`, 'system');
    }
  }
  return this.save();
};

// Add AI insight
goalSchema.methods.addAiInsight = function(insight, confidence = 0.8) {
  this.aiInsights.push({
    insight,
    confidence,
    generatedAt: new Date()
  });
  
  // Keep only last 10 insights
  if (this.aiInsights.length > 10) {
    this.aiInsights = this.aiInsights.slice(-10);
  }
  
  return this.save();
};

// Add recommendation
goalSchema.methods.addRecommendation = function(recommendation, type = 'action') {
  this.recommendations.push({
    recommendation,
    type,
    generatedAt: new Date()
  });
  
  // Keep only last 15 recommendations
  if (this.recommendations.length > 15) {
    this.recommendations = this.recommendations.slice(-15);
  }
  
  return this.save();
};

// Calculate days until target
goalSchema.virtual('daysUntilTarget').get(function() {
  if (!this.targetDate) return null;
  const today = new Date();
  const diffTime = this.targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Calculate completion percentage based on milestones
goalSchema.virtual('milestoneProgress').get(function() {
  if (this.milestones.length === 0) return 0;
  const completed = this.milestones.filter(m => m.completed).length;
  return (completed / this.milestones.length) * 100;
});

// Static method to get user goals by category
goalSchema.statics.getByCategory = function(userId, category) {
  return this.find({ userId, category, status: { $ne: 'cancelado' } })
    .sort({ createdAt: -1 });
};

// Static method to get overdue goals
goalSchema.statics.getOverdue = function(userId) {
  return this.find({
    userId,
    status: 'ativo',
    targetDate: { $lt: new Date() }
  }).sort({ targetDate: 1 });
};

// Static method to get goal statistics
goalSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);
};

module.exports = mongoose.model('Goal', goalSchema);