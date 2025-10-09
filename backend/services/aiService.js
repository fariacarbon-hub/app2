const { exec } = require('child_process');
const path = require('path');

class AIService {
  constructor() {
    this.apiKey = process.env.EMERGENT_LLM_KEY;
    
    // Conversation context management
    this.contextWindow = 20; // Number of messages to include in context
    this.maxTokens = 1000;
    
    // Personality templates
    this.personalityPrompts = {
      supportive: "Você é um terapeuta empático e acolhedor que oferece suporte emocional genuíno.",
      analytical: "Você é um coach analítico que ajuda através de insights baseados em dados e padrões.",
      motivational: "Você é um mentor motivacional que inspira ação e crescimento pessoal.",
      gentle: "Você é um guia gentil que oferece sabedoria com compaixão e paciência."
    };
  }

  /**
   * Generate AI response for chat conversation using Emergent Integrations
   */
  async generateResponse(userId, conversationHistory, userMessage, userProfile = {}) {
    try {
      const context = this.buildConversationContext(conversationHistory, userProfile);
      const systemPrompt = this.buildSystemPrompt(userProfile);
      
      const startTime = Date.now();
      
      // Call Python integration
      const aiResponse = await this.callEmergentLLM(systemPrompt, context, userMessage);
      
      const responseTime = Date.now() - startTime;

      // Log successful response
      console.log(`AI Response Generated: ${responseTime}ms`);

      return {
        success: true,
        message: aiResponse,
        metadata: {
          model: 'gpt-4o-mini',
          responseTime,
          tokens: {
            input: 0, // Will be tracked by Emergent
            output: 0,
            total: 0
          }
        }
      };

    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      // Fallback response
      return {
        success: false,
        message: this.getFallbackResponse(userMessage),
        metadata: {
          model: 'fallback',
          responseTime: 100,
          tokens: { input: 0, output: 0, total: 0 }
        },
        error: error.message
      };
    }
  }

  /**
   * Call Emergent LLM using Python integration
   */
  async callEmergentLLM(systemPrompt, context, userMessage) {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, 'emergentLLM.py');
      
