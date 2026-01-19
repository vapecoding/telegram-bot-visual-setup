/**
 * Design Tokens - единый источник стилей для всего проекта
 * Использование: import { colors, spacing, animations } from './design-tokens'
 */

// ==========================================
// ТИПОГРАФИКА (5 размеров)
// ==========================================
export const typography = {
  xs: '0.75rem',    // 12px - счетчики символов, hints
  sm: '0.875rem',   // 14px - labels, secondary text
  base: '1rem',     // 16px - body text, inputs
  lg: '1.125rem',   // 18px - section headers
  xl: '1.25rem',    // 20px - page title
  '2xl': '1.5rem',  // 24px - modal titles
} as const;

// ==========================================
// SPACING (8px grid system)
// ==========================================
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

// ==========================================
// ЦВЕТА (семантические)
// ==========================================
export const colors = {
  // Primary - основные действия, focus
  primary: {
    base: 'rgb(59, 130, 246)',        // blue-500
    light: 'rgba(59, 130, 246, 0.1)',
    alpha: (opacity: number) => `rgba(59, 130, 246, ${opacity})`,
  },

  // Success - скачивание, успешные действия
  success: {
    base: 'rgb(34, 197, 94)',         // green-500
    light: 'rgba(34, 197, 94, 0.1)',
    alpha: (opacity: number) => `rgba(34, 197, 94, ${opacity})`,
  },

  // Warning - предупреждения, hints
  warning: {
    base: 'rgb(234, 179, 8)',         // yellow-500
    light: 'rgba(234, 179, 8, 0.1)',
    alpha: (opacity: number) => `rgba(234, 179, 8, ${opacity})`,
  },

  // Error - ошибки, критичные состояния
  error: {
    base: 'rgb(239, 68, 68)',         // red-500
    light: 'rgba(239, 68, 68, 0.1)',
    alpha: (opacity: number) => `rgba(239, 68, 68, ${opacity})`,
  },

  // Neutral - вторичная информация
  neutral: {
    base: 'rgb(107, 114, 128)',       // gray-500
    light: 'rgba(107, 114, 128, 0.1)',
    alpha: (opacity: number) => `rgba(107, 114, 128, ${opacity})`,
  },
} as const;

// ==========================================
// АНИМАЦИИ (timing и easing)
// ==========================================
export const animations = {
  // Duration
  duration: {
    fast: '200ms',      // Быстрые hover effects
    normal: '300ms',    // Стандартные transitions
    slow: '500ms',      // Медленные fade/slide
    pulse: '1200ms',    // Highlight пульсация
  },

  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',  // ease-in-out
    smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',   // более плавная
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // bounce effect
  },

  // Готовые конфиги для CSS transitions
  transition: {
    fast: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ==========================================
// BORDER RADIUS
// ==========================================
export const borderRadius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',   // круглые элементы
} as const;

// ==========================================
// SHADOWS
// ==========================================
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// ==========================================
// Z-INDEX LAYERS
// ==========================================
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 50,
  toast: 100,
} as const;

// ==========================================
// BREAKPOINTS (для responsive)
// ==========================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',   // стандартный Full HD
  '4xl': '2560px',   // 2K
  ultrawide: '3440px', // ultrawide monitors
} as const;

// ==========================================
// LAYOUT CONSTRAINTS
// ==========================================
export const layout = {
  // Максимальные ширины контейнеров
  maxWidth: {
    form: '800px',        // Форма не должна быть шире
    container: '1600px',  // Общий контейнер для ultrawide
    phone: '460px',       // Телефон-превью
  },

  // Высоты
  header: '56px',

  // Phone preview sizing
  phone: {
    minHeight: '700px',
    maxHeight: '1000px',
    aspectRatio: '10 / 19.5',  // iPhone-like
  },
} as const;

// ==========================================
// EXPORT ALL
// ==========================================
export const designTokens = {
  typography,
  spacing,
  colors,
  animations,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  layout,
} as const;

export default designTokens;
