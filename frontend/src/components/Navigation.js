import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Brain, Menu, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);

  const supportTypes = [
    { name: "Clareza Mental", path: "/tipos-de-apoio" },
    { name: "Prática de Mindfulness", path: "/tipos-de-apoio" },
    { name: "Crescimento Pessoal", path: "/tipos-de-apoio" },
    { name: "Inteligência Emocional", path: "/tipos-de-apoio" }
  ];

  const therapyTypes = [
    { name: "Terapia Cognitivo-Comportamental", path: "/tipos-de-terapia" },
    { name: "Terapia Comportamental Dialética", path: "/tipos-de-terapia" },
    { name: "Terapia Psicodinâmica", path: "/tipos-de-terapia" },
    { name: "Terapia Gestalt", path: "/tipos-de-terapia" },
    { name: "Terapia Adleriana", path: "/tipos-de-terapia" },
    { name: "Terapia Baseada em Mindfulness", path: "/tipos-de-terapia" }
  ];

  const challenges = [
    { name: "Solidão e Isolamento", path: "/faq" },
    { name: "Ansiedade e Estresse", path: "/faq" },
    { name: "Problemas de Relacionamento", path: "/faq" },
    { name: "Baixa Autoestima", path: "/faq" }
  ];

  const enterprise = [
    { name: "Soluções Corporativas", path: "/precos" },
    { name: "Bem-estar de Equipes", path: "/precos" },
    { name: "Preços Empresariais", path: "/precos" },
    { name: "Contatar Vendas", path: "/contato" }
  ];

  const DropdownMenu = ({ title, items, dropdownKey }) => (
    <div 
      className="group relative"
      onMouseEnter={() => setHoveredDropdown(dropdownKey)}
      onMouseLeave={() => setHoveredDropdown(null)}
    >
      <button className="text-gray-600 hover:text-gray-800 px-3 py-2 flex items-center space-x-1">
        <span>{title}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {hoveredDropdown === dropdownKey && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
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
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <DropdownMenu 
            title="Tipos de Apoio" 
            items={supportTypes} 
            dropdownKey="support"
          />
          <DropdownMenu 
            title="Tipos de Terapia" 
            items={therapyTypes} 
            dropdownKey="therapy"
          />
          <DropdownMenu 
            title="Desafios Comuns" 
            items={challenges} 
            dropdownKey="challenges"
          />
          <DropdownMenu 
            title="Empresas" 
            items={enterprise} 
            dropdownKey="enterprise"
          />
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            🇧🇷 Português (BR)
          </Badge>
        </nav>
        
        {/* Desktop Login Button */}
        <Button 
          onClick={() => navigate("/login")}
          variant="outline" 
          className="hover:bg-blue-50 hidden md:flex"
        >
          Entrar
        </Button>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <button 
              onClick={() => navigate("/tipos-de-apoio")}
              className="block w-full text-left text-gray-600 hover:text-gray-800 py-2"
            >
              Tipos de Apoio
            </button>
            <button 
              onClick={() => navigate("/tipos-de-terapia")}
              className="block w-full text-left text-gray-600 hover:text-gray-800 py-2"
            >
              Tipos de Terapia
            </button>
            <button 
              onClick={() => navigate("/faq")}
              className="block w-full text-left text-gray-600 hover:text-gray-800 py-2"
            >
              Desafios Comuns
            </button>
            <button 
              onClick={() => navigate("/precos")}
              className="block w-full text-left text-gray-600 hover:text-gray-800 py-2"
            >
              Empresas
            </button>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4"
            >
              Entrar
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;