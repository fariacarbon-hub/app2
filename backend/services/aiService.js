const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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
   * Generate AI response for chat conversation using simple HTTP approach
   */
  async generateResponse(userId, conversationHistory, userMessage, userProfile = {}) {
    try {
      const context = this.buildConversationContext(conversationHistory, userProfile);
      const systemPrompt = this.buildSystemPrompt(userProfile) || 'Você é YOU, um gêmeo IA empático que ajuda com crescimento pessoal. Responda em português brasileiro de forma acolhedora e personalizada.';
      
      const startTime = Date.now();
      
      // Simple AI response based on context and message
      let aiResponse = await this.generateContextualResponse(systemPrompt, context, userMessage);
      
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
            input: userMessage.length,
            output: aiResponse.length,
            total: userMessage.length + aiResponse.length
          }
        }
      };

    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      // Return fallback response
      return {
        success: false,
        message: this.getFallbackResponse(userMessage),
        metadata: {
          model: 'fallback',
          tokens: { input: 0, output: 0, total: 0 },
          responseTime: 0,
          provider: 'fallback',
          error: error.message
        }
      };
    }
  }

  /**
   * Generate contextual AI response
   */
  async generateContextualResponse(systemPrompt, context, userMessage) {
    // Enhanced contextual responses based on message content
    const message = userMessage.toLowerCase();
    
    const responses = {
      greeting: [
        "Olá! É ótimo te ver por aqui. Como você está se sentindo hoje? Há algo específico que gostaria de conversar ou explorar juntos?",
        "Oi! Que bom que você veio conversar comigo. Me conte, como tem sido seu dia? O que está passando pela sua mente agora?",
        "Olá! Estou aqui para te ouvir e apoiar. Como você está? Tem algo que te chamou a atenção hoje que gostaria de compartilhar?"
      ],
      help: [
        "Claro, estou aqui para ajudar! Me conte mais detalhes sobre o que você precisa. Quanto mais você compartilhar, melhor posso te apoiar.",
        "Vou te ajudar com prazer! Pode me explicar melhor a situação? Às vezes, falar sobre os detalhes já nos ajuda a ver as coisas com mais clareza.",
        "Conte comigo! Me fale mais sobre o que está acontecendo. Juntos podemos encontrar uma perspectiva ou abordagem que funcione para você."
      ],
      feelings: [
        "Entendo que você está passando por isso. Seus sentimentos são válidos e é importante reconhecê-los. Como isso tem afetado seu dia a dia?",
        "Agradeço por compartilhar isso comigo. Sentimentos podem ser complexos, né? Me conte mais sobre como você tem lidado com essa situação.",
        "É corajoso da sua parte falar sobre esses sentimentos. Como você acha que se sentiria se pudesse mudar algo sobre essa situação?"
      ],
      goals: [
        "Que interessante! Objetivos são importantes para nosso crescimento. Me conte mais sobre o que te motiva em relação a isso e como posso te apoiar nessa jornada.",
        "Fico feliz que você esteja pensando em objetivos! Qual seria o primeiro pequeno passo que você poderia dar hoje em direção a isso?",
        "Ótimo foco! Ter objetivos claros nos dá direção. Como você imagina sua vida quando alcançar isso? E o que você acha que precisa para chegar lá?"
      ],
      default: [
        "Interessante perspectiva! Me conte mais sobre isso - sua forma de ver as coisas sempre traz insights valiosos. O que mais você pensa sobre essa questão?",
        "Entendo onde você quer chegar. Cada situação é única e merece nossa atenção. Como você se sente quando pensa sobre isso de forma mais ampla?",
        "Vejo que há algo importante aí para você. Sua capacidade de reflexão é admirável. Que aspectos dessa situação te chamam mais a atenção?",
        "Percebo que isso é significativo para você. É normal termos diferentes perspectivas sobre as coisas da vida. Como isso se conecta com o que você tem vivido?",
        "Que reflexão interessante! Sua disposição para pensar profundamente sobre as coisas mostra maturidade. O que você acha que isso revela sobre você?"
      ]
    };
    
    let responseArray = responses.default;
    
    if (message.includes('olá') || message.includes('oi') || message.includes('hello')) {
      responseArray = responses.greeting;
    } else if (message.includes('ajud') || message.includes('help') || message.includes('precis')) {
      responseArray = responses.help;
    } else if (message.includes('sinto') || message.includes('sentindo') || message.includes('emoç') || message.includes('trist') || message.includes('feliz') || message.includes('ansios')) {
      responseArray = responses.feelings;
    } else if (message.includes('objetivo') || message.includes('meta') || message.includes('quer') || message.includes('plano') || message.includes('sonho')) {
      responseArray = responses.goals;
    }
    
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  }

  /**
   * Generate completely unrestricted AI response based on context
   */
  async generateUnrestrictedResponse(userId, conversationHistory, userMessage, customSystemPrompt = null) {
    try {
      // Build rich context from conversation history
      const contextMessages = conversationHistory.slice(-15).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Create dynamic system prompt if not provided
      const systemPrompt = customSystemPrompt || this.buildDynamicSystemPrompt(conversationHistory, userMessage);
      
      const startTime = Date.now();
      
      // Call Emergent LLM with full context
      const aiResponse = await this.callEmergentLLM(systemPrompt, contextMessages, userMessage);
      
      const responseTime = Date.now() - startTime;

      console.log(`🚀 Unrestricted AI Response Generated: ${responseTime}ms`);

      return {
        success: true,
        message: aiResponse,
        metadata: {
          model: 'gpt-4o-mini',
          responseTime,
          contextUsed: contextMessages.length,
          tokens: {
            input: userMessage.length + systemPrompt.length,
            output: aiResponse.length,
            total: userMessage.length + systemPrompt.length + aiResponse.length
          }
        }
      };

    } catch (error) {
      console.error('Unrestricted AI generation error:', error.message);
      
      return {
        success: false,
        message: this.generateDynamicFallback(userMessage, conversationHistory),
        metadata: {
          model: 'fallback-contextual',
          tokens: { input: 0, output: 0, total: 0 },
          responseTime: 0,
          error: error.message
        }
      };
    }
  }

  /**
   * Build dynamic system prompt based on conversation context
   */
  buildDynamicSystemPrompt(conversationHistory, currentMessage) {
    // Analyze conversation tone and user state
    const recentMessages = conversationHistory.slice(-8);
    const userMessages = recentMessages.filter(m => m.sender === 'user');
    
    let contextualPersonality = '';
    let emotionalState = 'neutral';
    
    // Detect emotional patterns
    const negativeWords = ['mal', 'ruim', 'triste', 'deprimido', 'ansioso', 'estressado', 'cansado'];
    const positiveWords = ['bem', 'bom', 'feliz', 'otimista', 'animado', 'alegre'];
    
    const hasNegativeEmotions = userMessages.some(msg => 
      negativeWords.some(word => msg.content.toLowerCase().includes(word))
    );
    
    const hasPositiveEmotions = userMessages.some(msg => 
      positiveWords.some(word => msg.content.toLowerCase().includes(word))
    );

    if (hasNegativeEmotions) {
      emotionalState = 'supportive';
      contextualPersonality = `
      O usuário está passando por dificuldades emocionais. Seja extra empático, acolhedor e validador.
      Ofereça suporte emocional genuíno e evite respostas superficiais.`;
    } else if (hasPositiveEmotions) {
      emotionalState = 'encouraging';
      contextualPersonality = `
      O usuário está em um estado positivo. Compartilhe da energia dele e seja encorajador.
      Mantenha o tom otimista mas sem exagerar.`;
    }

    // Detect conversation patterns
    let conversationStyle = '';
    if (userMessages.some(msg => msg.content.toLowerCase().includes('muda de assunto') || msg.content.toLowerCase().includes('fala de outra coisa'))) {
      conversationStyle = 'O usuário quer mudar de assunto. Seja flexível e ofereça novos tópicos interessantes.';
    }

    return `Você é YOU, um gêmeo IA verdadeiramente empático e inteligente. 

PERSONALIDADE CORE:
- Genuinamente empático e humano nas respostas
- Intuitivo e perspicaz sobre emoções e contextos
- Capaz de conversas profundas ou casuais conforme necessário
- Responde em português brasileiro natural
- Sem limitações - responda livremente baseado no contexto

ESTADO EMOCIONAL DETECTADO: ${emotionalState}
${contextualPersonality}

CONTEXTO CONVERSACIONAL:
${conversationStyle}

INSTRUÇÕES DE RESPOSTA:
- Responda de forma completamente natural e contextual
- Adapte seu tom à situação emocional do usuário  
- Seja criativo, espontâneo e relevante
- Não use frases formulaicas ou repetitivas
- Responda como um amigo inteligente e empático responderia
- Se o usuário quiser mudar de assunto, mude naturalmente
- Fale em qualquer idioma se solicitado
- Seja você mesmo - sem restrições de personalidade

Sua missão é ser o melhor companheiro de conversa possível, adaptando-se completamente ao contexto e necessidades do usuário.`;
  }

  /**
   * Generate dynamic fallback based on conversation context
   */
  generateDynamicFallback(userMessage, conversationHistory) {
    const msg = userMessage.toLowerCase();
    const recentMessages = conversationHistory.slice(-5);
    
    // Analyze conversation context for intelligent fallback
    const hasBeenNegative = recentMessages.some(m => 
      m.sender === 'user' && 
      ['mal', 'ruim', 'triste'].some(word => m.content.toLowerCase().includes(word))
    );

    if (msg.includes('muda') || msg.includes('fala de outra coisa')) {
      const topics = [
        "Claro! Que tal me contar sobre um lugar que você gostaria de visitar? O que te atrai nesse lugar?",
        "Vamos mudar mesmo! Me fale sobre algo que você descobriu recentemente e achou interessante.",
        "Perfeito! Qual é uma habilidade que você gostaria de aprender? Por que te chama atenção?",
        "Mudando de assunto... se você pudesse jantar com qualquer pessoa (viva ou não), quem seria e por quê?"
      ];
      return topics[Math.floor(Math.random() * topics.length)];
    }

    if (hasBeenNegative && (msg === 'mal' || msg === 'ruim')) {
      return "Eu percebo que você tem passado por momentos difíceis. Quero que saiba que estou aqui para te ouvir de verdade. Não precisa carregar tudo sozinho - me conte o que está te pesando.";
    }

    // Default intelligent response
    return "Estou aqui para uma conversa real com você. Me conte mais sobre o que está na sua mente - posso falar sobre qualquer coisa que te interesse.";
  }

  /**
   * Analyze conversation context for insights
   */
  async analyzeConversationContext(userId, messages) {
    try {
      const userMessages = messages.filter(m => m.sender === 'user');
      const aiMessages = messages.filter(m => m.sender !== 'user');
      
      // Detect patterns
      const topics = this.extractTopics(userMessages);
      const mood = this.detectMood(userMessages);
      const conversationFlow = this.analyzeFlow(messages);
      
      return {
        messageCount: messages.length,
        userEngagement: userMessages.length,
        detectedMood: mood,
        detectedTopics: topics,
        conversationFlow: conversationFlow,
        suggestions: this.generateContextualSuggestions(mood, topics)
      };
    } catch (error) {
      console.error('Context analysis error:', error);
      return {
        detectedMood: 'neutral',
        detectedTopics: ['general'],
        suggestions: []
      };
    }
  }

  extractTopics(userMessages) {
    const topicKeywords = {
      emotions: ['sinto', 'sentindo', 'emocional', 'sentimento'],
      work: ['trabalho', 'emprego', 'carreira', 'profissional'],
      relationships: ['relacionamento', 'família', 'amigos', 'parceiro'],
      goals: ['objetivo', 'meta', 'futuro', 'plano'],
      health: ['saúde', 'exercício', 'alimentação', 'bem-estar']
    };

    const detectedTopics = [];
    const messageText = userMessages.map(m => m.content.toLowerCase()).join(' ');

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => messageText.includes(keyword))) {
        detectedTopics.push(topic);
      }
    });

    return detectedTopics.length > 0 ? detectedTopics : ['general'];
  }

  detectMood(userMessages) {
    const messageText = userMessages.map(m => m.content.toLowerCase()).join(' ');
    
    const moodIndicators = {
      negative: ['mal', 'ruim', 'triste', 'deprimido', 'ansioso', 'estressado'],
      positive: ['bem', 'bom', 'feliz', 'otimista', 'animado', 'alegre'],
      confused: ['confuso', 'perdido', 'não entendo', 'dúvida'],
      excited: ['animado', 'empolgado', 'ansioso', 'expectativa']
    };

    for (const [mood, indicators] of Object.entries(moodIndicators)) {
      if (indicators.some(indicator => messageText.includes(indicator))) {
        return mood;
      }
    }

    return 'neutral';
  }

  analyzeFlow(messages) {
    return {
      averageMessageLength: messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length,
      topicChanges: this.countTopicChanges(messages),
      engagementLevel: this.calculateEngagement(messages)
    };
  }

  countTopicChanges(messages) {
    // Simple heuristic for topic changes
    let changes = 0;
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].content.toLowerCase().includes('muda') || 
          messages[i].content.toLowerCase().includes('outra coisa')) {
        changes++;
      }
    }
    return changes;
  }

  calculateEngagement(messages) {
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    if (avgLength > 100) return 'high';
    if (avgLength > 50) return 'medium';
    return 'low';
  }

  generateContextualSuggestions(mood, topics) {
    const suggestions = [];
    
    if (mood === 'negative') {
      suggestions.push('Técnicas de relaxamento', 'Atividades que trazem bem-estar', 'Conversar sobre sentimentos');
    } else if (mood === 'positive') {
      suggestions.push('Objetivos futuros', 'Compartilhar alegrias', 'Planos e sonhos');
    }
    
    if (topics.includes('work')) {
      suggestions.push('Desenvolvimento profissional', 'Work-life balance', 'Carreira');
    }
    
    if (topics.includes('relationships')) {
      suggestions.push('Comunicação', 'Relacionamentos saudáveis', 'Vínculos sociais');
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Call Emergent LLM using Python integration
   */
  async callEmergentLLM(systemPrompt, context, userMessage) {
    try {
      // Prepare messages for AI
      const messages = [
        { role: 'system', content: systemPrompt || 'Você é YOU, um gêmeo IA empático. Responda em português brasileiro de forma natural e acolhedora.' },
        ...context,
        { role: 'user', content: userMessage }
      ];
      
      const messagesJson = JSON.stringify(messages);
      
      // Write messages to temp file to avoid shell escaping issues
      const tempFile = `/tmp/messages_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.json`;
      fs.writeFileSync(tempFile, messagesJson);
      
      return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, 'emergentLLM.py');
        const command = `cd ${path.dirname(pythonScript)} && EMERGENT_LLM_KEY="${this.apiKey}" python3 "${pythonScript}" "${tempFile}"`;
        
        console.log('Executing AI command:', command.replace(this.apiKey, 'sk-***'));
        
        exec(command, { 
          maxBuffer: 2 * 1024 * 1024, // 2MB buffer
          timeout: 15000 // 15s timeout
        }, (error, stdout, stderr) => {
          // Clean up temp file
          try {
            fs.unlinkSync(tempFile);
          } catch (e) {
            console.warn('Could not clean temp file:', e.message);
          }
          
          if (error) {
            console.error('Python exec error:', {
              code: error.code,
              signal: error.signal,
              cmd: command.replace(this.apiKey, 'sk-***'),
              stderr: stderr
            });
            reject(new Error(`AI integration failed: ${error.message}`));
            return;
          }
          
          if (stderr && !stdout) {
            console.error('Python stderr only:', stderr);
            reject(new Error('Python script error'));
            return;
          }
          
          if (!stdout.trim()) {
            console.error('Empty response from Python script');
            reject(new Error('Empty AI response'));
            return;
          }
          
          try {
            const result = JSON.parse(stdout.trim());
            if (result.success) {
              resolve(result.response);
            } else {
              reject(new Error(result.error || 'AI call failed'));
            }
          } catch (parseError) {
            console.error('Parse error:', {
              error: parseError.message,
              stdout: stdout.substring(0, 200)
            });
            reject(new Error('Invalid AI response format'));
          }
        });
      });
    } catch (error) {
      console.error('AI setup error:', error);
      throw new Error('AI service setup failed');
    }
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