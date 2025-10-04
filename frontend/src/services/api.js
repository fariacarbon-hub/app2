import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Reduced timeout to 10s
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't override default validateStatus - let axios handle status codes normally
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    // Always return the response data, but ensure it has expected structure
    if (response.data) {
      return response.data;
    }
    return { success: false, message: 'Resposta inválida do servidor' };
  },
  (error) => {
    console.log('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config?.url
    });
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Better error handling for network issues
    let errorMessage = 'Erro desconhecido';
    
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = 'Timeout - servidor demorou para responder. Tente novamente.';
    } else if (error.response?.data?.message) {
      // Server returned an error message
      errorMessage = error.response.data.message;
    } else if (error.message) {
      // Network or other error
      errorMessage = error.message;
    }
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });
  }
);

// Authentication APIs
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password })
};

// User APIs
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (profileData) => apiClient.put('/user/profile', profileData),
  getSettings: () => apiClient.get('/user/settings'),
  updateSettings: (settings) => apiClient.put('/user/settings', settings),
  getStats: () => apiClient.get('/user/stats'),
  changePassword: (passwords) => apiClient.post('/user/change-password', passwords),
  deleteAccount: (confirmation) => apiClient.delete('/user/account', { data: confirmation }),
  exportData: () => apiClient.get('/user/data')
};

// Chat APIs
export const chatAPI = {
  getConversations: (params = {}) => apiClient.get('/chat/conversations', { params }),
  createConversation: (conversationData) => apiClient.post('/chat/conversations', conversationData),
  getConversation: (id) => apiClient.get(`/chat/conversations/${id}`),
  deleteConversation: (id) => apiClient.delete(`/chat/conversations/${id}`),
  getMessages: (conversationId, params = {}) => apiClient.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, message) => apiClient.post(`/chat/conversations/${conversationId}/messages`, message),
  rateMessage: (messageId, rating) => apiClient.put(`/chat/messages/${messageId}/rating`, rating)
};

// Goals APIs
export const goalsAPI = {
  getGoals: (params = {}) => apiClient.get('/goals', { params }),
  createGoal: (goalData) => apiClient.post('/goals', goalData),
  getGoal: (id) => apiClient.get(`/goals/${id}`),
  updateGoal: (id, goalData) => apiClient.put(`/goals/${id}`, goalData),
  deleteGoal: (id) => apiClient.delete(`/goals/${id}`),
  updateProgress: (id, progressData) => apiClient.post(`/goals/${id}/progress`, progressData),
  getInsights: (id) => apiClient.get(`/goals/${id}/insights`),
  addMilestone: (id, milestone) => apiClient.post(`/goals/${id}/milestones`, milestone),
  completeMilestone: (id, milestoneId) => apiClient.put(`/goals/${id}/milestones/${milestoneId}`)
};

// Quiz APIs
export const quizAPI = {
  getQuestions: () => apiClient.get('/quiz/questions'),
  submitQuiz: (quizData) => apiClient.post('/quiz/submit', quizData),
  getResults: (params = {}) => apiClient.get('/quiz/results', { params }),
  getResult: (id) => apiClient.get(`/quiz/results/${id}`),
  getProgress: (trait, params = {}) => apiClient.get(`/quiz/progress/${trait}`, { params })
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: (params = {}) => apiClient.get('/analytics/dashboard', { params }),
  logMood: (moodData) => apiClient.post('/analytics/mood', moodData),
  getMoodHistory: (params = {}) => apiClient.get('/analytics/mood-history', { params }),
  getPatterns: (params = {}) => apiClient.get('/analytics/patterns', { params }),
  getInsights: (params = {}) => apiClient.get('/analytics/insights', { params }),
  getProgress: (params = {}) => apiClient.get('/analytics/progress', { params })
};

// Support APIs
export const supportAPI = {
  sendContact: (contactData) => apiClient.post('/support/contact', contactData),
  getFAQ: (params = {}) => apiClient.get('/support/faq', { params }),
  sendFeedback: (feedbackData) => apiClient.post('/support/feedback', feedbackData),
  getStatus: () => apiClient.get('/support/status'),
  getHelp: (params = {}) => apiClient.get('/support/help', { params })
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export default apiClient;