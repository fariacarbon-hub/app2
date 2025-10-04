import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import QuizPage from "./pages/QuizPage";
import ChatPage from "./pages/ChatPage";
import PricingPage from "./pages/PricingPage";
import SupportTypesPage from "./pages/SupportTypesPage";
import TherapyTypesPage from "./pages/TherapyTypesPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import GoalsPage from "./pages/GoalsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/conversa" element={<ChatPage />} />
            <Route path="/precos" element={<PricingPage />} />
            <Route path="/tipos-de-apoio" element={<SupportTypesPage />} />
            <Route path="/tipos-de-terapia" element={<TherapyTypesPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contato" element={<ContactPage />} />
            <Route path="/objetivos" element={<GoalsPage />} />
            <Route path="/analiticas" element={<AnalyticsPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;