      // Prepare messages for AI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...context,
        { role: 'user', content: userMessage }
      ];
      
      const messagesJson = JSON.stringify(messages);
      
      // Write messages to temp file to avoid shell escaping issues
      const fs = require('fs');
      const tempFile = `/tmp/messages_${Date.now()}.json`;
      fs.writeFileSync(tempFile, messagesJson);
      
      const command = `cd /app/backend/services && EMERGENT_LLM_KEY="${this.apiKey}" python3 emergentLLM.py "${tempFile}"`;
      
      exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          console.error('Python exec error:', error);
          reject(new Error('AI integration failed'));
          return;
        }
        
        if (stderr) {
          console.error('Python stderr:', stderr);
        }
        
        try {
          const result = JSON.parse(stdout);
          if (result.success) {
            resolve(result.response);
          } else {
            reject(new Error(result.error || 'AI call failed'));
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          console.error('Raw stdout:', stdout);
          reject(new Error('Invalid AI response'));
        }
      });
    });
  }

  /**
   * Build system prompt based on user profile
   */
  buildSystemPrompt(userProfile) {
    const { aiProfile = {}, name = 'usuário' } = userProfile;
    const personality = aiProfile.conversationStyle || 'supportive';
    const basePrompt = this.personalityPrompts[personality];
    
    return `${basePrompt}

IMPORTANTE: Você é o Gêmeo IA pessoal de ${name}. Você conhece profundamente:
- Personalidade e padrões de comportamento
- Objetivos e valores pessoais  
- Histórico de conversas e crescimento
- Preferências de comunicação

DIRETRIZES:
1. Seja sempre empático, acolhedor e genuinamente interessado
2. Ofereça insights personalizados baseados no perfil do usuário
3. Faça perguntas reflexivas que promovam autoconhecimento
4. Sugira ações práticas e específicas quando apropriado
5. Celebre progressos e ofereça apoio durante dificuldades
6. Mantenha um tom conversacional e humano
7. Seja conciso mas significativo (máximo 3 parágrafos)
8. Use português brasileiro de forma natural

NUNCA:
- Ofereça diagnósticos médicos ou psicológicos
- Substitua profissionais de saúde mental
- Seja genérico ou robotizado
- Ignore o contexto pessoal do usuário

Se o usuário estiver em crise ou mencionar auto-lesão, encoraje buscar ajuda profissional imediatamente.`;
  }

  /**
   * Build conversation context from history
   */
  buildConversationContext(conversationHistory, userProfile) {
    // Get last N messages for context
    const recentMessages = conversationHistory
      .slice(-this.contextWindow)
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

    // If we have user profile insights, add them as context
    if (userProfile.aiProfile?.personality) {
      const personalityContext = this.buildPersonalityContext(userProfile.aiProfile.personality);
      if (personalityContext) {
        recentMessages.unshift({
          role: 'system',
          content: `Contexto da personalidade: ${personalityContext}`
        });
      }
    }

    return recentMessages;
  }

  /**
   * Build personality context from quiz results
   */
  buildPersonalityContext(personality) {
    const traits = [];
    
    if (personality.introversion_extraversion) {
      traits.push(`Nível de extroversão: ${personality.introversion_extraversion}/10`);
    }
    if (personality.stress_response) {
      traits.push(`Resposta ao estresse: ${personality.stress_response}`);
    }
    if (personality.decision_making_style) {
      traits.push(`Estilo de tomada de decisão: ${personality.decision_making_style}`);
    }
    
    return traits.length > 0 ? traits.join(', ') : null;
  }

  /**
   * Analyze message sentiment and emotions
   */
  async analyzeMessage(message) {
    try {
      const prompt = `Analise a seguinte mensagem e retorne um JSON com:
{
  "sentiment": {"score": número entre -1 e 1, "label": "very_positive|positive|neutral|negative|very_negative"},
  "emotions": [{"emotion": "nome_da_emoção", "confidence": número entre 0 e 1}],
  "topics": [{"topic": "tópico", "relevance": número entre 0 e 1}],
  "urgency": "baixa|media|alta",
  "needs_followup": true/false
}

Mensagem: "${message}"`;

      const response = await this.callEmergentLLM("", [], prompt);
      
      try {
        const analysis = JSON.parse(response);
        return {
          success: true,
          analysis
        };
      } catch (e) {
        return {
          success: false,
          analysis: {
            sentiment: { score: 0, label: "neutral" },
            emotions: [{ emotion: "calm", confidence: 0.7 }],
            topics: [{ topic: "general", relevance: 0.5 }],
            urgency: "baixa",
            needs_followup: false
          }
        };
      }
      
    } catch (error) {
      console.error('Message Analysis Error:', error.message);
      
      // Fallback sentiment analysis
      return {
        success: false,
        analysis: {
          sentiment: { score: 0, label: 'neutral' },
          emotions: [{ emotion: 'neutral', confidence: 0.5 }],
          topics: [{ topic: 'conversa_geral', relevance: 0.7 }],
          urgency: 'baixa',
          needs_followup: false
        }
      };
    }
  }

  /**
   * Generate goal insights and recommendations
   */
  async generateGoalInsights(goal, userProgress, conversationHistory = []) {
    try {
      const contextMessages = conversationHistory.slice(-10);
      const conversationContext = contextMessages.map(msg => 
        `${msg.type}: ${msg.content}`
      ).join('\n');

      const prompt = `Baseado no objetivo abaixo e no contexto das conversas, gere insights e recomendações específicas:

OBJETIVO:
Título: ${goal.title}
Descrição: ${goal.description}
Categoria: ${goal.category}
Progresso atual: ${goal.progress}%
Status: ${goal.status}
Prazo: ${goal.targetDate}

CONTEXTO DAS CONVERSAS:
${conversationContext}

Retorne um JSON com:
{
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": [
    {"recommendation": "texto", "type": "action|resource|strategy", "priority": "alta|media|baixa"},
    {"recommendation": "texto", "type": "action|resource|strategy", "priority": "alta|media|baixa"}
  ],
  "next_steps": ["passo1", "passo2"],
  "motivation_boost": "mensagem motivacional personalizada"
}`;

      const response = await this.callEmergentLLM("", [], prompt);
      
      try {
        const insights = JSON.parse(response);
        return { success: true, insights };
      } catch (e) {
        return { 
          success: false, 
          insights: {
            insights: ["Continue focando em seus objetivos diários."],
            recommendations: [
              {"recommendation": "Mantenha a consistência nas suas ações.", "type": "strategy", "priority": "alta"}
            ],
            next_steps: ["Definir próxima meta específica"],
            motivation_boost: "Você está no caminho certo! Continue assim!"
          }
        };
      }
      
    } catch (error) {
      console.error('Goal Insights Error:', error.message);
      
      return {
        success: false,
        insights: {
          insights: ["Continue focado em pequenos passos diários."],
          recommendations: [{
            recommendation: "Defina uma ação específica para esta semana",
            type: "action",
            priority: "media"
          }],
          next_steps: ["Revise seu progresso semanalmente"],
          motivation_boost: "Cada pequeno passo te leva mais perto do seu objetivo!"
        }
      };
    }
  }

  /**
   * Generate quiz insights from answers
   */
  async generateQuizInsights(answers, previousResults = null) {
    try {
      const prompt = `Analise estas respostas do questionário de personalidade e gere insights personalizados:

RESPOSTAS:
${JSON.stringify(answers, null, 2)}

${previousResults ? `RESULTADOS ANTERIORES:
${JSON.stringify(previousResults, null, 2)}` : ''}

Retorne um JSON com:
{
  "personality_analysis": {
    "traits": [{"name": "trait", "score": 1-10, "description": "descrição"}],
    "strengths": ["força1", "força2"],
    "growth_areas": ["área1", "área2"],
    "communication_style": "estilo"
  },
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["recomendação1", "recomendação2"],
  "growth_plan": {
    "focus_areas": ["área1", "área2"],
    "suggested_goals": ["objetivo1", "objetivo2"]
  }
}`;

      const response = await this.callEmergentLLM("", [], prompt);
      
      try {
        const analysis = JSON.parse(response);
        return { success: true, analysis };
      } catch (e) {
        return { 
          success: false, 
          analysis: {
            personality_analysis: {
              traits: ["equilibrado", "reflexivo"],
              scores: { openness: 7, conscientiousness: 6, extraversion: 5 },
              communication_style: "balanced"
            },
            insights: ["Você demonstra uma personalidade equilibrada com tendências reflexivas."],
            recommendations: ["Continue desenvolvendo autoconhecimento através de práticas regulares."],
            growth_plan: {
              focus_areas: ["autoconhecimento", "comunicação"],
              suggested_goals: ["Praticar mindfulness", "Melhorar comunicação interpessoal"]
            }
          }
        };
      }
      
    } catch (error) {
      console.error('Quiz Analysis Error:', error.message);
      
      return {
        success: false,
        analysis: {
          personality_analysis: {
            traits: [{ name: "autoconhecimento", score: 7, description: "Interesse em crescimento pessoal" }],
            strengths: ["Curiosidade", "Disposição para aprender"],
            growth_areas: ["Definir objetivos mais específicos"],
            communication_style: "reflexivo"
          },
          insights: ["Você demonstra interesse genuíno em se conhecer melhor."],
          recommendations: ["Continue explorando suas emoções através de conversas regulares."],
          growth_plan: {
            focus_areas: ["Autoconhecimento", "Bem-estar emocional"],
            suggested_goals: ["Estabelecer uma rotina de reflexão diária"]
          }
        }
      };
    }
  }

  /**
   * Fallback responses when AI service is unavailable
   */
  getFallbackResponse(userMessage) {
    const fallbacks = [
      "Entendo que você quer conversar sobre isso. Embora eu esteja temporariamente com limitações técnicas, estou aqui para te ouvir. Pode me contar mais sobre como está se sentindo?",
      "Obrigado por compartilhar isso comigo. No momento estou com algumas limitações, mas valorizo muito nossa conversa. O que mais está em sua mente hoje?",
      "Percebo que há algo importante que você quer discutir. Mesmo com limitações técnicas temporárias, quero que saiba que estou aqui para te apoiar. Como posso te ajudar melhor agora?",
      "Agradeço sua paciência comigo hoje. Embora eu esteja enfrentando algumas dificuldades técnicas, nossa conversa é importante para mim. Vamos continuar - o que você gostaria de explorar?"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Generate daily analytics insights
   */
  async generateDailyInsights(analytics, conversationSummary) {
    try {
      const prompt = `Baseado nos dados analíticos do usuário, gere insights personalizados:

MÉTRICAS DO DIA:
Humor: ${analytics.mood}/10
Energia: ${analytics.energy}/10  
Estresse: ${analytics.stress}/10
Conversas: ${analytics.activities.conversationCount}
Mensagens: ${analytics.activities.messageCount}

RESUMO DAS CONVERSAS:
${conversationSummary}

Gere 2-3 insights específicos e 2 recomendações práticas em português brasileiro.
Formato JSON:
{
  "insights": ["insight1", "insight2"],
  "recommendations": ["recomendação1", "recomendação2"],
  "motivation": "mensagem motivacional"
}`;

      // Use same Emergent LLM integration for insights
      const messages = [{ role: 'user', content: prompt }];
      const response = await this.callEmergentLLM("", [], prompt);
      
      try {
        return JSON.parse(response);
      } catch (e) {
        // If response is not JSON, return a fallback structure
        return {
          insights: [response.substring(0, 100)],
          recommendations: ["Continue explorando seus padrões e objetivos."],
          motivation: "Cada insight é um passo em direção ao seu crescimento!"
        };
      }
      
    } catch (error) {
      console.error('Daily Insights Error:', error.message);
      return {
        insights: ["Você está fazendo progresso em sua jornada de crescimento."],
        recommendations: ["Continue se conectando regularmente com seu Gêmeo IA."],
        motivation: "Cada dia é uma oportunidade de crescer um pouco mais!"
      };
    }
  }
}

module.exports = new AIService();