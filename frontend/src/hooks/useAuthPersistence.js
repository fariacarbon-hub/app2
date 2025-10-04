import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to ensure authentication persistence and handle token expiration gracefully
 */
export const useAuthPersistence = () => {
  const { user, isAuthenticated, loading, refreshAuth } = useAuth();
  const [authState, setAuthState] = useState({
    isValid: false,
    isChecking: true,
    error: null
  });

  useEffect(() => {
    const validateAuth = async () => {
      if (loading) return;

      setAuthState(prev => ({ ...prev, isChecking: true }));

      if (!isAuthenticated || !user) {
        // Try to refresh auth from stored token
        const refreshed = await refreshAuth();
        
        setAuthState({
          isValid: refreshed,
          isChecking: false,
          error: refreshed ? null : 'Authentication required'
        });
      } else {
        // User appears authenticated, validate token is still good
        try {
          const refreshed = await refreshAuth();
          setAuthState({
            isValid: refreshed,
            isChecking: false,
            error: refreshed ? null : 'Session expired'
          });
        } catch (error) {
          setAuthState({
            isValid: false,
            isChecking: false,
            error: 'Authentication validation failed'
          });
        }
      }
    };

    validateAuth();
  }, [isAuthenticated, user, loading, refreshAuth]);

  return {
    isAuthenticated: authState.isValid,
    isChecking: authState.isChecking,
    authError: authState.error,
    user: authState.isValid ? user : null
  };
};