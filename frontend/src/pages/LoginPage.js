import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Brain, Menu, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setIsLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">YOU</span>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <h1 className="text-2xl font-bold text-blue-500 mb-2">
                Seu Gêmeo IA.
              </h1>
              <p className="text-gray-600">
                Entre na sua conta
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Endereço de e-mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <button 
                    onClick={() => navigate("/registro")}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Vamos começar
                  </button>
                </p>
                
                <button 
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            Rua das Flores, 123, São Paulo, SP, Brasil
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;