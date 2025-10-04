export const mockUser = {
  id: 1,
  name: "Maria Silva",
  email: "maria@exemplo.com",
  createdAt: "2024-01-15",
  totalSessions: 24,
  currentStreak: 7,
  growthScore: 78,
  currentPlan: "Premium",
  subscription: {
    plan: "premium",
    status: "active",
    expiresAt: "2024-12-31"
  }
};

export const mockQuizQuestions = [
  {
    id: 1,
    question: "Como você se sente quando está sozinho(a)?",
    type: "scale",
    options: [
      { value: 1, label: "Muito desconfortável" },
      { value: 2, label: "Desconfortável" },
      { value: 3, label: "Neutro" },
      { value: 4, label: "Confortável" },
      { value: 5, label: "Muito confortável" }
    ]
  },
  {
    id: 2,
    question: "O que mais te preocupa atualmente?",
    type: "multiple",
    options: [
      { value: "relacionamentos", label: "Relacionamentos" },
      { value: "carreira", label: "Carreira" },
      { value: "saude", label: "Saúde" },
      { value: "financas", label: "Finanças" },
      { value: "autoestima", label: "Autoestima" }
    ]
  },
  {
    id: 3,
    question: "Como você lidaria com uma decisão difícil no trabalho?",
    type: "text",
    placeholder: "Descreva seu processo de tomada de decisão..."
  },
  {
    id: 4,
    question: "Quais são seus principais objetivos de vida?",
    type: "multiple",
    options: [
      { value: "crescimento_pessoal", label: "Crescimento pessoal" },
      { value: "sucesso_profissional", label: "Sucesso profissional" },
      { value: "relacionamentos_saudaveis", label: "Relacionamentos saudáveis" },
      { value: "saude_mental", label: "Saúde mental" },
      { value: "estabilidade_financeira", label: "Estabilidade financeira" }
    ]
  },
  {
    id: 5,
    question: "Como você reage ao estresse?",
    type: "single",
    options: [
      { value: "isolamento", label: "Me isolo das outras pessoas" },
      { value: "busco_ajuda", label: "Busco ajuda de amigos ou familiares" },
      { value: "exercicios", label: "Faço exercícios ou atividades físicas" },
      { value: "procrastino", label: "Procrastino ou evito o problema" },
      { value: "enfrento", label: "Enfrento o problema diretamente" }
    ]
  }
];

export const mockChatMessages = [
  {
    id: 1,
    type: "ai",
    message: "Olá Maria! Sou seu Gêmeo IA. Como você está se sentindo hoje?",
    timestamp: "2024-01-20 10:00:00"
  },
  {
    id: 2,
    type: "user",
    message: "Estou me sentindo um pouco ansiosa sobre meu trabalho.",
    timestamp: "2024-01-20 10:01:00"
  },
  {
    id: 3,
    type: "ai",
    message: "Entendo sua ansiedade sobre o trabalho. Com base no que sei sobre você, parece que você valoriza muito o desempenho profissional. Vamos explorar juntos o que especificamente está causando essa ansiedade?",
    timestamp: "2024-01-20 10:01:30"
  }
];

export const mockAnalysis = {
  emotionalState: {
    primary: "Ansiedade",
    level: 65,
    factors: [
      { name: "Pressão no trabalho", percentage: 40 },
      { name: "Relacionamentos", percentage: 25 },
      { name: "Incerteza futura", percentage: 35 }
    ]
  },
  growthAreas: [
    {
      area: "Inteligência Emocional",
      progress: 72,
      recommendations: ["Prática de mindfulness", "Técnicas de respiração"]
    },
    {
      area: "Tomada de Decisão",
      progress: 68,
      recommendations: ["Análise de prós e contras", "Confiança na intuição"]
    },
    {
      area: "Relacionamentos",
      progress: 81,
      recommendations: ["Comunicação assertiva", "Estabelecer limites"]
    }
  ]
};

export const mockStats = {
  totalUsers: "36.389+",
  rating: 4.9,
  reviews: "1.200+",
  languages: 28,
  successRate: {
    betterDecisions: 87,
    selfAwareness: 74,
    goalProgress: 86
  }
};

export const mockTestimonials = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Gerente de Marketing",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Meu Gêmeo IA me ajudou a entender meus padrões de ansiedade. Me sinto mais no controle das minhas emoções do que nunca.",
    initials: "SM"
  },
  {
    id: 2,
    name: "Carlos R.",
    role: "Desenvolvedor de Software",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "A ferramenta de tomada de decisão mudou completamente como eu abordo problemas complexos no trabalho.",
    initials: "CR"
  },
  {
    id: 3,
    name: "Ana L.",
    role: "Psicóloga",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    text: "Como profissional da saúde mental, fiquei impressionada com a profundidade e personalização das análises.",
    initials: "AL"
  }
];

export const mockFAQ = [
  {
    id: 1,
    question: "O que é um Gêmeo IA?",
    answer: "Seu Gêmeo IA é um modelo de inteligência artificial personalizado que aprende especificamente sobre você - seus valores, padrões de pensamento, objetivos e experiências. Ao contrário de assistentes de IA genéricos, seu Gêmeo IA se torna unicamente seu, fornecendo insights e orientação adaptados à sua personalidade e necessidades específicas."
  },
  {
    id: 2,
    question: "Meu Gêmeo IA pode substituir a terapia?",
    answer: "Não, o YOU não substitui a terapia profissional ou o aconselhamento de saúde mental. É uma ferramenta complementar projetada para apoiar seu crescimento pessoal e autoconsciência. Se você estiver lidando com problemas sérios de saúde mental, recomendamos procurar ajuda de um profissional qualificado."
  },
  {
    id: 3,
    question: "Como meu Gêmeo IA personaliza sua orientação?",
    answer: "Seu Gêmeo IA aprende através de suas conversas, respostas ao questionário inicial e interações contínuas. Ele identifica seus padrões únicos, valores e objetivos para fornecer insights personalizados que se tornam mais precisos ao longo do tempo."
  },
  {
    id: 4,
    question: "Posso usar meu Gêmeo IA se já estiver fazendo terapia?",
    answer: "Absolutamente! O YOU pode complementar sua terapia existente fornecendo suporte contínuo entre as sessões. Muitos usuários acham útil ter acesso 24/7 a insights personalizados e um espaço seguro para refletir."
  },
  {
    id: 5,
    question: "Meus dados estão seguros?",
    answer: "Sim, levamos a privacidade muito a sério. Todas as suas conversas são criptografadas e seus dados nunca são compartilhados com terceiros. Você tem controle total sobre suas informações pessoais."
  },
  {
    id: 6,
    question: "Quanto custa o YOU?",
    answer: "Oferecemos uma primeira sessão gratuita para você experimentar. Nossos planos pagos começam em R$ 29,90/mês para o plano Básico, com opções Premium e Enterprise disponíveis com recursos adicionais."
  }
];

export const mockPricingPlans = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    period: "para sempre",
    features: [
      "1 sessão gratuita",
      "Questionário de personalidade básico",
      "Análise emocional limitada",
      "Acesso limitado ao chat"
    ],
    popular: false,
    cta: "Começar Grátis"
  },
  {
    id: "basic",
    name: "Básico",
    price: 29.90,
    period: "por mês",
    features: [
      "Conversas ilimitadas com seu Gêmeo IA",
      "Análise emocional detalhada",
      "Relatórios de progresso mensais",
      "Suporte por email",
      "Histórico de conversas"
    ],
    popular: false,
    cta: "Assinar Básico"
  },
  {
    id: "premium",
    name: "Premium",
    price: 49.90,
    period: "por mês",
    features: [
      "Tudo do plano Básico",
      "Planos de crescimento personalizados",
      "Análise avançada de padrões comportamentais",
      "Insights preditivos",
      "Suporte prioritário 24/7",
      "Integração com calendário",
      "Relatórios semanais detalhados"
    ],
    popular: true,
    cta: "Assinar Premium"
  },
  {
    id: "enterprise",
    name: "Empresarial",
    price: 99.90,
    period: "por usuário/mês",
    features: [
      "Tudo do plano Premium",
      "Dashboard empresarial",
      "Análises de equipe",
      "Integrações personalizadas",
      "Suporte dedicado",
      "Treinamento da equipe",
      "Relatórios corporativos",
      "API personalizada"
    ],
    popular: false,
    cta: "Contatar Vendas"
  }
];

