# YOU - Backend API Contracts & Implementation Plan

## API Architecture Overview

**Base URL**: `/api`
**Authentication**: JWT Bearer Token
**Database**: MongoDB with Mongoose ODM
**AI Integration**: Emergent LLM Key (OpenAI/Anthropic/Google)

## Database Models

### 1. User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date,
  
  // Subscription
  subscription: {
    plan: String, // 'free', 'basic', 'premium', 'enterprise'
    status: String, // 'active', 'canceled', 'expired'
    expiresAt: Date,
    stripeCustomerId: String
  },
  
  // Settings
  settings: {
    language: String,
    timezone: String,
    theme: String,
    notifications: {
      dailyReminder: Boolean,
      weeklyReport: Boolean,
      goalUpdates: Boolean,
      emailNotifications: Boolean
    },
    privacy: {
      shareProgress: Boolean,
      anonymousAnalytics: Boolean,
      dataCollection: Boolean
    }
  },
  
  // AI Personality Profile
  aiProfile: {
    personality: Object, // Quiz results
    preferences: Object,
    conversationStyle: String,
    lastUpdated: Date
  },
  
  // Stats
  stats: {
    totalSessions: Number,
    currentStreak: Number,
    growthScore: Number,
    totalMessages: Number,
    goalsCompleted: Number
  }
}
```

### 2. Conversation Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  createdAt: Date,
  updatedAt: Date,
  lastMessageAt: Date,
  messageCount: Number,
  tags: [String],
  sentiment: String, // 'positive', 'neutral', 'negative'
  topics: [String], // extracted topics
  archived: Boolean
}
```

### 3. Message Model
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  userId: ObjectId,
  type: String, // 'user', 'ai'
  content: String,
  timestamp: Date,
  
  // AI Response Metadata
  aiModel: String, // 'gpt-4', 'claude-3', etc.
  responseTime: Number,
  tokens: Number,
  
  // Analytics
  sentiment: String,
  emotions: [String],
  topics: [String],
  
  // User Feedback
  rating: Number, // 1-5
  helpful: Boolean
}
```

### 4. Goal Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  category: String, // 'relationships', 'career', 'health', etc.
  status: String, // 'active', 'completed', 'paused'
  priority: String, // 'low', 'medium', 'high'
  
  progress: Number, // 0-100
  targetDate: Date,
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date,
  
  // Tracking
  milestones: [{
    title: String,
    completed: Boolean,
    completedAt: Date
  }],
  
  // AI Insights
  aiInsights: [String],
  recommendations: [String]
}
```

### 5. QuizResult Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  quizType: String, // 'personality', 'mood', 'assessment'
  answers: Object, // question_id: answer mapping
  results: {
    scores: Object,
    traits: [String],
    insights: [String],
    recommendations: [String]
  },
  createdAt: Date
}
```

### 6. Analytics Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  
  // Daily Metrics
  mood: Number, // 1-10
  energy: Number, // 1-10
  stress: Number, // 1-10
  productivity: Number, // 1-10
  
  // Activities
  conversationCount: Number,
  messageCount: Number,
  goalProgress: Number,
  
  // AI Insights
  insights: [String],
  patterns: [String],
  recommendations: [String],
  
  createdAt: Date
}
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh JWT token
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset confirmation
- `GET /me` - Get current user info

### User Management (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /settings` - Get user settings
- `PUT /settings` - Update user settings
- `GET /stats` - Get user statistics
- `DELETE /account` - Delete user account

### Chat System (`/api/chat`)
- `GET /conversations` - Get user conversations
- `POST /conversations` - Create new conversation
- `GET /conversations/:id` - Get conversation details
- `DELETE /conversations/:id` - Delete conversation
- `GET /conversations/:id/messages` - Get conversation messages
- `POST /conversations/:id/messages` - Send new message
- `PUT /messages/:id/rating` - Rate AI response

### Goals Management (`/api/goals`)
- `GET /` - Get user goals
- `POST /` - Create new goal
- `GET /:id` - Get goal details
- `PUT /:id` - Update goal
- `DELETE /:id` - Delete goal
- `POST /:id/progress` - Update goal progress
- `GET /:id/insights` - Get AI insights for goal

### Quiz System (`/api/quiz`)
- `GET /questions` - Get quiz questions
- `POST /submit` - Submit quiz answers
- `GET /results` - Get user quiz results
- `GET /results/:id` - Get specific quiz result

### Analytics (`/api/analytics`)
- `GET /dashboard` - Get dashboard analytics
- `POST /mood` - Log daily mood
- `GET /mood-history` - Get mood history
- `GET /patterns` - Get behavior patterns
- `GET /insights` - Get AI insights
- `GET /progress` - Get progress analytics

### Support (`/api/support`)
- `POST /contact` - Send contact message
- `GET /faq` - Get FAQ items
- `POST /feedback` - Submit feedback

## AI Integration Plan

### 1. LLM Service Setup
- Use Emergent LLM Key for multi-provider access
- Implement personality-based prompt engineering
- Context-aware conversation management
- Emotional intelligence in responses

### 2. AI Features
- **Personalized Chat**: Based on user's quiz results and conversation history
- **Mood Analysis**: Analyze user messages for emotional state
- **Goal Insights**: AI-generated recommendations for goals
- **Pattern Recognition**: Identify user behavior patterns
- **Progress Tracking**: AI insights on user growth

### 3. Response Generation
- Context window management (last 10-20 messages)
- Personality consistency
- Empathetic and supportive tone
- Actionable insights and recommendations

## Frontend Integration Changes

### Replace Mock Data with Real API Calls
1. **Authentication Context**: Real JWT handling
2. **Chat Interface**: Real-time AI responses
3. **Dashboard**: Live analytics data
4. **Goals**: CRUD operations with backend
5. **Settings**: Persistent user preferences

### State Management Updates
- Remove localStorage mock data
- Implement proper API error handling
- Add loading states
- Real-time updates where applicable

## Implementation Priority

### Phase 1: Core Infrastructure
1. Database models and connections
2. Authentication system
3. Basic CRUD operations
4. AI service integration

### Phase 2: Advanced Features
1. Real-time chat with AI
2. Analytics processing
3. Goal tracking with insights
4. Advanced user settings

### Phase 3: Optimization
1. Performance optimization
2. Caching strategies
3. Error handling
4. Security hardening

This plan ensures complete backend coverage for all frontend features with enterprise-grade implementation.