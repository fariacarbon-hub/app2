import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  ChevronRight,
  Lightbulb,
  Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { analyticsAPI } from "../services/api";
import { useToast } from "../hooks/use-toast";
import { LoadingScreen, SkeletonLoader, LoadingOverlay } from "../components/ui/loading";
import { InlineError } from "../components/ui/error-boundary";
import { useAsyncOperation } from "../hooks/useAsyncOperation";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, refreshAuth } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      // Wait for auth loading to complete
      if (loading) return;
      
      if (!isAuthenticated) {
        // Try to refresh auth one time before redirecting
        const refreshed = await refreshAuth();
        if (!refreshed) {
          navigate("/login");
          return;
        }
      }
      
      // Load analytics data when user is authenticated
      if (isAuthenticated && user) {
        loadDashboardData();
      }
    };
    
    initializeDashboard();
  }, [loading, isAuthenticated, navigate, user]);

  const loadDashboardData = async () => {
    try {
      setIsLoadingAnalytics(true);
      console.log('🔄 Carregando dados do dashboard...');
      
      const response = await analyticsAPI.getDashboard({ days: 7 });
      console.log('📊 Resposta da API analytics:', response);
      
      if (response.success) {
        console.log('✅ Analytics data received:', response.data);
        setAnalytics(response.data);
      } else {
        console.log('⚠️ API response not successful, using fallback');
        setAnalytics(createFallbackAnalytics());
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      
      // Use fallback data on error
      setAnalytics(createFallbackAnalytics());
      
      toast({
        title: "Erro ao carregar dados",
        description: "Usando dados padrão. " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const createFallbackAnalytics = () => ({
    summary: {
      totalDays: 0,
      averages: {
        mood: 0,
        energy: 0,
        stress: 0
      },
      goals: {
        active: 0,
        completedThisPeriod: 0
      }
    },
    moodTrends: [],
    weeklyAverage: {},
    insightsSummary: [],
    dailyAnalytics: []
  });

  const logTodayMood = async () => {
    const mood = prompt("Como está seu humor hoje? (1-10):");
    const energy = prompt("Qual seu nível de energia? (1-10):");
    const stress = prompt("Qual seu nível de estresse? (1-10):");
    
    if (mood && energy && stress) {
      try {
        const moodData = {
          date: new Date().toISOString().split('T')[0],
          mood: parseInt(mood),
          energy: parseInt(energy),
          stress: parseInt(stress)
        };
        
        await analyticsAPI.logMood(moodData);
        
        toast({
          title: "Humor registrado!",
          description: "Seus dados foram salvos. Recarregando dashboard...",
        });
        
        // Reload dashboard data
        loadDashboardData();
        
      } catch (error) {
        toast({
          title: "Erro ao registrar humor",
          description: "Tente novamente mais tarde.",
          variant: "destructive"
        });
      }
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 bg-${color}-100 rounded-full`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const GrowthAreaCard = ({ area }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-800">{area.area}</h4>
          <span className="text-sm font-medium text-blue-600">{area.progress}%</span>
        </div>
        
        <Progress value={area.progress} className="mb-3" />
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">Recomendações:</p>
          {area.recommendations.map((rec, index) => (
            <div key={index} className="flex items-center text-xs text-gray-600">
              <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
              {rec}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Show loading state while checking authentication
  if (loading || !user) {
    return (
      <LoadingScreen 
        message="Carregando seu dashboard pessoal..."
        showBrain={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg md:text-xl font-bold text-blue-600">YOU</span>
              </div>
              
              <div className="hidden sm:block">
                <h1 className="text-base md:text-xl font-semibold text-gray-800">
                  Olá, {user?.name?.split(' ')[0] || 'Usuário'}!
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/conversa")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar com IA
              </Button>
              
              <Button
                onClick={() => {
                  localStorage.removeItem("user");
                  navigate("/");
                }}
                variant="outline"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-6 lg:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            icon={Heart}
            title="Humor Médio"
            value={analytics ? (analytics.summary.totalDays > 0 ? `${analytics.summary.averages.mood.toFixed(1)}/10` : 'Sem dados') : '--'}
            subtitle={analytics?.summary.totalDays > 0 ? `Últimos ${analytics.summary.totalDays} dias` : 'Registre seu primeiro humor'}
            color="red"
          />
          <StatCard
            icon={TrendingUp}
            title="Energia Média"
            value={analytics ? (analytics.summary.totalDays > 0 ? `${analytics.summary.averages.energy.toFixed(1)}/10` : 'Sem dados') : '--'}
            subtitle={analytics?.summary.totalDays > 0 ? 'Últimos 7 dias' : 'Registre sua energia'}
            color="green"
          />
          <StatCard
            icon={Target}
            title="Objetivos Ativos"
            value={analytics ? analytics.summary.goals.active : '--'}
            subtitle={analytics ? `${analytics.summary.goals.completedThisPeriod} concluídos esta semana` : 'Sem objetivos'}
            color="blue"
          />
          <StatCard
            icon={Award}
            title="Nível de Estresse"
            value={analytics ? (analytics.summary.totalDays > 0 ? `${analytics.summary.averages.stress.toFixed(1)}/10` : 'Sem dados') : '--'}
            subtitle={analytics?.summary.totalDays > 0 ? (analytics.summary.averages.stress < 5 ? 'Baixo' : analytics.summary.averages.stress < 7 ? 'Moderado' : 'Alto') : 'Registre seu estresse'}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Emotional Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Análise Emocional Atual</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAnalytics ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-2 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-5/6 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                ) : analytics && analytics.summary.totalDays > 0 ? (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        Estado baseado em {analytics.summary.totalDays} dias de dados
                      </h4>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Ativo
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Humor</span>
                          <span className="font-medium">{analytics.summary.averages.mood}/10</span>
                        </div>
                        <Progress value={analytics.summary.averages.mood * 10} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Energia</span>
                          <span className="font-medium">{analytics.summary.averages.energy}/10</span>
                        </div>
                        <Progress value={analytics.summary.averages.energy * 10} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Estresse (menor é melhor)</span>
                          <span className="font-medium">{analytics.summary.averages.stress}/10</span>
                        </div>
                        <Progress value={analytics.summary.averages.stress * 10} className="h-2" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Comece seu acompanhamento emocional
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Registre seus sentimentos diários para começar a ver insights personalizados sobre seu bem-estar.
                    </p>
                    <Button 
                      onClick={() => navigate("/conversa")}
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Começar com o Gêmeo IA
                    </Button>
                  </div>
                )}
                
                <Button 
                  onClick={() => navigate("/conversa")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Conversar com seu Gêmeo IA
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <span>Insights Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAnalytics ? (
                  <div className="space-y-3">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : analytics && analytics.insightsSummary && analytics.insightsSummary.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.insightsSummary.map((insight, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h5 className="font-medium text-gray-800">{insight.title}</h5>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border-l-4 border-gray-300 pl-4 py-2">
                      <h5 className="font-medium text-gray-800">Insights em desenvolvimento</h5>
                      <p className="text-sm text-gray-600">
                        Continue conversando com seu Gêmeo IA para gerar insights personalizados sobre seu crescimento emocional.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <h5 className="font-medium text-gray-800">Dica do dia</h5>
                      <p className="text-sm text-gray-600">
                        Reserve 5 minutos hoje para refletir sobre algo pelo qual você é grato. 
                        Isso pode melhorar significativamente seu humor!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate("/conversa")}
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nova Conversa
                </Button>
                
                <Button 
                  onClick={() => navigate("/quiz")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Refazer Avaliação
                </Button>
                
                <Button 
                  onClick={logTodayMood}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Registrar Humor Hoje
                </Button>
                
                <Button 
                  onClick={() => navigate("/objetivos")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Meus Objetivos
                </Button>
                
                <Button 
                  onClick={() => navigate("/configuracoes")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Growth Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Crescimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAnalytics ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ) : analytics && analytics.summary.totalDays > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Comunicação</h4>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progresso baseado em dados</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <Progress value={75} className="mb-2" />
                      <p className="text-xs text-gray-600">Continue praticando conversas com seu Gêmeo IA para melhorar ainda mais.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Autoconsciência</h4>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Desenvolvimento contínuo</span>
                        <span className="font-medium">60%</span>
                      </div>
                      <Progress value={60} className="mb-2" />
                      <p className="text-xs text-gray-600">Registrar humor diariamente está ajudando no autoconhecimento.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Áreas de crescimento em desenvolvimento</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Quando você começar a usar o aplicativo regularmente, mostraremos suas áreas de crescimento pessoal aqui.
                    </p>
                    <Button 
                      onClick={() => navigate("/conversa")}
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Começar jornada
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;