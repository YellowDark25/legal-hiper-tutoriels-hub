/**
 * Template para criação de novos componentes
 * 
 * Para usar:
 * 1. Copie este arquivo
 * 2. Renomeie para o nome do seu componente
 * 3. Substitua 'ComponentName' pelo nome real
 * 4. Implemente a lógica necessária
 */

import React, { useState, useEffect } from 'react';

import { BaseComponentProps, LoadingProps } from '@/types/global';
import { MESSAGES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface ComponentNameProps extends BaseComponentProps, LoadingProps {
  // Defina as props específicas do componente aqui
  title?: string;
  onAction?: () => void;
  data?: any[];
  variant?: 'default' | 'secondary' | 'outline';
}

/**
 * Breve descrição do que o componente faz
 * 
 * @param title - Título a ser exibido
 * @param onAction - Callback executado quando ação é disparada
 * @param data - Dados a serem exibidos
 * @param variant - Variante visual do componente
 * @param loading - Estado de carregamento
 * @param error - Mensagem de erro
 * @param className - Classes CSS adicionais
 * @param children - Elementos filhos
 */
const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  onAction,
  data = [],
  variant = 'default',
  loading: externalLoading = false,
  error: externalError = null,
  className = '',
  children,
}) => {
  // Estados locais
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [localData, setLocalData] = useState(data);

  // Hooks
  const { toast } = useToast();

  // Estados computados
  const isLoading = externalLoading || internalLoading;
  const errorMessage = externalError || internalError;

  // Efeitos
  useEffect(() => {
    // Lógica de inicialização
    initializeComponent();
  }, []);

  useEffect(() => {
    // Atualizar dados locais quando props mudarem
    setLocalData(data);
  }, [data]);

  // Funções auxiliares
  const initializeComponent = async () => {
    try {
      setInternalLoading(true);
      setInternalError(null);
      
      // Lógica de inicialização aqui
      // Exemplo: buscar dados da API
      
    } catch (err) {
      console.error('Erro ao inicializar ComponentName:', err);
      const errorMsg = err instanceof Error ? err.message : MESSAGES.ERROR_GENERIC;
      setInternalError(errorMsg);
      
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setInternalLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      setInternalLoading(true);
      setInternalError(null);
      
      // Lógica da ação
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular async
      
      onAction?.();
      
      toast({
        title: 'Sucesso',
        description: MESSAGES.SUCCESS_SAVE,
      });
      
    } catch (err) {
      console.error('Erro em ComponentName handleAction:', err);
      const errorMsg = err instanceof Error ? err.message : MESSAGES.ERROR_GENERIC;
      setInternalError(errorMsg);
      
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setInternalLoading(false);
    }
  };

  const handleRetry = () => {
    setInternalError(null);
    initializeComponent();
  };

  // Classes CSS baseadas na variante
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary-50 border-secondary-200 text-secondary-900';
      case 'outline':
        return 'bg-transparent border-gray-300 text-gray-900';
      default:
        return 'bg-white border-gray-200 text-gray-900';
    }
  };

  // Renderização condicional para loading
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-8 w-1/3 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="bg-gray-200 h-4 rounded"></div>
          <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
        </div>
      </div>
    );
  }

  // Renderização condicional para erro
  if (errorMessage) {
    return (
      <div className={`text-red-500 p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-red-800">Erro</h3>
            <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
          </div>
          <button
            onClick={handleRetry}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className={`component-name ${getVariantClasses()} border rounded-lg p-6 ${className}`}>
      {/* Cabeçalho */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {onAction && (
            <button
              onClick={handleAction}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Executar Ação
            </button>
          )}
        </div>
      )}
      
      {/* Conteúdo principal */}
      <div className="content">
        {localData.length > 0 ? (
          <div className="space-y-2">
            {localData.map((item, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                {/* Renderizar item aqui */}
                {JSON.stringify(item)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {MESSAGES.NO_DATA}
          </div>
        )}
        
        {/* Conteúdo personalizado */}
        {children}
      </div>

      {/* Rodapé (opcional) */}
      <div className="footer mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Componente criado a partir do template padrão
        </p>
      </div>
    </div>
  );
};

export default ComponentName;

// Exemplo de uso:
// <ComponentName 
//   title="Meu Componente"
//   data={[1, 2, 3]}
//   variant="secondary"
//   onAction={() => console.log('Ação executada')}
//   className="my-4"
// /> 