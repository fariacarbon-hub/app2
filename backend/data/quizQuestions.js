const personalityQuestions = [
  {
    id: 1,
    category: 'emotional_response',
    question: 'Como você se sente quando está sozinho(a)?',
    type: 'single_choice',
    options: [
      { value: 'muito_desconfortavel', text: 'Muito desconfortável', score: 1 },
      { value: 'desconfortavel', text: 'Desconfortável', score: 2 },
      { value: 'neutro', text: 'Neutro', score: 3 },
      { value: 'confortavel', text: 'Confortável', score: 4 },
      { value: 'muito_confortavel', text: 'Muito confortável', score: 5 }
    ]
  },
  {
    id: 2,
    category: 'stress_management',
    question: 'Quando enfrenta uma situação estressante, sua primeira reação é:',
    type: 'single_choice',
    options: [
      { value: 'buscar_apoio', text: 'Buscar apoio de outras pessoas', score: 1 },
      { value: 'analisar_logicamente', text: 'Analisar logicamente a situação', score: 2 },
      { value: 'tomar_acao_rapida', text: 'Tomar ação imediata', score: 3 },
      { value: 'precisar_tempo', text: 'Precisar de tempo para processar', score: 4 },
      { value: 'evitar_situacao', text: 'Evitar ou adiar a situação', score: 5 }
    ]
  },
  {
    id: 3,
    category: 'decision_making',
    question: 'Ao tomar decisões importantes, você tende a:',
    type: 'single_choice',
    options: [
      { value: 'seguir_intuicao', text: 'Seguir sua intuição', score: 1 },
      { value: 'analisar_dados', text: 'Analisar todos os dados disponíveis', score: 2 },
      { value: 'consultar_outros', text: 'Consultar outras pessoas', score: 3 },
      { value: 'considerar_emocoes', text: 'Considerar como se sente sobre as opções', score: 4 },
      { value: 'procrastinar', text: 'Adiar até o último momento', score: 5 }
    ]
  },
  {
    id: 4,
    category: 'social_energy',
    question: 'Depois de um longo dia social, você se sente:',
    type: 'single_choice',
    options: [
      { value: 'energizado', text: 'Energizado e querendo mais interação', score: 5 },
      { value: 'satisfeito', text: 'Satisfeito mas pronto para relaxar', score: 4 },
      { value: 'neutro', text: 'Normal, sem mudança significativa', score: 3 },
      { value: 'cansado', text: 'Mentalmente cansado', score: 2 },
      { value: 'exausto', text: 'Completamente exausto', score: 1 }
    ]
  },
  {
    id: 5,
    category: 'goal_setting',
    question: 'Como você prefere estabelecer e perseguir objetivos?',
    type: 'single_choice',
    options: [
      { value: 'planos_detalhados', text: 'Com planos detalhados e prazos específicos', score: 1 },
      { value: 'diretrizes_gerais', text: 'Com diretrizes gerais e flexibilidade', score: 2 },
      { value: 'fluxo_natural', text: 'Deixando fluir naturalmente', score: 3 },
      { value: 'pressao_externa', text: 'Com pressão externa ou accountability', score: 4 },
      { value: 'evito_objetivos', text: 'Evito estabelecer objetivos formais', score: 5 }
    ]
  },
  {
    id: 6,
    category: 'conflict_resolution',
    question: 'Quando há conflito, você tende a:',
    type: 'single_choice',
    options: [
      { value: 'confrontar_diretamente', text: 'Confrontar diretamente', score: 1 },
      { value: 'buscar_mediacao', text: 'Buscar mediação', score: 2 },
      { value: 'evitar_conflito', text: 'Evitar o conflito', score: 3 },
      { value: 'ceder_facilmente', text: 'Ceder para manter a paz', score: 4 },
      { value: 'analisar_primeiro', text: 'Analisar antes de agir', score: 5 }
    ]
  },
  {
    id: 7,
    category: 'learning_style',
    question: 'Você aprende melhor através de:',
    type: 'single_choice',
    options: [
      { value: 'pratica_hands_on', text: 'Prática hands-on', score: 1 },
      { value: 'leitura_teoria', text: 'Leitura e teoria', score: 2 },
      { value: 'discussao_grupo', text: 'Discussão em grupo', score: 3 },
      { value: 'reflexao_individual', text: 'Reflexão individual', score: 4 },
      { value: 'exemplos_visuais', text: 'Exemplos visuais', score: 5 }
    ]
  },
  {
    id: 8,
    category: 'change_adaptation',
    question: 'Como você reage a mudanças inesperadas?',
    type: 'single_choice',
    options: [
      { value: 'empolgacao', text: 'Com empolgação e curiosidade', score: 5 },
      { value: 'cautela_otimismo', text: 'Com cautela mas otimismo', score: 4 },
      { value: 'neutro_adaptativo', text: 'De forma neutra e adaptativa', score: 3 },
      { value: 'ansiedade_resistencia', text: 'Com ansiedade e alguma resistência', score: 2 },
      { value: 'forte_resistencia', text: 'Com forte resistência', score: 1 }
    ]
  },
  {
    id: 9,
    category: 'communication_style',
    question: 'Seu estilo de comunicação é mais:',
    type: 'single_choice',
    options: [
      { value: 'direto_objetivo', text: 'Direto e objetivo', score: 1 },
      { value: 'diplomatico_cuidadoso', text: 'Diplomático e cuidadoso', score: 2 },
      { value: 'expressivo_emocional', text: 'Expressivo e emocional', score: 3 },
      { value: 'ouvinte_ativo', text: 'Ouvinte ativo', score: 4 },
      { value: 'reservado_seletivo', text: 'Reservado e seletivo', score: 5 }
    ]
  },
  {
    id: 10,
    category: 'motivation_source',
    question: 'O que mais te motiva?',
    type: 'single_choice',
    options: [
      { value: 'reconhecimento_externo', text: 'Reconhecimento externo', score: 1 },
      { value: 'crescimento_pessoal', text: 'Crescimento pessoal', score: 2 },
      { value: 'impacto_outros', text: 'Impacto positivo nos outros', score: 3 },
      { value: 'autonomia_liberdade', text: 'Autonomia e liberdade', score: 4 },
      { value: 'seguranca_estabilidade', text: 'Segurança e estabilidade', score: 5 }
    ]
  }
];

