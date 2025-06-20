import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { VALIDATION, SISTEMAS_LABELS, STATUS_LABELS } from './constants';
import { Sistema, StatusVideo } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==================== UTILITÁRIOS DE VALIDAÇÃO ====================

/**
 * Valida se um email tem formato válido
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Valida se um CNPJ tem formato válido
 */
export const isValidCNPJ = (cnpj: string): boolean => {
  return VALIDATION.CNPJ_REGEX.test(cnpj);
};

/**
 * Valida se um telefone tem formato válido
 */
export const isValidPhone = (phone: string): boolean => {
  return VALIDATION.PHONE_REGEX.test(phone);
};

/**
 * Valida se uma senha atende aos critérios mínimos
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

/**
 * Valida se um username atende aos critérios
 */
export const isValidUsername = (username: string): boolean => {
  return username.length >= VALIDATION.USERNAME_MIN_LENGTH && 
         username.length <= VALIDATION.USERNAME_MAX_LENGTH;
};

// ==================== UTILITÁRIOS DE FORMATAÇÃO ====================

/**
 * Formata CNPJ para exibição
 */
export const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata telefone para exibição
 */
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

/**
 * Formata data para exibição em português
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formata data e hora para exibição em português
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formata duração de vídeo (segundos para MM:SS)
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formata número para exibição com separadores
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('pt-BR');
};

// ==================== UTILITÁRIOS DE TEXTO ====================

/**
 * Trunca texto para um tamanho máximo
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitaliza primeira letra de uma string
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Converte string para slug (URL-friendly)
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
};

/**
 * Remove acentos de uma string
 */
export const removeAccents = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// ==================== UTILITÁRIOS DE SISTEMA ====================

/**
 * Obtém label de sistema por código
 */
export const getSistemaLabel = (sistema: Sistema): string => {
  return SISTEMAS_LABELS[sistema] || sistema;
};

/**
 * Obtém label de status por código
 */
export const getStatusLabel = (status: StatusVideo): string => {
  return STATUS_LABELS[status] || status;
};

/**
 * Obtém cor do status para UI
 */
export const getStatusColor = (status: StatusVideo): string => {
  switch (status) {
    case 'ativo':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inativo':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'rascunho':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Obtém cor do sistema para UI
 */
export const getSistemaColor = (sistema: Sistema): string => {
  switch (sistema) {
    case 'pdvlegal':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'hiper':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// ==================== UTILITÁRIOS DE ARQUIVO ====================

/**
 * Converte bytes para formato legível
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Obtém extensão de arquivo
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Verifica se arquivo é imagem
 */
export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};

/**
 * Verifica se arquivo é vídeo
 */
export const isVideoFile = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv'].includes(ext);
};

// ==================== UTILITÁRIOS DE URL ====================

/**
 * Extrai ID do YouTube de uma URL
 */
export const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Gera URL de thumbnail do YouTube
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
};

/**
 * Valida se URL é válida
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ==================== UTILITÁRIOS DE ARRAY ====================

/**
 * Remove duplicatas de array
 */
export const removeDuplicates = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Agrupa array por propriedade
 */
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Ordena array por propriedade
 */
export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// ==================== UTILITÁRIOS DE DEBOUNCE/THROTTLE ====================

/**
 * Debounce function - executa função após delay sem novas chamadas
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function - limita execução da função por período
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ==================== UTILITÁRIOS DE STORAGE ====================

/**
 * Salva item no localStorage com tratamento de erro
 */
export const setStorageItem = (key: string, value: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
    return false;
  }
};

/**
 * Obtém item do localStorage com tratamento de erro
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Erro ao ler do localStorage:', error);
    return defaultValue;
  }
};

/**
 * Remove item do localStorage
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error);
    return false;
  }
};

// ==================== UTILITÁRIOS DE TEMPO ====================

/**
 * Formata tempo relativo (ex: "há 2 horas")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora mesmo';
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 2592000) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
  if (diffInSeconds < 31536000) return `há ${Math.floor(diffInSeconds / 2592000)} meses`;
  return `há ${Math.floor(diffInSeconds / 31536000)} anos`;
};

/**
 * Pausa execução por tempo determinado
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Função para gerar um ID único de sessão por aba/janela
export function generateTabSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  // Verifica se já existe um ID para esta aba/janela
  let tabId = sessionStorage.getItem('tab_session_id');
  
  if (!tabId) {
    // Gera um novo ID único para esta aba
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    sessionStorage.setItem('tab_session_id', tabId);
  }
  
  return tabId;
}

// Função para obter o ID da sessão atual
export function getCurrentTabSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  return sessionStorage.getItem('tab_session_id') || generateTabSessionId();
}

// Função para verificar se as múltiplas abas estão funcionando corretamente
export function checkMultiTabSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Testa se sessionStorage está funcionando
    const testKey = 'multi_tab_test';
    sessionStorage.setItem(testKey, 'test');
    const retrieved = sessionStorage.getItem(testKey);
    sessionStorage.removeItem(testKey);
    
    return retrieved === 'test';
  } catch (error) {
    console.warn('SessionStorage não está disponível, múltiplas abas podem não funcionar corretamente:', error);
    return false;
  }
}
