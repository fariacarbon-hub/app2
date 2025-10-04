import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

/**
 * Hook para gerenciar operações assíncronas com loading, error e success states
 */
export const useAsyncOperation = (options = {}) => {
  const { 
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = "Operação realizada com sucesso",
    defaultErrorMessage = "Ocorreu um erro inesperado"
  } = options;
  
  const { toast } = useToast();
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null
  });

  const execute = useCallback(async (asyncFunction, customOptions = {}) => {
    const { 
      loadingMessage,
      successMessage: customSuccessMessage,
      errorMessage: customErrorMessage,
      onSuccess,
      onError
    } = customOptions;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));

    try {
      const result = await asyncFunction();
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        data: result,
        error: null
      }));

      // Show success toast
      if (showSuccessToast && (customSuccessMessage || successMessage)) {
        toast({
          title: "Sucesso!",
          description: customSuccessMessage || successMessage,
        });
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      console.error('Async operation error:', error);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error
      }));

      // Show error toast
      if (showErrorToast) {
        const errorMsg = error?.message || customErrorMessage || defaultErrorMessage;
        
        toast({
          title: "Erro",
          description: errorMsg,
          variant: "destructive"
        });
      }

      // Call error callback
      if (onError) {
        onError(error);
      }

      throw error;
    }
  }, [toast, showSuccessToast, showErrorToast, successMessage, defaultErrorMessage]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null
    });
  }, []);

  const retry = useCallback((asyncFunction, options = {}) => {
    return execute(asyncFunction, options);
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
    isIdle: !state.loading && !state.error && !state.data,
    isSuccess: !state.loading && !state.error && state.data !== null,
    isError: !state.loading && state.error !== null
  };
};