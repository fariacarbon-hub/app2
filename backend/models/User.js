const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Subscription Information
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired'],
      default: 'active'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    },
    stripeCustomerId: {
      type: String,
      default: null
    }
  },
  
  // User Settings
  settings: {
    language: {
      type: String,
      default: 'pt-BR'
    },
    timezone: {
      type: String,
      default: 'America/Sao_Paulo'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      dailyReminder: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      goalUpdates: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false }
    },
    privacy: {
      shareProgress: { type: Boolean, default: false },
      anonymousAnalytics: { type: Boolean, default: true },
      dataCollection: { type: Boolean, default: true }
    }
  },
  
  // AI Personality Profile
  aiProfile: {
    personality: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    conversationStyle: {
      type: String,
      default: 'supportive'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // User Statistics
  stats: {
    totalSessions: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    growthScore: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    goalsCompleted: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.lastActiveDate': -1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update user activity
userSchema.methods.updateActivity = function() {
  this.stats.lastActiveDate = new Date();
  return this.save();
};

// Get user's current streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = new Date(this.stats.lastActiveDate);
  const diffTime = Math.abs(today - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Consecutive day
    this.stats.currentStreak += 1;
  } else if (diffDays > 1) {
    // Streak broken
    this.stats.currentStreak = 1;
  }
  // Same day = no change
  
  this.stats.lastActiveDate = today;
  return this.save();
};

// Calculate growth score
userSchema.methods.calculateGrowthScore = function() {
  const { totalSessions, currentStreak, totalMessages, goalsCompleted } = this.stats;
  
  // Growth score algorithm
  const sessionScore = Math.min(totalSessions * 2, 30);
  const streakScore = Math.min(currentStreak * 3, 25);
  const messageScore = Math.min(totalMessages * 0.5, 20);
  const goalScore = Math.min(goalsCompleted * 5, 25);
  
  this.stats.growthScore = Math.round(sessionScore + streakScore + messageScore + goalScore);
  return this.save();
};

// JSON transformation (hide sensitive data)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.emailVerificationToken;
  return userObject;
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);