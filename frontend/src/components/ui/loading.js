import React from 'react';
import { Brain, Loader2 } from 'lucide-react';

// Main loading component with brain animation
export const LoadingScreen = ({ message = "Carregando...", showBrain = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        {showBrain ? (
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse mx-auto">
            <Brain className="w-6 h-6 text-white" />
          </div>
        ) : (
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
        )}
        <p className="text-gray-600 font-medium">{message}</p>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};

// Inline loading for components
export const InlineLoading = ({ message = "Carregando...", size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className="flex items-center justify-center space-x-2 p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      <span className="text-gray-600 text-sm">{message}</span>
    </div>
  );
};

// Loading overlay for forms
export const LoadingOverlay = ({ isVisible, message = "Processando..." }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="text-center space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Skeleton loader for cards/content
export const SkeletonLoader = ({ lines = 3, showAvatar = false }) => {
  return (
    <div className="animate-pulse space-y-3">
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-1 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
      )}
      
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
};