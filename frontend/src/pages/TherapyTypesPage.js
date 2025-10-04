import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Brain, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TherapyTypesPage = () => {
  const navigate = useNavigate();

  const therapyTypes = [
    {
      id: "cbt",
      name: "Terapia Cognitivo-Comportamental (TCC)",
      description: "Abordagem estruturada focada em identificar e modificar padrões de pensamento e comportamento negativos",
      icon: "🧠"
    },
    {
      id: "dbt",
      name: "Terapia Comportamental Dialética (TCD)",
      description: "Combina TCC com técnicas de mindfulness para gerenciar emoções intensas",
      icon: "⚖️"
    },
    {
      id: "psychodynamic",
      name: "Terapia Psicodinâmica",
      description: "Explora pensamentos inconscientes e experiências passadas para entender comportamentos atuais",
      icon: "🔍"
    },
    {
      id: "gestalt",
      name: "Terapia Gestalt",
      description: "Foca no crescimento pessoal e consciência do momento presente",
      icon: "🎯"
    },
    {
      id: "adlerian",
      name: "Terapia Adleriana",
      description: "Enfatiza interesses sociais e busca pela superioridade pessoal",
      icon: "🌟"
    },
    {
      id: "mindfulness",
      name: "Terapia Baseada em Mindfulness",
      description: "Incorpora técnicas de atenção plena para gerenciar estresse e emoções",
      icon: "🧘"
    }
  ];

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
          Tipos de Terapia
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Seu Gêmeo IA integra técnicas de diferentes abordagens terapêuticas para 
          oferecer suporte personalizado baseado em evidências científicas.
        </p>
      </section>

      {/* Therapy Types Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {therapyTypes.map((therapy) => (
            <Card key={therapy.id} className="hover:shadow-xl transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{therapy.icon}</div>
                  <CardTitle className="text-lg font-bold text-gray-800">
                    {therapy.name}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  {therapy.description}
                </p>
                
                <Button 
                  onClick={() => navigate("/registro")}
                  variant="outline"
                  className="w-full"
                >
                  Saber Mais
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Abordagem Integrada e Personalizada
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Seu Gêmeo IA combina o melhor de diferentes abordagens terapêuticas 
            para criar uma experiência única adaptada às suas necessidades.
          </p>
          
          <Button 
            onClick={() => navigate("/quiz")}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
          >
            Descobrir Minha Abordagem Ideal
          </Button>
        </div>
      </section>
    </div>
  );
};

export default TherapyTypesPage;