// Scoring and analysis logic
const analyzePersonality = (answers) => {
  const categories = {
    emotional_response: 0,
    stress_management: 0,
    decision_making: 0,
    social_energy: 0,
    goal_setting: 0,
    conflict_resolution: 0,
    learning_style: 0,
    change_adaptation: 0,
    communication_style: 0,
    motivation_source: 0
  };

  // Calculate category scores
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = personalityQuestions.find(q => q.id === parseInt(questionId));
    if (question) {
      const option = question.options.find(opt => opt.value === answer);
      if (option) {
        categories[question.category] += option.score;
      }
    }
  });

  // Determine personality traits
  const traits = [];
  
  // Introversion vs Extraversion
  const socialScore = categories.social_energy;
  if (socialScore <= 2) {
    traits.push({
      name: 'Introversão',
      level: 'Alto',
      description: 'Você recarrega energia em ambientes quietos e reflexivos'
    });
  } else if (socialScore >= 4) {
    traits.push({
      name: 'Extroversão',
      level: 'Alto', 
      description: 'Você ganha energia através de interação social'
    });
  }

  // Analytical vs Intuitive
  const decisionScore = categories.decision_making;
  if (decisionScore <= 2) {
    traits.push({
      name: 'Pensamento Analítico',
      level: 'Alto',
      description: 'Você prefere decisões baseadas em dados e lógica'
    });
  } else if (decisionScore >= 4) {
    traits.push({
      name: 'Intuição',
      level: 'Alto',
      description: 'Você confia em sua intuição e sentimentos'
    });
  }

  // Stress resilience
  const stressScore = categories.stress_management;
  if (stressScore <= 2) {
    traits.push({
      name: 'Resiliência ao Estresse',
      level: 'Alto',
      description: 'Você lida bem com pressão e situações difíceis'
    });
  } else if (stressScore >= 4) {
    traits.push({
      name: 'Sensibilidade ao Estresse',
      level: 'Moderado',
      description: 'Você prefere ambientes mais calmos e previsíveis'
    });
  }

  // Goal orientation
  const goalScore = categories.goal_setting;
  if (goalScore <= 2) {
    traits.push({
      name: 'Orientação a Objetivos',
      level: 'Alto',
      description: 'Você é naturalmente focado e organizado'
    });
  } else if (goalScore >= 4) {
    traits.push({
      name: 'Flexibilidade',
      level: 'Alto',
      description: 'Você prefere manter opções abertas e ser espontâneo'
    });
  }

  // Generate insights and recommendations
  const insights = [
    'Seu estilo de personalidade sugere uma abordagem única para crescimento pessoal.',
    'Conhecer seus padrões pode ajudá-lo a tomar decisões mais alinhadas.',
    'Sua forma de processar emoções influencia como você se relaciona consigo mesmo.'
  ];

  const recommendations = [
    'Considere técnicas de desenvolvimento que se alinhem com seu estilo natural.',
    'Explore práticas de autoconhecimento que respeitem suas preferências.',
    'Use seus pontos fortes como base para construir novos hábitos.'
  ];

  return {
    traits,
    insights,
    recommendations,
    scores: categories,
    overallStyle: determineOverallStyle(categories)
  };
};

const determineOverallStyle = (categories) => {
  // Simplified style determination
  if (categories.social_energy <= 2 && categories.decision_making <= 2) {
    return {
      name: 'Analítico Reflexivo',
      description: 'Você prefere análise profunda e ambientes calmos para tomar decisões.'
    };
  } else if (categories.social_energy >= 4 && categories.motivation_source <= 2) {
    return {
      name: 'Colaborativo Motivado',
      description: 'Você prospera em ambientes sociais e gosta de reconhecimento.'
    };
  } else if (categories.change_adaptation >= 4 && categories.goal_setting >= 3) {
    return {
      name: 'Adaptável Flexível',
      description: 'Você abraça mudanças e prefere manter opções abertas.'
    };
  } else {
    return {
      name: 'Equilibrado Versátil',
      description: 'Você demonstra flexibilidade em diferentes situações e contextos.'
    };
  }
};

module.exports = {
  personalityQuestions,
  analyzePersonality
};