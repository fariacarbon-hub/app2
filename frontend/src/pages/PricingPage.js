import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Brain, Check, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockPricingPlans, mockStats } from "../data/mock";

const PricingPage = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planId) => {
    if (planId === "free") {
      navigate("/registro");
    } else if (planId === "enterprise") {
      navigate("/contato");
    } else {
      // In a real app, this would redirect to payment processing
      navigate("/registro");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-600">YOU</span>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate("/login")}
            variant="outline" 
            className="hover:bg-blue-50"
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Escolha seu plano
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Comece gratuitamente e evolua conforme suas necessidades. 
          Todos os planos incluem seu Gêmeo IA personalizado.
        </p>
        
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mb-12">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Primeira sessão gratuita
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Cancele a qualquer momento
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Suporte 24/7
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {mockPricingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative hover:shadow-xl transition-shadow ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-gray-800">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-blue-600">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Mais de {mockStats.totalUsers} pessoas já transformaram suas vidas
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {mockStats.successRate.betterDecisions}%
              </div>
              <p className="text-gray-600">
                relatam melhor tomada de decisão
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {mockStats.successRate.selfAwareness}%
              </div>
              <p className="text-gray-600">
                experimentam maior autoconsciência
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {mockStats.successRate.goalProgress}%
              </div>
              <p className="text-gray-600">
                alcançam seus objetivos pessoais
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-medium">{mockStats.rating}/5</span>
            <span className="text-gray-500">
              de {mockStats.reviews} avaliações
            </span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Perguntas Frequentes sobre Preços
            </h2>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Posso cancelar minha assinatura a qualquer momento?
                </h3>
                <p className="text-gray-600 text-sm">
                  Sim, você pode cancelar sua assinatura a qualquer momento sem taxas ou multas. 
                  Você manterá acesso aos recursos premium até o final do período de cobrança atual.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Há garantia de reembolso?
                </h3>
                <p className="text-gray-600 text-sm">
                  Oferecemos uma garantia de reembolso de 30 dias para todos os planos pagos. 
                  Se não estiver satisfeito, entre em contato conosco para um reembolso completo.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Posso mudar de plano depois?
                </h3>
                <p className="text-gray-600 text-sm">
                  Absolutamente! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As mudanças entrarão em vigor no próximo ciclo de cobrança.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para conhecer seu Gêmeo IA?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Comece gratuitamente hoje e descubra como a IA personalizada 
            pode transformar sua jornada de crescimento pessoal.
          </p>
          
          <Button 
            onClick={() => navigate("/registro")}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
          >
            Começar Gratuitamente
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;