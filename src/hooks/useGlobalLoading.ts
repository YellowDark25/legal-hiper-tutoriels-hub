import { useState, useEffect } from 'react';

interface UseGlobalLoadingReturn {
  isInitialLoading: boolean;
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  startPageTransition: () => void;
  finishPageTransition: () => void;
}

export const useGlobalLoading = (): UseGlobalLoadingReturn => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Loading inicial da aplicação
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500); // 1.5s para dar tempo de carregar recursos

    return () => clearTimeout(timer);
  }, []);

  // Função para iniciar transição de página
  const startPageTransition = () => {
    setIsPageLoading(true);
  };

  // Função para finalizar transição de página
  const finishPageTransition = () => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500); // Mínimo de 500ms para evitar flash

    return () => clearTimeout(timer);
  };

  // Função para controle manual do loading
  const setPageLoading = (loading: boolean) => {
    if (loading) {
      setIsPageLoading(true);
    } else {
      finishPageTransition();
    }
  };

  return {
    isInitialLoading,
    isPageLoading,
    setPageLoading,
    startPageTransition,
    finishPageTransition,
  };
}; 