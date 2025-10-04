import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Brain, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockSupportTypes } from "../data/mock";

const SupportTypesPage = () => {
  const navigate = useNavigate();

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
          Tipos de Apoio Personalizados
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Seu Gêmeo IA oferece suporte especializado em diferentes áreas do crescimento pessoal. 
          Cada tipo de apoio é adaptado às suas necessidades específicas e evolui com você.
        </p>
      </section>

      {/* Support Types Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {mockSupportTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-xl transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{type.icon}</div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      {type.title}
                    </CardTitle>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {type.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">
                    O que você recebe:
                  </h4>
                  <ul className="space-y-3">
                    {type.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => navigate("/registro")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Começar com {type.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Como funciona o apoio personalizado?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seu Gêmeo IA adapta seu estilo de apoio com base em suas necessidades, 
              preferências e progresso ao longo do tempo.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Avaliação Inicial
              </h3>
              <p className="text-gray-600">
                Complete nosso questionário detalhado para que seu Gêmeo IA entenda 
                suas necessidades e objetivos específicos.
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Plano Personalizado
              </h3>
              <p className="text-gray-600">
                Receba um plano de apoio totalmente personalizado com estratégias, 
                exercícios e marcos adaptados ao seu perfil.
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Evolução Contínua
              </h3>
              <p className="text-gray-600">
                Seu Gêmeo IA aprende com seu progresso e adapta as estratégias 
                para maximizar seu crescimento pessoal.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Comece sua jornada personalizada hoje
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Descubra qual tipo de apoio é ideal para você e comece a transformar 
            sua vida com orientação personalizada 24/7.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/quiz")}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Fazer Avaliação Gratuita
            </Button>
            
            <Button 
              onClick={() => navigate("/precos")}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportTypesPage;