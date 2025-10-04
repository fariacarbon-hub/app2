import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Brain, 
  ArrowLeft, 
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Heart,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockUser, mockMoodHistory, mockAnalysis } from "../data/mock";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const moodData = mockMoodHistory;
  const averageMood = Math.round(moodData.reduce((acc, day) => acc + day.mood, 0) / moodData.length);
  const averageEnergy = Math.round(moodData.reduce((acc, day) => acc + day.energy, 0) / moodData.length);
  const averageStress = Math.round(moodData.reduce((acc, day) => acc + day.stress, 0) / moodData.length);

  const StatCard = ({ icon: Icon, title, value, change, positive, color = "blue" }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-${color}-100 rounded-full`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          {change && (
            <Badge className={positive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {change}%
            </Badge>
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  const MoodChart = () => (
    <div className="space-y-4">
      {moodData.map((day, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="w-20 text-sm text-gray-600">
            {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Humor</span>
              <span className="text-xs font-medium">{day.mood}/10</span>
            </div>
            <Progress value={day.mood * 10} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Energia</span>
              <span className="text-xs font-medium">{day.energy}/10</span>
            </div>
            <Progress value={day.energy * 10} className="h-2 bg-green-100" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Estresse</span>
              <span className="text-xs font-medium">{day.stress}/10</span>
            </div>
            <Progress value={day.stress * 10} className="h-2 bg-red-100" />
          </div>
        </div>
      ))}
    </div>
  );

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
                Análises Detalhadas
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedPeriod === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("week")}
              >
                Semana
              </Button>
              <Button
                variant={selectedPeriod === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("month")}
              >
                Mês
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Overview Stats */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Heart}
            title="Humor Médio"
            value={`${averageMood}/10`}
            change={12}
            positive={true}
            color="pink"
          />
          
          <StatCard
            icon={Zap}
            title="Energia Média"
            value={`${averageEnergy}/10`}
            change={8}
            positive={true}
            color="green"
          />
          
          <StatCard
            icon={Activity}
            title="Nível de Estresse"
            value={`${averageStress}/10`}
            change={15}
            positive={false}
            color="red"
          />
          
          <StatCard
            icon={Target}
            title="Progresso Geral"
            value={`${mockUser.growthScore}%`}
            change={5}
            positive={true}
            color="blue"
          />
        </div>
      </section>

      {/* Detailed Analytics */}
      <section className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="mood" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mood">Humor & Energia</TabsTrigger>
            <TabsTrigger value="growth">Crescimento</TabsTrigger>
            <TabsTrigger value="patterns">Padrões</TabsTrigger>
            <TabsTrigger value="insights">Insights IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mood" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <span>Histórico de Humor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MoodChart />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-purple-500" />
                    <span>Distribuição Emocional</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Momentos Positivos</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Momentos Neutros</span>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                    <Progress value={22} className="h-2 bg-yellow-100" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Momentos Desafiadores</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <Progress value={10} className="h-2 bg-red-100" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="growth" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Áreas de Crescimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockAnalysis.growthAreas.map((area, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-800">{area.area}</span>
                        <span className="text-sm font-bold text-blue-600">{area.progress}%</span>
                      </div>
                      <Progress value={area.progress} className="mb-2" />
                      <div className="text-xs text-gray-600">
                        Recomendações: {area.recommendations.join(", ")}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Progresso Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">Sessões Concluídas</p>
                        <p className="text-2xl font-bold text-green-600">7</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">Insights Gerados</p>
                        <p className="text-2xl font-bold text-blue-600">15</p>
                      </div>
                      <Brain className="w-8 h-8 text-blue-500" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-800">Objetivos Atualizados</p>
                        <p className="text-2xl font-bold text-purple-600">3</p>
                      </div>
                      <Target className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Padrões Identificados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h5 className="font-medium text-gray-800">Padrão de Produtividade</h5>
                  <p className="text-sm text-gray-600">
                    Você tende a ser mais produtivo nas terças e quartas-feiras, 
                    com picos de energia entre 9h e 11h.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h5 className="font-medium text-gray-800">Gatilhos de Bem-estar</h5>
                  <p className="text-sm text-gray-600">
                    Exercícios matinais e conversas com amigos melhoram consistentemente 
                    seu humor em 23% em média.
                  </p>
                </div>
                
                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <h5 className="font-medium text-gray-800">Sinais de Alerta</h5>
                  <p className="text-sm text-gray-600">
                    Reuniões longas e prazos apertados tendem a aumentar seu nível 
                    de estresse. Considere técnicas de respiração preventivas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  <span>Insights Personalizados do Gêmeo IA</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2">Recomendação Semanal</h5>
                  <p className="text-blue-700">
                    Com base em seus padrões, sugiro implementar uma rotina de mindfulness 
                    de 5 minutos antes das reuniões para reduzir o estresse preventivamente.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-800 mb-2">Celebração</h5>
                  <p className="text-green-700">
                    Parabéns! Você manteve uma sequência de 7 dias de check-ins emocionais. 
                    Isso demonstra um compromisso admirável com seu crescimento pessoal.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-purple-800 mb-2">Oportunidade de Crescimento</h5>
                  <p className="text-purple-700">
                    Notei que você tem se comunicado de forma mais assertiva. 
                    Que tal explorarmos técnicas de liderança empática na próxima conversa?
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default AnalyticsPage;