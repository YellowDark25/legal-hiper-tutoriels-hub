// Constantes do projeto

export const SISTEMAS = {
  PDVLEGAL: 'pdvlegal',
  HIPER: 'hiper',
} as const;

export const SISTEMAS_LABELS = {
  [SISTEMAS.PDVLEGAL]: 'PDV Legal',
  [SISTEMAS.HIPER]: 'Hiper',
} as const;

export const STATUS_VIDEO = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  RASCUNHO: 'rascunho',
} as const;

export const STATUS_LABELS = {
  [STATUS_VIDEO.ATIVO]: 'Ativo',
  [STATUS_VIDEO.INATIVO]: 'Inativo',
  [STATUS_VIDEO.RASCUNHO]: 'Rascunho',
} as const;

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const ROLES_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.USER]: 'Usuário',
} as const;

// Configurações da aplicação
export const APP_CONFIG = {
  ITEMS_PER_PAGE: 12,
  ITEMS_PER_PAGE_ADMIN: 20,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'webm', 'ogg'],
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas em ms
  TOAST_DURATION: 5000, // 5 segundos
} as const;

// URLs e endpoints
export const API_ENDPOINTS = {
  VIDEOS: '/videos',
  CATEGORIES: '/categorias',
  TAGS: '/tags',
  COMMENTS: '/comentarios',
  PROFILES: '/profiles',
  CLIENTS: '/cadastro_empresa',
  INVITES: '/invite_tokens',
} as const;

// Rotas da aplicação
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  ADMIN: '/admin',
  ADMIN_CHOICE: '/admin-choice',
  PROFILE: '/profile',
  PDVLEGAL: '/pdvlegal',
  HIPER: '/hiper',
  CONTACT: '/contato',
  NOT_FOUND: '/404',
} as const;

// Mensagens padrão
export const MESSAGES = {
  LOADING: 'Carregando...',
  ERROR_GENERIC: 'Ocorreu um erro inesperado',
  ERROR_NETWORK: 'Erro de conexão. Verifique sua internet.',
  ERROR_UNAUTHORIZED: 'Você não tem permissão para esta ação',
  ERROR_NOT_FOUND: 'Recurso não encontrado',
  SUCCESS_SAVE: 'Salvo com sucesso!',
  SUCCESS_DELETE: 'Excluído com sucesso!',
  SUCCESS_UPDATE: 'Atualizado com sucesso!',
  CONFIRM_DELETE: 'Tem certeza que deseja excluir este item?',
  CONFIRM_LOGOUT: 'Tem certeza que deseja sair?',
  NO_DATA: 'Nenhum dado encontrado',
  NO_RESULTS: 'Nenhum resultado encontrado',
} as const;

// Configurações de validação
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CNPJ_REGEX: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  COMMENT_MAX_LENGTH: 1000,
} as const;

// Configurações de tema
export const THEME = {
  COLORS: {
    PRIMARY: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      900: '#0c4a6e',
    },
    SECONDARY: {
      50: '#fef3c7',
      100: '#fde68a',
      500: '#f59e0b',
      900: '#78350f',
    },
    ACCENT: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      900: '#14532d',
    },
    NEUTRAL: {
      50: '#fafafa',
      100: '#f5f5f5',
      500: '#737373',
      900: '#171717',
    },
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
} as const;

// Configurações de animação
export const ANIMATIONS = {
  DURATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Configurações de localStorage
export const STORAGE_KEYS = {
  THEME: 'nexhub-theme',
  USER_PREFERENCES: 'nexhub-preferences',
  LAST_VISITED: 'nexhub-last-visited',
  SEARCH_HISTORY: 'nexhub-search-history',
} as const;

// Configurações de SEO
export const SEO = {
  DEFAULT_TITLE: 'NexHub - Centro de Tutoriais',
  DEFAULT_DESCRIPTION: 'Centro de tutoriais para os sistemas PDVLegal e Hiper da Nexsyn',
  DEFAULT_KEYWORDS: 'tutoriais, pdvlegal, hiper, nexsyn, sistema, gestão',
  SITE_NAME: 'NexHub',
  SITE_URL: 'https://nexhub.nexsyn.com.br',
  TWITTER_HANDLE: '@nexsyn',
} as const;

// Configurações de notificação
export const NOTIFICATIONS = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  POSITIONS: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
  },
} as const;

// Tipos derivados das constantes
export type Sistema = typeof SISTEMAS[keyof typeof SISTEMAS];
export type StatusVideo = typeof STATUS_VIDEO[keyof typeof STATUS_VIDEO];
export type Role = typeof ROLES[keyof typeof ROLES];
export type Route = typeof ROUTES[keyof typeof ROUTES];
export type NotificationType = typeof NOTIFICATIONS.TYPES[keyof typeof NOTIFICATIONS.TYPES];
export type NotificationPosition = typeof NOTIFICATIONS.POSITIONS[keyof typeof NOTIFICATIONS.POSITIONS]; 