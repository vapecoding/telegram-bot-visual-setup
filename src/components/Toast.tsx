import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
}

interface ToastProps {
  message: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ message, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const duration = message.duration ?? 4000;

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(message.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [message.id, duration, onDismiss]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(message.id), 300);
  };

  const icons: Record<ToastType, string> = {
    success: '✓',
    warning: '⚠️',
    error: '✕',
    info: 'ℹ️'
  };

  const colors: Record<ToastType, { bg: string; border: string; icon: string; title: string }> = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600 bg-green-100',
      title: 'text-green-900'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600 bg-yellow-100',
      title: 'text-yellow-900'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600 bg-red-100',
      title: 'text-red-900'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600 bg-blue-100',
      title: 'text-blue-900'
    }
  };

  const style = colors[message.type];

  return (
    <div
      className={`
        ${style.bg} ${style.border} border rounded-xl shadow-lg p-4
        flex items-start gap-3 min-w-[320px] max-w-[420px]
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${style.icon}`}>
        <span className="text-sm font-bold">{icons[message.type]}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${style.title}`}>
          {message.title}
        </p>
        {message.description && (
          <p className="text-xs text-gray-600 mt-0.5">
            {message.description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <span className="text-lg leading-none">×</span>
      </button>
    </div>
  );
}

// Мини-индикатор сохранения (для повторных сохранений)
interface SaveIndicatorProps {
  saveCount: number; // Увеличивается при каждом сохранении
  hasActiveToast: boolean; // Не показывать если есть активный toast
  hasError: boolean; // Ошибка сохранения - показать persistent индикатор
}

export function SaveIndicator({ saveCount, hasActiveToast, hasError }: SaveIndicatorProps) {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Показ успешного сохранения (временный)
  useEffect(() => {
    if (saveCount > 0 && !hasActiveToast && !hasError) {
      setShow(true);
      setAnimate(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });

      const hideTimer = setTimeout(() => {
        setAnimate(false);
        setTimeout(() => setShow(false), 300);
      }, 1500);

      return () => clearTimeout(hideTimer);
    }
  }, [saveCount, hasActiveToast, hasError]);

  // Ошибка - показать постоянно
  if (hasError) {
    return (
      <div
        className="fixed bottom-6 right-6 z-50 bg-red-100 border border-red-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md"
        title="Ошибка сохранения"
      >
        <span className="text-red-600 text-base">⚠</span>
      </div>
    );
  }

  if (!show || hasActiveToast) return null;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        bg-green-100 border border-green-300 rounded-full
        w-10 h-10 flex items-center justify-center
        shadow-md transition-all duration-300 ease-out
        ${animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
      `}
      title="Сохранено"
    >
      <span className="text-green-600 text-base">💾</span>
    </div>
  );
}

// Toast Container - manages multiple toasts
interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} message={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'success', title, description, duration });
  }, [addToast]);

  const showWarning = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'warning', title, description, duration });
  }, [addToast]);

  const showError = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'error', title, description, duration });
  }, [addToast]);

  const showInfo = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'info', title, description, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    dismissToast,
    showSuccess,
    showWarning,
    showError,
    showInfo
  };
}
