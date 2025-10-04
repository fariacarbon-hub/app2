import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Brain, 
  ArrowLeft, 
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Download,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { mockUser, mockLanguages } from "../data/mock";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(mockUser);
  const [settings, setSettings] = useState({
    notifications: {
      dailyReminder: true,
      weeklyReport: true,
      goalUpdates: true,
      emailNotifications: false
    },
    privacy: {
      shareProgress: false,
      anonymousAnalytics: true,
      dataCollection: true
    },
    preferences: {
      language: "pt-BR",
      theme: "light",
      timezone: "America/Sao_Paulo"
    }
  });

  const handleSave = (section) => {
    toast({
      title: "Configurações salvas!",
      description: `Suas configurações de ${section} foram atualizadas.`,
    });
  };

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
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
                Configurações
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span>Informações do Perfil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Sobre você (opcional)</Label>
                  <Input
                    id="bio"
                    placeholder="Conte um pouco sobre você e seus objetivos..."
                    className="bg-white"
                  />
                </div>
                
                <Button 
                  onClick={() => handleSave("perfil")}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  <span>Configurações de Notificação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lembrete diário</p>
                      <p className="text-sm text-gray-600">Receba uma notificação para conversar com seu Gêmeo IA</p>
                    </div>
                    <Switch
                      checked={settings.notifications.dailyReminder}
                      onCheckedChange={(checked) => handleNotificationChange("dailyReminder", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Relatório semanal</p>
                      <p className="text-sm text-gray-600">Resumo semanal do seu progresso e insights</p>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyReport}
                      onCheckedChange={(checked) => handleNotificationChange("weeklyReport", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Atualizações de objetivos</p>
                      <p className="text-sm text-gray-600">Notificações sobre marcos e conquistas</p>
                    </div>
                    <Switch
                      checked={settings.notifications.goalUpdates}
                      onCheckedChange={(checked) => handleNotificationChange("goalUpdates", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificações por e-mail</p>
                      <p className="text-sm text-gray-600">Receber notificações também no e-mail</p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSave("notificações")}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Privacy */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Privacidade e Segurança</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compartilhar progresso</p>
                      <p className="text-sm text-gray-600">Permitir que outros usuários vejam seu progresso</p>
                    </div>
                    <Switch
                      checked={settings.privacy.shareProgress}
                      onCheckedChange={(checked) => handlePrivacyChange("shareProgress", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics anônimos</p>
                      <p className="text-sm text-gray-600">Ajudar a melhorar o produto com dados anônimos</p>
                    </div>
                    <Switch
                      checked={settings.privacy.anonymousAnalytics}
                      onCheckedChange={(checked) => handlePrivacyChange("anonymousAnalytics", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Coleta de dados</p>
                      <p className="text-sm text-gray-600">Permitir coleta de dados para personalização</p>
                    </div>
                    <Switch
                      checked={settings.privacy.dataCollection}
                      onCheckedChange={(checked) => handlePrivacyChange("dataCollection", checked)}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar Meus Dados</span>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="text-red-600 hover:text-red-700 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Deletar Conta</span>
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSave("privacidade")}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <span>Preferências do Aplicativo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) => handlePreferenceChange("language", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockLanguages.slice(0, 5).map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <Select
                      value={settings.preferences.theme}
                      onValueChange={(value) => handlePreferenceChange("theme", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="auto">Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => handlePreferenceChange("timezone", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={() => handleSave("preferências")}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subscription */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  <span>Assinatura e Faturamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-800">Plano Atual: {user.currentPlan}</p>
                      <p className="text-sm text-blue-600">Renovação automática em 31/12/2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">R$ 49,90</p>
                      <p className="text-sm text-blue-600">por mês</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={() => navigate("/precos")}
                    variant="outline"
                    className="w-full"
                  >
                    Alterar Plano
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                  >
                    Ver Histórico de Faturas
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    Cancelar Assinatura
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-800 mb-2">Próxima cobrança</h4>
                  <p className="text-sm text-gray-600">
                    Sua próxima cobrança de R$ 49,90 será processada em 31/01/2024
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;