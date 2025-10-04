import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { Brain, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { quizAPI } from "../services/api";
import { mockQuizQuestions } from "../data/mock";

const QuizPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading, refreshAuth } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentQuestion + 1) / mockQuizQuestions.length) * 100;

  const handleAnswer = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNext = () => {
    const question = mockQuizQuestions[currentQuestion];
    
    if (!answers[question.id]) {
      toast({
        title: "Resposta necessária",
        description: "Por favor, responda à pergunta antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion < mockQuizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleCompleteQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleCompleteQuiz = async () => {
    setIsSubmitting(true);
    setIsCompleted(true);
    
    try {
      // Store quiz results locally as backup
      localStorage.setItem("quizResults", JSON.stringify(answers));
      
      // Only submit to backend if user is authenticated
      if (isAuthenticated && user) {
        const quizData = {
          quizType: 'personalidade',
          answers: answers,
          completedAt: new Date().toISOString(),
          completionTime: Date.now() - performance.now() // rough completion time
        };
        
        // Submit quiz results to backend
        await quizAPI.submitQuiz(quizData);
        console.log('Quiz submitted to backend successfully');
      } else {
        console.log('User not authenticated, skipping backend submission');
      }
      
      setTimeout(() => {
        toast({
          title: "Quiz concluído!",
          description: "Suas respostas foram analisadas. Redirecionando para seu painel.",
        });
        
        setTimeout(async () => {
          // Check if user is still authenticated
          const authValid = isAuthenticated && user;
          
          if (authValid) {
            // Double-check auth before redirecting to dashboard
            const refreshed = await refreshAuth();
            if (refreshed) {
              navigate("/dashboard");
            } else {
              // Auth expired during quiz, redirect to register with special message
              navigate("/registro", { 
                state: { 
                  message: "Sua sessão expirou. Crie uma conta para salvar seus resultados!",
                  quizCompleted: true 
                } 
              });
            }
          } else {
            // User completed quiz but is not logged in - redirect to register
            navigate("/registro", { 
              state: { 
                message: "Crie sua conta para ver seus resultados personalizados!",
                quizCompleted: true 
              } 
            });
          }
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      // Even if backend submission fails, still complete the quiz
      setTimeout(() => {
        toast({
          title: "Quiz concluído!",
          description: "Redirecionando para seu painel...",
        });
        
        setTimeout(async () => {
          // Check if user is still authenticated
          const authValid = isAuthenticated && user;
          
          if (authValid) {
            // Double-check auth before redirecting to dashboard
            const refreshed = await refreshAuth();
            if (refreshed) {
              navigate("/dashboard");
            } else {
              // Auth expired during quiz, redirect to register with special message
              navigate("/registro", { 
                state: { 
                  message: "Sua sessão expirou. Crie uma conta para salvar seus resultados!",
                  quizCompleted: true 
                } 
              });
            }
          } else {
            // User completed quiz but is not logged in - redirect to register
            navigate("/registro", { 
              state: { 
                message: "Crie sua conta para ver seus resultados personalizados!",
                quizCompleted: true 
              } 
            });
          }
        }, 2000);
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    const question = mockQuizQuestions[currentQuestion];
    
    switch (question.type) {
      case "scale":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {question.question}
            </h2>
            
            <div className="space-y-3">
              {question.options.map((option) => (
                <label 
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.value}
                    onChange={(e) => handleAnswer(question.id, parseInt(e.target.value))}
                    className="text-blue-500"
                  />
                  <span className="flex-1">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case "multiple":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {question.question}
            </h2>
            
            <div className="grid gap-3">
              {question.options.map((option) => (
                <label 
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    onChange={(e) => {
                      const currentAnswers = answers[question.id] || [];
                      if (e.target.checked) {
                        handleAnswer(question.id, [...currentAnswers, option.value]);
                      } else {
                        handleAnswer(question.id, currentAnswers.filter(a => a !== option.value));
                      }
                    }}
                    className="text-blue-500"
                  />
                  <span className="flex-1">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      case "text":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibent text-gray-800 mb-6">
              {question.question}
            </h2>
            
            <Textarea
              placeholder={question.placeholder}
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="min-h-32 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        );
        
      case "single":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {question.question}
            </h2>
            
            <div className="space-y-3">
              {question.options.map((option) => (
                <label 
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.value}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    className="text-blue-500"
                  />
                  <span className="flex-1">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="text-center p-8 space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800">
              Analisando suas respostas...
            </h2>
            
            <p className="text-gray-600">
              Estamos criando seu perfil personalizado do Gêmeo IA com base em suas respostas. 
              Isso levará apenas alguns segundos.
            </p>
            
            <div className="space-y-2">
              <Progress value={85} className="w-full" />
              <p className="text-sm text-gray-500">85% concluído</p>
            </div>
            
            <div className="text-sm text-blue-600">
              Preparando seu painel personalizado...
            </div>
          </CardContent>
        </Card>
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
          
          <div className="text-sm text-gray-600">
            Pergunta {currentQuestion + 1} de {mockQuizQuestions.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-blue-600">
                  Questionário de Personalidade
                </h1>
                <p className="text-gray-600">
                  Estas perguntas nos ajudam a entender você melhor e criar seu Gêmeo IA personalizado.
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {renderQuestion()}
              
              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  disabled={currentQuestion === 0}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                >
                  <span>
                    {isSubmitting ? "Enviando..." : (currentQuestion === mockQuizQuestions.length - 1 ? "Finalizar" : "Próximo")}
                  </span>
                  {currentQuestion !== mockQuizQuestions.length - 1 && !isSubmitting && (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;