import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Brain, ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";

const ContactPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock form submission
    toast({
      title: "Mensagem enviada com sucesso!",
      description: "Nossa equipe entrará em contato em até 24 horas.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
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
          Entre em Contato Conosco
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Estamos aqui para ajudar você a começar sua jornada de crescimento pessoal. 
          Entre em contato para dúvidas, suporte ou feedback.
        </p>
      </section>

      {/* Contact Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Envie uma Mensagem
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Como podemos ajudar?"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Conte-nos mais sobre sua dúvida ou necessidade..."
                    required
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 min-h-32"
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-6">
              <CardTitle className="text-xl font-bold text-gray-800 mb-6">
                Informações de Contato
              </CardTitle>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">E-mail</h3>
                    <p className="text-gray-600">contato@you.com.br</p>
                    <p className="text-sm text-gray-500">Resposta em até 24 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Suporte</h3>
                    <p className="text-gray-600">+55 (11) 9999-9999</p>
                    <p className="text-sm text-gray-500">Seg-Sex, 9h às 18h</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Endereço</h3>
                    <p className="text-gray-600">
                      Rua das Flores, 123<br />
                      São Paulo, SP<br />
                      CEP: 01234-567<br />
                      Brasil
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* FAQ Quick Link */}
            <Card className="p-6">
              <CardTitle className="text-xl font-bold text-gray-800 mb-4">
                Perguntas Frequentes
              </CardTitle>
              <p className="text-gray-600 mb-4">
                Antes de entrar em contato, confira se sua dúvida já foi respondida 
                em nossa seção de perguntas frequentes.
              </p>
              <Button 
                onClick={() => navigate("/faq")}
                variant="outline"
                className="w-full"
              >
                Ver FAQ
              </Button>
            </Card>

            {/* Enterprise Contact */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardTitle className="text-xl font-bold text-gray-800 mb-4">
                Soluções Empresariais
              </CardTitle>
              <p className="text-gray-600 mb-4">
                Interessado em implementar o YOU na sua empresa? 
                Entre em contato para saber mais sobre nossas soluções corporativas.
              </p>
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                Contato Empresarial
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Não precisa esperar nossa resposta. Comece sua jornada de crescimento 
            pessoal agora mesmo com uma sessão gratuita.
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

export default ContactPage;