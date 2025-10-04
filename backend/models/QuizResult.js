const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizType: {
    type: String,
    enum: ['personalidade', 'humor', 'avaliacao_inicial', 'check_in_semanal'],
    required: true
  },
  
  // Raw answers from the quiz
  answers: {
    type: mongoose.Schema.Types.Mixed,
    required: true
    // Format: { question_id: answer_value }
  },
  
  // Processed results
  results: {
    scores: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
      // Format: { trait_name: score_value }
    },
    traits: [{
      name: String,
      value: Number,
      description: String
    }],
    insights: [String],
    recommendations: [{
      category: String,
      recommendation: String,
      priority: { type: String, enum: ['baixa', 'media', 'alta'] }
    }]
  },
  
  // AI Analysis
  aiAnalysis: {
    personalityType: String,
    dominantTraits: [String],
    growthAreas: [String],
    strengths: [String],
    communicationStyle: String,
    motivationalFactors: [String],
    stressIndicators: [String],
    copingStrategies: [String],
    confidenceScore: { type: Number, min: 0, max: 1 }
  },
  
  // Comparison with previous results
  comparison: {
    previousResultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult' },
    changes: [{
      trait: String,
      previousValue: Number,
      currentValue: Number,
      change: Number,
      significance: String // 'significant_improvement', 'slight_improvement', 'no_change', 'slight_decline', 'significant_decline'
    }],
    overallTrend: String // 'positive', 'stable', 'concerning'
  },
  
  // Metadata
  completionTime: {
    type: Number, // in seconds
    default: null
  },
  version: {
    type: String,
    default: '1.0'
  },
  
  // Follow-up actions
  followUpActions: [{
    action: String,
    priority: String,
    dueDate: Date,
    completed: { type: Boolean, default: false }
  }]
  
}, {
  timestamps: true
});

// Indexes
quizResultSchema.index({ userId: 1, createdAt: -1 });
quizResultSchema.index({ userId: 1, quizType: 1 });
quizResultSchema.index({ quizType: 1, createdAt: -1 });

// Calculate personality insights
quizResultSchema.methods.calculateInsights = function() {
  const { answers } = this;
  const insights = [];
  
  // Basic personality analysis based on answers
  if (answers['1']) { // Loneliness question
    const lonelinessScore = answers['1'];
    if (lonelinessScore <= 2) {
      insights.push('Você pode se beneficiar de estratégias para se sentir mais confortável em sua própria companhia.');
    } else if (lonelinessScore >= 4) {
      insights.push('Você tem uma boa relação consigo mesmo, o que é uma base sólida para o crescimento pessoal.');
    }
  }
  
  if (answers['2']) { // Concerns
    const concerns = Array.isArray(answers['2']) ? answers['2'] : [answers['2']];
    if (concerns.includes('relacionamentos')) {
      insights.push('Focar no desenvolvimento de habilidades de comunicação pode melhorar significativamente seus relacionamentos.');
    }
    if (concerns.includes('carreira')) {
      insights.push('Definir objetivos claros de carreira e desenvolver habilidades relevantes pode reduzir a ansiedade profissional.');
    }
  }
  
  this.results.insights = insights;
  return this.save();
};

// Generate AI recommendations
quizResultSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  const { answers, results } = this;
  
  // Based on stress response
  if (answers['5']) { // Stress response
    const stressResponse = answers['5'];
    switch (stressResponse) {
      case 'isolamento':
        recommendations.push({
          category: 'Gestão de Estresse',
          recommendation: 'Pratique técnicas de conexão social gradual e mindfulness para lidar com o estresse de forma mais saudável.',
          priority: 'alta'
        });
        break;
      case 'busco_ajuda':
        recommendations.push({
          category: 'Gestão de Estresse',
          recommendation: 'Continue aproveitando sua rede de apoio e considere expandir suas estratégias de enfrentamento.',
          priority: 'media'
        });
        break;
      case 'exercicios':
        recommendations.push({
          category: 'Gestão de Estresse',
          recommendation: 'Excelente! Continue com as atividades físicas e explore outras técnicas complementares de relaxamento.',
          priority: 'baixa'
        });
        break;
    }
  }
  
  this.results.recommendations = recommendations;
  return this.save();
};

// Compare with previous result
quizResultSchema.methods.compareWithPrevious = async function() {
  const previousResult = await this.constructor.findOne({
    userId: this.userId,
    quizType: this.quizType,
    _id: { $ne: this._id }
  }).sort({ createdAt: -1 });
  
  if (!previousResult) return this;
  
  const changes = [];
  const currentScores = this.results.scores;
  const previousScores = previousResult.results.scores;
  
  for (const trait in currentScores) {
    if (previousScores[trait] !== undefined) {
      const change = currentScores[trait] - previousScores[trait];
      let significance = 'no_change';
      
      if (Math.abs(change) >= 2) {
        significance = change > 0 ? 'significant_improvement' : 'significant_decline';
      } else if (Math.abs(change) >= 1) {
        significance = change > 0 ? 'slight_improvement' : 'slight_decline';
      }
      
      changes.push({
        trait,
        previousValue: previousScores[trait],
        currentValue: currentScores[trait],
        change,
        significance
      });
    }
  }
  
  const positiveChanges = changes.filter(c => c.change > 0).length;
  const negativeChanges = changes.filter(c => c.change < 0).length;
  
  let overallTrend = 'stable';
  if (positiveChanges > negativeChanges) overallTrend = 'positive';
  else if (negativeChanges > positiveChanges) overallTrend = 'concerning';
  
  this.comparison = {
    previousResultId: previousResult._id,
    changes,
    overallTrend
  };
  
  return this.save();
};

// Static method to get latest result by type
quizResultSchema.statics.getLatestByType = function(userId, quizType) {
  return this.findOne({ userId, quizType }).sort({ createdAt: -1 });
};

// Static method to get user's progress over time
quizResultSchema.statics.getProgressOverTime = function(userId, quizType, trait) {
  return this.find({ 
    userId, 
    quizType,
    [`results.scores.${trait}`]: { $exists: true }
  })
    .sort({ createdAt: 1 })
    .select(`results.scores.${trait} createdAt`);
};

module.exports = mongoose.model('QuizResult', quizResultSchema);