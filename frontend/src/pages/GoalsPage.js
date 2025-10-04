import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { 
  Brain, 
  ArrowLeft, 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Circle,
  Edit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockGoals } from "../data/mock";

const GoalsPage = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState(mockGoals);

  const getStatusColor = (status) => {
    switch (status) {
      case "completo": return "bg-green-100 text-green-800";
      case "quase_completo": return "bg-yellow-100 text-yellow-800";
      case "em_progresso": return "bg-blue-100 text-blue-800";
      case "pausado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completo": return "Completo";
      case "quase_completo": return "Quase Completo";
      case "em_progresso": return "Em Progresso";
      case "pausado": return "Pausado";
      default: return "Não Iniciado";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "relacionamentos": return "bg-pink-100 text-pink-800";
      case "saude_mental": return "bg-green-100 text-green-800";
      case "crescimento_pessoal": return "bg-purple-100 text-purple-800";
      case "carreira": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case "relacionamentos": return "Relacionamentos";
      case "saude_mental": return "Saúde Mental";
      case "crescimento_pessoal": return "Crescimento Pessoal";
      case "carreira": return "Carreira";
      default: return "Geral";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
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
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-blue-600">YOU</span>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-800">
                Meus Objetivos
              </h1>
            </div>
            
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Objetivo
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Objetivos</p>
                  <p className="text-2xl font-bold text-gray-800">{goals.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {goals.filter(g => g.status === "em_progresso").length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {goals.filter(g => g.status === "completo").length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Goals List */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-xl font-bold text-gray-800">
                        {goal.title}
                      </CardTitle>
                      <Badge className={getStatusColor(goal.status)}>
                        {getStatusText(goal.status)}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(goal.category)}>
                        {getCategoryText(goal.category)}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{goal.description}</p>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progresso</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {goal.progress}%
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Meta: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      Atualizar Progresso
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 pb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Precisa de ajuda com seus objetivos?
              </h3>
              <p className="text-gray-600 mb-4">
                Converse com seu Gêmeo IA para receber orientação personalizada 
                sobre como alcançar seus objetivos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/conversa")}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Conversar com Gêmeo IA
                </Button>
                
                <Button variant="outline">
                  Criar Plano de Ação
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Motivational Quote */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="text-2xl font-medium mb-4">
            "O sucesso é a soma de pequenos esforços repetidos dia após dia."
          </blockquote>
          <p className="text-lg opacity-90">
            Continue focado em seus objetivos. Cada pequeno passo te leva mais perto do seu sonho.
          </p>
        </div>
      </section>
    </div>
  );
};

export default GoalsPage;