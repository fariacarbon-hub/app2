import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Brain, ArrowLeft, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockFAQ } from "../data/mock";

const FAQPage = () => {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const filteredFAQ = mockFAQ.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Perguntas Frequentes
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Encontre respostas para as perguntas mais comuns sobre o YOU e seu Gêmeo IA personalizado.
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Buscar perguntas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-blue-500"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFAQ.map((faq) => (
            <Card key={faq.id} className="hover:shadow-md transition-shadow">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleFAQ(faq.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-800 text-left">
                    {faq.question}
                  </CardTitle>
                  {openFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
              
              {openFAQ === faq.id && (
                <CardContent className="pt-0">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
          
          {filteredFAQ.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhuma pergunta encontrada para "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Additional Help */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Nossa equipe de suporte está sempre pronta para ajudar você a começar 
            sua jornada com o YOU.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/contato")}
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg"
            >
              Entrar em Contato
            </Button>
            
            <Button 
              onClick={() => navigate("/conversa")}
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg"
            >
              Conversar com IA
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Tópicos Populares
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-800 mb-2">
                Como começar?
              </h3>
              <p className="text-gray-600 text-sm">
                Guia passo a passo para criar sua conta e configurar seu Gêmeo IA
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-800 mb-2">
                Segurança e Privacidade
              </h3>
              <p className="text-gray-600 text-sm">
                Como protegemos seus dados pessoais e conversas
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-800 mb-2">
                Planos e Preços
              </h3>
              <p className="text-gray-600 text-sm">
                Informações detalhadas sobre nossos planos de assinatura
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-800 mb-2">
                Funcionalidades Premium
              </h3>
              <p className="text-gray-600 text-sm">
                Descubra todos os recursos avançados disponíveis
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-800 mb-2">
                Suporte Técnico
              </h3>
              <p className="text-gray-600 text-sm">
                Resolvendo problemas técnicos e de conectividade
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-800 mb-2">
                Cancelamentos
              </h3>
              <p className="text-gray-600 text-sm">
                Como cancelar ou pausar sua assinatura
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;