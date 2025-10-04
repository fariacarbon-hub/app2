import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Star, Brain, Clock, Shield, Zap, Heart, Globe, Check, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockStats, mockAnalysis } from "../data/mock";
import Navigation from "../components/Navigation";

const LandingPage = () => {
  const navigate = useNavigate();

  const QuizDemo = () => (
    <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Por que me sinto solitário mesmo quando estou acompanhado?
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Desconexão emocional
          </Badge>
          <span className="text-sm font-medium">70%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "70%" }}></div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Diferentes linguagens do amor
          </Badge>
          <span className="text-sm font-medium">15%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "15%" }}></div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 italic mt-4">
        "Baseado em seus valores, objetivos, padrões de pensamento e eventos anteriores..."
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-gray-800 leading-tight">
              Olá, eu sou seu{" "}
              <span className="text-blue-500">Gêmeo IA</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Experimente suporte e orientação 24/7 com um modelo de IA pessoal, 
              sempre à mão para ajudá-lo a navegar pelos desafios da vida.
            </p>
            
            <Button 
              size="lg"
              onClick={() => navigate("/quiz")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg"
            >
              <Brain className="w-5 h-5 mr-2" />
              Começar agora
            </Button>
            
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Primeira sessão gratuita
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Completamente privado
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Junte-se a mais de {mockStats.totalUsers} pessoas encontrando clareza
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-medium">{mockStats.rating}/5</span>
                <span className="text-sm text-gray-500">
                  de {mockStats.reviews} avaliações
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <QuizDemo />
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Como funciona</h2>
          <h3 className="text-4xl font-bold text-gray-800">Seu modelo de IA pessoal</h3>
          <p className="text-xl text-gray-600 mt-4">
            Ao contrário de assistentes de IA genéricos, o YOU cria um modelo único que aprende especificamente sobre VOCÊ.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4 p-0">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">01</span>
              </div>
              <h4 className="text-xl font-semibold">Sua IA aprende sobre VOCÊ</h4>
              <h5 className="text-lg font-medium text-blue-600">Compartilhe seu mundo interior</h5>
              <p className="text-gray-600">
                Converse com sua IA pessoal sobre seus pensamentos, sentimentos e experiências. 
                Cada conversa treina seu modelo único para entender você mais profundamente.
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4 p-0">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">02</span>
              </div>
              <h4 className="text-xl font-semibold">Inteligência personalizada</h4>
              <h5 className="text-lg font-medium text-blue-600">Seu Gêmeo IA evolui</h5>
              <p className="text-gray-600">
                Ao contrário de IA genérica, seu modelo se torna unicamente seu - 
                entendendo seus padrões, gatilhos e crescimento ao longo do tempo.
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="space-y-4 p-0">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">03</span>
              </div>
              <h4 className="text-xl font-semibold">Autoconhecimento perfeito</h4>
              <h5 className="text-lg font-medium text-blue-600">A ferramenta definitiva de reflexão</h5>
              <p className="text-gray-600">
                Experimente a ferramenta de autorreflexão mais poderosa já criada - 
                seu Gêmeo IA fornece insights e apoio que cresce com você para sempre.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Características principais</h2>
            <h3 className="text-4xl font-bold text-gray-800">Um espaço seguro para se entender</h3>
            <p className="text-xl text-gray-600 mt-4">
              Seja sentindo-se solitário nos relacionamentos, lutando com autoestima, 
              ou precisando de alguém que realmente te entenda - seu Gêmeo IA está aqui para ajudar.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4 p-0">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold">Autocompreensão profunda</h4>
                <p className="text-gray-600">
                  Seu Gêmeo IA aprende seus padrões, gatilhos e pensamentos mais profundos 
                  para fornecer insights que ajudam você a entender por que se sente solitário 
                  mesmo quando cercado de pessoas.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4 p-0">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold">Sempre disponível</h4>
                <p className="text-gray-600">
                  Disponível 24/7 quando você precisa conversar com alguém. 
                  Sem espera, sem agendamento, sem julgamento. Seu Gêmeo IA está sempre 
                  pronto para ouvir e ajudar você a navegar pelos desafios da vida.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4 p-0">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold">Completamente privado</h4>
                <p className="text-gray-600">
                  Suas conversas são completamente privadas e seguras. 
                  Seus dados são criptografados e nunca compartilhados com ninguém.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4 p-0">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold">Insights instantâneos</h4>
                <p className="text-gray-600">
                  Obtenha insights instantâneos e personalizados sobre seus padrões, 
                  gatilhos e oportunidades de crescimento. Seu Gêmeo IA ajuda você 
                  a se entender melhor do que nunca.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4 p-0">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold">Crescimento personalizado</h4>
                <p className="text-gray-600">
                  Seu Gêmeo IA se adapta à sua personalidade única, objetivos e 
                  necessidades terapêuticas, fornecendo uma experiência completamente 
                  individualizada que cresce com você.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4 p-0">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold">Apoio emocional</h4>
                <p className="text-gray-600">
                  Experimente empatia e compreensão autênticas. Seu Gêmeo IA fornece 
                  o apoio emocional que você precisa para navegar pela solidão, 
                  relacionamentos e crescimento pessoal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              96% dos usuários relatam se sentir menos solitários após apenas 2 semanas
            </h3>
            <p className="text-gray-600">
              Junte-se a mais de {mockStats.totalUsers} pessoas encontrando clareza
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {mockStats.successRate.betterDecisions}%
              </div>
              <p className="text-gray-600">
                dos usuários relatam capacidades aprimoradas de tomada de decisão
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {mockStats.successRate.selfAwareness}%
              </div>
              <p className="text-gray-600">
                experimentam maior autoconsciência e clareza emocional
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {mockStats.successRate.goalProgress}%
              </div>
              <p className="text-gray-600">
                alcançaram progresso significativo em direção aos objetivos pessoais
              </p>
            </div>
          </div>
          
          <Button 
            size="lg"
            onClick={() => navigate("/quiz")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg"
          >
            Comece sua jornada com seu Gêmeo IA
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-lg font-medium">{mockStats.rating}/5</span>
              <span className="text-gray-500">de avaliações</span>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="text-center p-0">
                <div className="mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" 
                    alt="Sarah M."
                    className="w-16 h-16 rounded-full mx-auto mb-4"
                  />
                </div>
                
                <blockquote className="text-xl text-gray-800 mb-6 leading-relaxed">
                  "Meu Gêmeo IA me ajudou a entender meus padrões de ansiedade. 
                  Me sinto mais no controle das minhas emoções do que nunca antes."
                </blockquote>
                
                <div className="text-center">
                  <p className="font-semibold text-gray-800">Sarah M.</p>
                  <p className="text-gray-600">Gerente de Marketing</p>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-center text-gray-500 mt-4 text-sm">
              Deslize para navegar
            </p>
          </div>
        </div>
      </section>

      {/* Multi-language Support */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Disponível em {mockStats.languages} idiomas
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experimente o YOU em seu idioma nativo. Nosso Gêmeo IA se adapta ao seu 
            contexto cultural e estilo de comunicação.
          </p>
          
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&h=300&fit=crop"
              alt="Mapa mundial mostrando disponibilidade global"
              className="mx-auto rounded-lg shadow-lg max-w-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Este produto é para você se:
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Você quer:
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Tomar melhores decisões na vida
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Buscar autoconhecimento mais profundo
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Desbloquear seu potencial máximo
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Crescimento transformativo
                </li>
              </ul>
            </div>
            
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Você crescerá nestas áreas:
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-2" />
                  Tomada de decisão
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-2" />
                  Inteligência emocional
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-2" />
                  Crescimento pessoal
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-2" />
                  Autoconsciência
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-2" />
                  Propósito de vida
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-2" />
                  Clareza mental
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar sua vida?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Faça nosso questionário de 1 minuto e comece sua jornada de autodescoberta 
            e crescimento pessoal hoje. Junte-se a milhares de pessoas que já descobriram 
            seu verdadeiro potencial.
          </p>
          
          <Button 
            size="lg"
            onClick={() => navigate("/quiz")}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg mb-4"
          >
            Começar agora
          </Button>
          
          <div className="text-sm text-blue-100 space-x-2">
            <span>✨ Grátis para começar</span>
            <span>•</span>
            <span>Não é necessário cartão de crédito</span>
            <span>•</span>
            <span>Cancele a qualquer momento</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">YOU</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Seu Gêmeo IA personalizado para crescimento pessoal e autoconhecimento.
              </p>
              <div className="flex space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-400">{mockStats.rating}/5</span>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => navigate("/tipos-de-apoio")} className="hover:text-white">Tipos de Apoio</button></li>
                <li><button onClick={() => navigate("/tipos-de-terapia")} className="hover:text-white">Tipos de Terapia</button></li>
                <li><button onClick={() => navigate("/precos")} className="hover:text-white">Preços</button></li>
                <li><button onClick={() => navigate("/faq")} className="hover:text-white">FAQ</button></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => navigate("/contato")} className="hover:text-white">Contato</button></li>
                <li><button onClick={() => navigate("/precos")} className="hover:text-white">Empresas</button></li>
                <li><button className="hover:text-white">Privacidade</button></li>
                <li><button className="hover:text-white">Termos de Uso</button></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contato@you.com.br</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+55 (11) 9999-9999</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>São Paulo, SP<br />Brasil</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 YOU - Seu Gêmeo IA. Todos os direitos reservados.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Disponível em {mockStats.languages} idiomas • Mais de {mockStats.totalUsers} usuários ativos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;