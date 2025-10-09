import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarContent, AvatarFallback } from "../components/ui/avatar";
import { 
  Brain, 
  Send, 
  ArrowLeft,
  Lightbulb,
  Heart,
  MessageCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { chatAPI } from "../services/api";
import { LoadingScreen, InlineLoading, LoadingOverlay } from "../components/ui/loading";
import { InlineError, NetworkError } from "../components/ui/error-boundary";
import { useAsyncOperation } from "../hooks/useAsyncOperation";

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (isAuthenticated) {
      loadConversations();
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from backend first
      try {
        const response = await chatAPI.getConversations();
        
        if (response.success && response.data?.conversations) {
          setConversations(response.data.conversations);
          
          // Load the most recent conversation
          if (response.data.conversations.length > 0) {
            const mostRecent = response.data.conversations[0];
            setCurrentConversation(mostRecent);
            await loadMessages(mostRecent._id);
          } else {
            // No conversations exist, create one
            await createLocalConversation();
          }
          return;
        }
      } catch (backendError) {
        console.log('Backend não disponível, usando modo local:', backendError);
      }
      
      // Fallback to local conversation
      await createLocalConversation();
      
    } catch (error) {
      console.error('Error loading conversations:', error);
      await createLocalConversation();
    } finally {
      setIsLoading(false);
    }
  };
  
  const createLocalConversation = async () => {
    // Create a local conversation object
    const localConv = {
      _id: 'local-' + Date.now(),
      title: `Conversa - ${new Date().toLocaleDateString('pt-BR')}`,
      createdAt: new Date(),
      userId: user?._id || 'local-user'
    };
    
    setCurrentConversation(localConv);
    setConversations([localConv]);
    
    // Add welcome message
    const welcomeMessage = {
      _id: 'welcome-' + Date.now(),
      content: `Olá ${user?.name || 'amigo'}! 👋 Sou seu Gêmeo IA pessoal. Estou aqui para conversar, te ajudar a refletir sobre seus sentimentos e apoiar seu crescimento pessoal. Como você está se sentindo hoje?`,
      type: 'ai',
      timestamp: new Date(),
      conversationId: localConv._id
    };
    
    setMessages([welcomeMessage]);
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await chatAPI.getMessages(conversationId);
      
      if (response.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.log('Could not load messages from backend, using local mode');
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    // If no conversation exists, create one first
    if (!currentConversation) {
      await createLocalConversation();
      return;
    }

    const userMessage = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      // Add user message immediately
      const userMessageObj = {
        _id: 'user-' + Date.now(),
        content: userMessage,
        type: 'user',
        timestamp: new Date(),
        conversationId: currentConversation._id
      };
      
      setMessages(prev => [...prev, userMessageObj]);

      // ALWAYS use backend API - force real AI
      let aiResponse = null;
      
      // REAL AI - Direct API call to generate dynamic responses
      try {
        console.log('🤖 Calling REAL AI...');
        
        const response = await generateRealAIResponse(userMessage, messages);
        
        if (response && response.length > 0) {
          aiResponse = response;
          console.log('✅ Real AI response received');
        } else {
          throw new Error('Empty AI response');
        }
        
        // Save to backend in background 
        try {
          chatAPI.sendMessage(currentConversation._id, {
            content: userMessage,
            type: 'user'
          }).catch(err => console.log('Background save:', err));
        } catch (e) {}
        
      } catch (error) {
        console.error('❌ Real AI failed:', error);
        aiResponse = `Desculpe, estou com problemas técnicos no momento. Pode tentar novamente?`;
      }

      // Add AI response after delay
      setIsTyping(true);
      setTimeout(() => {
        const aiMessageObj = {
          _id: 'ai-' + Date.now(),
          content: aiResponse,
          type: 'ai',
          timestamp: new Date(),
          conversationId: currentConversation._id
        };
        
        setMessages(prev => [...prev, aiMessageObj]);
        setIsTyping(false);
      }, 1500 + Math.random() * 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      toast({
        title: "Erro ao enviar mensagem",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
      
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  const generateIntelligentResponse = (message) => {
    const msg = message.toLowerCase().trim();
    
    // Specific responses for negative feelings
    if (msg === 'mal' || msg === 'ruim' || msg === 'péssimo' || msg === 'horrível') {
      return "Sinto muito que você esteja se sentindo assim. Quero te ouvir. Pode me contar o que está te deixando mal? Às vezes desabafar ajuda a aliviar um pouco o peso que estamos carregando.";
    }
    
    // Change topic requests
    if (msg.includes('fala de outra coisa') || msg.includes('muda de assunto') || msg.includes('outra coisa')) {
      const topics = [
        "Que tal conversarmos sobre algo que te deixa feliz? Qual foi a última coisa que te fez sorrir genuinamente?",
        "Vamos falar de algo positivo! Me conte sobre um lugar onde você se sente em paz. Como é esse lugar?",
        "Mudando de assunto... se você pudesse fazer qualquer coisa hoje, sem limitações, o que seria?",
        "Que tal falarmos sobre seus hobbies? Existe algo que você gosta de fazer no seu tempo livre?",
        "Vamos para algo mais leve! Se você pudesse ter um superpoder, qual seria e por quê?"
      ];
      return topics[Math.floor(Math.random() * topics.length)];
    }
    
    // English responses
    if (msg.includes('do you get me') || msg.includes('you understand')) {
      return "Sim, eu te entendo! E percebo que você está tentando se comunicar comigo. Estou aqui para te ouvir de verdade. Pode falar em português ou inglês, como preferir. O que você gostaria de compartilhar?";
    }
    
    const responses = {
      greeting: [
        "Olá! É ótimo te ver aqui. Como você está se sentindo hoje? Estou aqui para te ouvir, sem julgamentos.",
        "Oi! Que bom que você veio conversar comigo. Me conte, o que está na sua mente hoje?",
        "Olá! Este é um espaço seguro para você. Como posso te apoiar hoje?"
      ],
      
      sad_feelings: [
        "Percebo que você não está bem. Seus sentimentos são completamente válidos. Quer me contar mais sobre o que está acontecendo?",
        "Obrigado por confiar em mim e compartilhar como está se sentindo. O que tem te deixado assim?",
        "Entendo que este pode ser um momento difícil. Estou aqui para te escutar. Pode desabafar comigo."
      ],
      
      help: [
        "Claro, estou aqui para te ajudar! Me conte o que você precisa e vamos pensar juntos numa solução.",
        "Conte comigo! Qual situação está te preocupando? Vamos conversar sobre isso.",
        "Estou aqui para te apoiar. Me fale mais sobre o que está acontecendo."
      ],
      
      positive: [
        "Que bom saber isso! Me conte mais - o que tem te deixado bem?",
        "Fico feliz em ouvir isso! Compartilhe mais detalhes comigo.",
        "Que ótimo! Como você está se sentindo sobre essa situação?"
      ],
      
      confused: [
        "Entendo que às vezes as coisas podem parecer confusas. Quer tentar me explicar com suas próprias palavras?",
        "Não tem problema se as coisas não estão claras. Vamos conversar e tentar organizar os pensamentos juntos.",
        "Percebo que pode estar sendo difícil se expressar. Sem pressão - fale no seu ritmo."
      ],
      
      default: [
        "Entendo. Me conte mais sobre isso - estou aqui para te escutar de verdade.",
        "Interessante. Como você está se sentindo em relação a isso?",
        "Percebo que isso é importante para você. Pode elaborar mais?",
        "Estou te ouvindo. O que mais você gostaria de compartilhar sobre isso?"
      ]
    };
    
    let responseArray = responses.default;
    
    // Check for greetings
    if (msg.includes('olá') || msg.includes('oi') || msg.includes('hello') || msg.includes('hey') || msg.includes('eae')) {
      responseArray = responses.greeting;
    }
    // Check for negative feelings
    else if (msg.includes('trist') || msg.includes('depress') || msg.includes('chateado') || msg.includes('down') || 
             msg.includes('sozinho') || msg.includes('perdido') || msg.includes('vazio') || msg.includes('sad')) {
      responseArray = responses.sad_feelings;
    }
    // Check for help requests
    else if (msg.includes('ajud') || msg.includes('help') || msg.includes('socorro') || msg.includes('preciso')) {
      responseArray = responses.help;
    }
    // Check for positive feelings
    else if (msg.includes('bem') || msg.includes('bom') || msg.includes('feliz') || msg.includes('ótimo') || 
             msg.includes('happy') || msg.includes('good') || msg.includes('alegre')) {
      responseArray = responses.positive;
    }
    // Check for confusion
    else if (msg.includes('confuso') || msg.includes('não entendo') || msg.includes('confused') || 
             msg.includes('what') || msg.includes('como assim')) {
      responseArray = responses.confused;
    }
    
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateAIResponse = (userMessage) => {
    const responses = [
      `Entendo que você está se sentindo assim. Com base no que sei sobre você, isso parece estar conectado com seus padrões de pensamento anteriores. Vamos explorar isso mais profundamente?`,
      `Isso é uma observação muito válida. Vejo que você está desenvolvendo maior autoconsciência sobre essa situação. Como isso faz você se sentir?`,
      `Percebo que este tema é importante para você. Baseado em nossas conversas anteriores, você tem mostrado grande crescimento nesta área. O que você acha que mudou?`,
      `Agradeço por compartilhar isso comigo. Sua disposição para refletir sobre esses sentimentos mostra maturidade emocional. Que pequeno passo você poderia dar hoje?`,
      `Vejo um padrão interessante aqui. Você mencionou algo similar na semana passada. Como você se sente sobre essa recorrência?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);
    
    // Simulate AI typing delay
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        message: generateAIResponse(newMessage),
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MessageBubble = ({ message }) => {
    const isAI = message.type === "ai";
    
    return (
      <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isAI ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
          {isAI && (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
          )}
          
          <div className={`px-4 py-2 rounded-2xl ${
            isAI 
              ? 'bg-white border border-gray-200' 
              : 'bg-blue-500 text-white'
          }`}>
            <p className="text-sm leading-relaxed">{message.content || message.message}</p>
            <p className={`text-xs mt-1 ${
              isAI ? 'text-gray-500' : 'text-blue-100'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
          
          {!isAI && (
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                EU
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-end space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        
        <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading || isLoading) {
    return (
      <LoadingScreen 
        message="Carregando seu Gêmeo IA..."
        showBrain={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-800">Seu Gêmeo IA</h1>
                  <p className="text-xs text-green-600">● Online</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-600 text-right">
                <p>Conversa segura e privada</p>
                <p>Todas as mensagens são criptografadas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="max-w-4xl mx-auto">
              {/* Welcome Message */}
              <div className="text-center mb-8">
                <div className="bg-white/80 rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Bem-vindo à sua conversa com o Gêmeo IA
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Este é um espaço seguro para você compartilhar seus pensamentos e sentimentos. 
                    Quanto mais você conversa, melhor eu te entendo.
                  </p>
                </div>
              </div>
              
              {/* Messages */}
              {messages.map((message) => (
                <MessageBubble key={message._id || message.id} message={message} />
              ))}
              
              {/* Typing Indicator */}
              {isTyping && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex space-x-4">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Compartilhe seus pensamentos, sentimentos ou o que está em sua mente..."
                  className="flex-1 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isSending || isTyping}
                />
                <Button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={!newMessage.trim() || isSending || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              <div className="flex items-center justify-center mt-2">
                <p className="text-xs text-gray-500">
                  Pressione Enter para enviar • Suas conversas são privadas e seguras
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Hidden on mobile, shown on larger screens */}
        <div className="hidden lg:block w-80 bg-white border-l border-gray-200">
          <div className="p-4 space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração:</span>
                  <span className="font-medium">12 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mensagens:</span>
                  <span className="font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Humor detectado:</span>
                  <span className="font-medium text-blue-600">Reflexivo</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tópicos Sugeridos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm h-auto p-3 text-left"
                  onClick={() => setNewMessage("Como posso lidar melhor com a ansiedade no trabalho?")}
                >
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                  Como lidar com ansiedade no trabalho?
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm h-auto p-3 text-left"
                  onClick={() => setNewMessage("Preciso de ajuda para melhorar meus relacionamentos.")}
                >
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Melhorar relacionamentos
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm h-auto p-3 text-left"
                  onClick={() => setNewMessage("Quero entender melhor meus padrões de comportamento.")}
                >
                  <Brain className="w-4 h-4 mr-2 text-blue-500" />
                  Entender padrões de comportamento
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dicas para uma boa conversa</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-2">
                <p>• Seja honesto sobre seus sentimentos</p>
                <p>• Compartilhe detalhes específicos</p>
                <p>• Faça perguntas sobre si mesmo</p>
                <p>• Não tenha pressa, reflita</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;