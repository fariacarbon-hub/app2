import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';

// Error fallback component
export const ErrorFallback = ({ error, resetError, message }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Ops! Algo deu errado</h2>
          <p className="text-gray-600">
            {message || "Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver isso."}
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left bg-gray-50 rounded-lg p-4 text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Detalhes técnicos (desenvolvimento)
            </summary>
            <pre className="text-red-600 whitespace-pre-wrap overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={resetError}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Inline error component
export const InlineError = ({ 
  error, 
  message, 
  onRetry, 
  showRetry = true,
  variant = "default" 
}) => {
  const variantClasses = {
    default: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  return (
    <div className={`rounded-lg border p-4 ${variantClasses[variant]}`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="font-medium">
            {message || "Ocorreu um erro"}
          </p>
          
          {error?.message && (
            <p className="text-sm opacity-80">
              {error.message}
            </p>
          )}
          
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="mt-2 border-current text-current hover:bg-current hover:text-white"
            >
              Tentar Novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Network error component
export const NetworkError = ({ onRetry }) => {
  return (
    <InlineError
      message="Problema de conexão"
      error={{ message: "Verifique sua conexão com a internet e tente novamente." }}
      onRetry={onRetry}
      variant="warning"
    />
  );
};