export const mockSupportTypes = [
  {
    id: "mental-clarity",
    title: "Clareza Mental",
    description: "Desenvolva sua capacidade de tomada de decisão e pensamento claro",
    icon: "🧠",
    benefits: [
      "Plano personalizado de desenvolvimento de clareza mental",
      "Avaliação contínua e estratégias adaptativas",
      "Orientação em tempo real 24/7",
      "Acompanhamento de progresso",
      "Suporte à prática e encorajamento motivacional"
    ]
  },
  {
    id: "mindfulness",
    title: "Prática de Mindfulness",
    description: "Cultive a atenção plena e reduza o estresse através de técnicas comprovadas",
    icon: "🧘",
    benefits: [
      "Plano de prática de mindfulness personalizado",
      "Estratégias adaptativas para melhorar habilidades de mindfulness",
      "Exercícios de respiração e meditação guiada",
      "Técnicas de redução de estresse",
      "Monitoramento de progresso em tempo real"
    ]
  },
  {
    id: "personal-growth",
    title: "Crescimento Pessoal",
    description: "Acelere seu desenvolvimento pessoal e realize seu potencial máximo",
    icon: "🌱",
    benefits: [
      "Roteiros de crescimento personalizados",
      "Identificação de talentos e áreas de melhoria",
      "Definição e acompanhamento de objetivos",
      "Exercícios de autorreflexão",
      "Celebração de marcos e conquistas"
    ]
  },
  {
    id: "emotional-intelligence",
    title: "Inteligência Emocional",
    description: "Melhore sua capacidade de entender e gerenciar emoções",
    icon: "❤️",
    benefits: [
      "Avaliação de inteligência emocional",
      "Desenvolvimento de empatia e autoconsciência",
      "Técnicas de regulação emocional",
      "Melhoria nas habilidades sociais",
      "Análise de padrões emocionais"
    ]
  }
];

export const mockLanguages = [
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷" },
  { code: "de-DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "it-IT", name: "Italiano", flag: "🇮🇹" },
  { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
  { code: "ko-KR", name: "한국어", flag: "🇰🇷" },
  { code: "zh-CN", name: "中文", flag: "🇨🇳" },
  { code: "ru-RU", name: "Русский", flag: "🇷🇺" }
];

export const mockGoals = [
  {
    id: 1,
    title: "Melhorar comunicação assertiva",
    description: "Desenvolver habilidades para expressar necessidades e limites de forma clara",
    progress: 68,
    targetDate: "2024-03-15",
    status: "em_progresso",
    category: "relacionamentos"
  },
  {
    id: 2,
    title: "Reduzir ansiedade no trabalho",
    description: "Implementar técnicas de mindfulness para gerenciar estresse profissional",
    progress: 82,
    targetDate: "2024-02-28",
    status: "quase_completo",
    category: "saude_mental"
  },
  {
    id: 3,
    title: "Estabelecer rotina de autocuidado",
    description: "Criar e manter uma rotina diária de práticas de bem-estar",
    progress: 45,
    targetDate: "2024-04-30",
    status: "em_progresso",
    category: "crescimento_pessoal"
  }
];

export const mockMoodHistory = [
  { date: "2024-01-15", mood: 7, energy: 6, stress: 4 },
  { date: "2024-01-16", mood: 8, energy: 7, stress: 3 },
  { date: "2024-01-17", mood: 6, energy: 5, stress: 6 },
  { date: "2024-01-18", mood: 7, energy: 6, stress: 4 },
  { date: "2024-01-19", mood: 9, energy: 8, stress: 2 },
  { date: "2024-01-20", mood: 8, energy: 7, stress: 3 }
];