import React, { createContext, useContext, ReactNode } from 'react';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LoadingContextType {
  isInitialLoading: boolean;
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  startPageTransition: () => void;
  finishPageTransition: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const loadingState = useGlobalLoading();

  return (
    <LoadingContext.Provider value={loadingState}>
      {/* Mostrar loading inicial */}
      {loadingState.isInitialLoading && <LoadingSpinner />}
      
      {/* Mostrar loading de transição de página */}
      {loadingState.isPageLoading && <LoadingSpinner />}
      
      {/* Conteúdo da aplicação */}
      {!loadingState.isInitialLoading && children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider');
  }
  return context;
}; 