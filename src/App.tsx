import { useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TelegramPhone, type PreviewMode } from './components/preview/TelegramPhone';
import { AvatarUpload } from './components/AvatarUpload';
import { BotPicUpload } from './components/BotPicUpload';
import { ToastContainer, SaveIndicator, useToast } from './components/Toast';
import { MobileTabs } from './components/MobileTabs';
import { MobilePreviewSwitcher } from './components/MobilePreviewSwitcher';
import { ValidationModal } from './components/ValidationModal';
import { isIndexedDBSupported, loadDraft, saveDraft, clearDraft } from './utils/indexedDB';
import { canShare, incrementShareCount, getShareLimitInfo, SHARE_DAILY_LIMIT } from './utils/shareLimit';
import packageJson from '../package.json';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { uploadImage } from './lib/imageUpload';
import { notifyShareCreated, trackEvent } from './lib/notifications';

// Throttle utility для оптимизации hover событий
function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): {
  throttled: (...args: Parameters<T>) => void;
  cancel: () => void;
} {
  let timeoutId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = function (...args: Parameters<T>) {
    lastArgs = args;

    if (timeoutId === null) {
      // Выполняем сразу (leading edge)
      func(...args);

      // Устанавливаем таймер для следующего вызова
      timeoutId = window.setTimeout(() => {
        // Выполняем последний накопленный вызов (trailing edge)
        if (lastArgs) {
          func(...lastArgs);
        }
        timeoutId = null;
        lastArgs = null;
      }, delay);
    }
  };

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return { throttled, cancel };
}

// Утилита для конвертации data URL в Blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Определение расширения файла из data URL
function getExtensionFromDataURL(dataURL: string): string {
  const mime = dataURL.match(/data:(.*?);/)?.[1] || 'image/png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('webp')) return 'webp';
  return 'png';
}

// Генерация демо-аватарки (640x640) - абстрактный робот
function generateDemoAvatar(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  // Градиент фона
  const bgGradient = ctx.createRadialGradient(320, 320, 0, 320, 320, 450);
  bgGradient.addColorStop(0, '#4f46e5');
  bgGradient.addColorStop(0.5, '#7c3aed');
  bgGradient.addColorStop(1, '#2563eb');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 640, 640);

  // Декоративные круги на фоне
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(120, 120, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(520, 500, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Голова робота (скруглённый прямоугольник)
  ctx.fillStyle = '#e0e7ff';
  ctx.beginPath();
  ctx.roundRect(180, 140, 280, 300, 40);
  ctx.fill();

  // Тень головы
  ctx.fillStyle = '#c7d2fe';
  ctx.beginPath();
  ctx.roundRect(180, 380, 280, 60, [0, 0, 40, 40]);
  ctx.fill();

  // Антенна
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.roundRect(300, 80, 40, 70, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(320, 65, 25, 0, Math.PI * 2);
  ctx.fill();

  // Глаза (LED-стиль)
  const eyeGradient = ctx.createRadialGradient(250, 260, 0, 250, 260, 40);
  eyeGradient.addColorStop(0, '#60a5fa');
  eyeGradient.addColorStop(0.7, '#2563eb');
  eyeGradient.addColorStop(1, '#1e40af');
  ctx.fillStyle = eyeGradient;
  ctx.beginPath();
  ctx.roundRect(210, 220, 80, 80, 16);
  ctx.fill();

  const eyeGradient2 = ctx.createRadialGradient(390, 260, 0, 390, 260, 40);
  eyeGradient2.addColorStop(0, '#60a5fa');
  eyeGradient2.addColorStop(0.7, '#2563eb');
  eyeGradient2.addColorStop(1, '#1e40af');
  ctx.fillStyle = eyeGradient2;
  ctx.beginPath();
  ctx.roundRect(350, 220, 80, 80, 16);
  ctx.fill();

  // Блики в глазах
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(235, 245, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(375, 245, 12, 0, Math.PI * 2);
  ctx.fill();

  // Рот (улыбка)
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(320, 350, 50, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Щёки (румянец)
  ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
  ctx.beginPath();
  ctx.ellipse(200, 330, 25, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(440, 330, 25, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Уши (боковые панели)
  ctx.fillStyle = '#a5b4fc';
  ctx.beginPath();
  ctx.roundRect(145, 220, 30, 100, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(465, 220, 30, 100, 8);
  ctx.fill();

  // Тело (намёк)
  ctx.fillStyle = '#c7d2fe';
  ctx.beginPath();
  ctx.roundRect(220, 450, 200, 120, [0, 0, 30, 30]);
  ctx.fill();

  // Декоративные линии на теле
  ctx.strokeStyle = '#a5b4fc';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(260, 480);
  ctx.lineTo(380, 480);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(260, 510);
  ctx.lineTo(380, 510);
  ctx.stroke();

  // Индикатор на теле
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(320, 540, 12, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/png');
}

// Генерация демо-картинки Description Picture (640x360)
function generateDemoBotPic(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // Градиент фона
  const gradient = ctx.createLinearGradient(0, 0, 640, 360);
  gradient.addColorStop(0, '#1e40af');
  gradient.addColorStop(0.5, '#7c3aed');
  gradient.addColorStop(1, '#db2777');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 640, 360);

  // Декоративные круги
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(100, 100, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(540, 260, 200, 0, Math.PI * 2);
  ctx.fill();

  // Текст
  ctx.globalAlpha = 1;
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎪 EXPO 2026', 320, 140);

  ctx.font = '28px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Технологии Будущего', 320, 210);

  ctx.font = '20px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('15-20 января · Экспоцентр', 320, 280);

  return canvas.toDataURL('image/png');
}

function App() {
  const [username, setUsername] = useState('');
  const [botName, setBotName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('https://example.com/privacy');
  const [firstMessageText, setFirstMessageText] = useState('');
  const [inlineButtonText, setInlineButtonText] = useState('');
  const [inlineButtonResponse, setInlineButtonResponse] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [botPicUrl, setBotPicUrl] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [inputFocusedField, setInputFocusedField] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const [showBotPicPlaceholder, setShowBotPicPlaceholder] = useState(false);
  const [showPrivacyPolicyPlaceholder, setShowPrivacyPolicyPlaceholder] = useState(false);
  const [showFirstMessagePlaceholder, setShowFirstMessagePlaceholder] = useState(false);
  const [showInlineButtonPlaceholder, setShowInlineButtonPlaceholder] = useState(false);
  const [highlightAvatar, setHighlightAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarWarning, setAvatarWarning] = useState<string | null>(null);
  const [previewHoveredField, setPreviewHoveredField] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null); // Для FieldHelp (с задержкой)

  // Mobile state
  const [mobileActiveTab, setMobileActiveTab] = useState<'form' | 'preview'>('form');
  const [mobilePreviewMode, setMobilePreviewMode] = useState<PreviewMode>('chatlist');

  // Поле для мгновенной подсветки в превью (без задержки)
  const highlightField = hoveredField || inputFocusedField;

  // Ref для таймера задержки FieldHelp
  const fieldHelpDelayTimerRef = useRef<number | null>(null);

  // Refs для полей формы (для скролла при hover на превью)
  const fieldRefs = {
    botName: useRef<HTMLInputElement>(null),
    shortDescription: useRef<HTMLInputElement>(null),
    avatar: useRef<HTMLDivElement>(null),
    about: useRef<HTMLInputElement>(null),
    username: useRef<HTMLInputElement>(null),
    privacyPolicyUrl: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
    botPic: useRef<HTMLDivElement>(null),
    firstMessageText: useRef<HTMLTextAreaElement>(null),
    inlineButtonText: useRef<HTMLInputElement>(null),
    inlineButtonResponse: useRef<HTMLTextAreaElement>(null),
  };

  // IndexedDB состояния
  const [isHydrating, setIsHydrating] = useState(true); // Защита от race condition
  const [isIDBSupported] = useState(isIndexedDBSupported());
  const [hasShownSaveToast, setHasShownSaveToast] = useState(false); // Для показа toast только один раз
  const [saveIndicatorCount, setSaveIndicatorCount] = useState(0); // Счётчик для мини-индикатора
  const [saveError, setSaveError] = useState(false); // Ошибка сохранения
  const justHydratedRef = useRef(true); // Пропуск первого "сохранения" после гидратации
  const hasShownRestoreToastRef = useRef(false); // Защита от двойного toast в StrictMode
  const hasHydratedShareRef = useRef(false); // Защита от двойной загрузки share-данных в StrictMode
  const saveTimeoutRef = useRef<number | null>(null);
  const [isSharing, setIsSharing] = useState(false); // Состояние загрузки для кнопки "Поделиться"
  const [isSharingLong, setIsSharingLong] = useState(false); // Показать "ещё немного" после 10 сек
  const [shareUrl, setShareUrl] = useState<string | null>(null); // URL для модалки
  const [showShareModal, setShowShareModal] = useState(false); // Показ модалки со ссылкой
  const [showChangelogModal, setShowChangelogModal] = useState(false); // Показ модалки с историей версий
  const [showShareValidationModal, setShowShareValidationModal] = useState(false); // Validation перед share
  const [showDownloadValidationModal, setShowDownloadValidationModal] = useState(false); // Validation перед download

  // Toast уведомления
  const { toasts, dismissToast, showSuccess, showWarning, showInfo } = useToast();

  // Throttled обработчики для hover событий (оптимизация производительности)
  const hoveredFieldThrottle = useRef(
    throttle((field: string | null) => {
      setHoveredField(field);
    }, 50)
  ).current;

  const previewHoveredFieldThrottle = useRef(
    throttle((field: string | null) => {
      setPreviewHoveredField(field);
    }, 50)
  ).current;

  const throttledSetHoveredField = hoveredFieldThrottle.throttled;
  const throttledSetPreviewHoveredField = previewHoveredFieldThrottle.throttled;

  // Cleanup throttle таймеров при размонтировании
  useEffect(() => {
    return () => {
      hoveredFieldThrottle.cancel();
      previewHoveredFieldThrottle.cancel();
    };
  }, [hoveredFieldThrottle, previewHoveredFieldThrottle]);

  // Управление focusedField с задержкой для FieldHelp
  useEffect(() => {
    // Активное поле: hover на форму, hover на превью, или фокус
    const activeField = hoveredField || previewHoveredField;

    // Отменяем предыдущий таймер при любом изменении
    if (fieldHelpDelayTimerRef.current !== null) {
      clearTimeout(fieldHelpDelayTimerRef.current);
      fieldHelpDelayTimerRef.current = null;
    }

    if (activeField !== null) {
      // Если навели на поле (форму или превью) - сразу показываем его (без задержки)
      setFocusedField(activeField);
    } else {
      // Если убрали hover - ждём 2 секунды перед исчезанием
      fieldHelpDelayTimerRef.current = window.setTimeout(() => {
        setFocusedField(inputFocusedField);
        fieldHelpDelayTimerRef.current = null;
      }, 2000);
    }

    // Cleanup при размонтировании
    return () => {
      if (fieldHelpDelayTimerRef.current !== null) {
        clearTimeout(fieldHelpDelayTimerRef.current);
        fieldHelpDelayTimerRef.current = null;
      }
    };
  }, [hoveredField, previewHoveredField, inputFocusedField]);

  // Закрытие модального окна по ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showClearConfirm) setShowClearConfirm(false);
        if (showDemoConfirm) setShowDemoConfirm(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showClearConfirm, showDemoConfirm]);

  // Таймер для "долгой загрузки" - показывает доп. сообщение через 10 сек
  useEffect(() => {
    if (isSharing) {
      const timer = window.setTimeout(() => {
        setIsSharingLong(true);
      }, 10000);
      return () => {
        clearTimeout(timer);
        setIsSharingLong(false);
      };
    } else {
      setIsSharingLong(false);
    }
  }, [isSharing]);

  // Скролл к полю формы при наведении на превью
  useEffect(() => {
    if (!previewHoveredField) return;

    const ref = fieldRefs[previewHoveredField as keyof typeof fieldRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [previewHoveredField]);

  // Handler для hover на превью (с throttle для оптимизации)
  const handlePreviewFieldHover = useCallback((field: string | null) => {
    throttledSetPreviewHoveredField(field);
  }, [throttledSetPreviewHoveredField]);

  // Auto-resize textarea
  const autoResizeTextarea = useCallback((element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  // Ресайз textarea при изменении данных (например, после восстановления из IndexedDB)
  useEffect(() => {
    if (fieldRefs.description.current) autoResizeTextarea(fieldRefs.description.current);
    if (fieldRefs.firstMessageText.current) autoResizeTextarea(fieldRefs.firstMessageText.current);
    if (fieldRefs.inlineButtonResponse.current) autoResizeTextarea(fieldRefs.inlineButtonResponse.current);
  }, [description, firstMessageText, inlineButtonResponse, autoResizeTextarea]);

  // Восстановление черновика при загрузке или данных из публичной ссылки
  useEffect(() => {
    async function hydrate() {
      // Проверяем, есть ли share ID в URL
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        // Защита от двойной загрузки в React StrictMode (dev)
        if (hasHydratedShareRef.current) return;
        hasHydratedShareRef.current = true;

        // Если Supabase не настроен - показываем ошибку
        if (!supabase) {
          showWarning('Ошибка', 'Сервис "Поделиться" временно недоступен');
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }

        // Устанавливаем флаг загрузки (блокирует кнопки)
        setIsHydrating(true);

        const shareParam = hash.substring(7); // Удаляем #share=

        // Флаг для отслеживания таймаута
        let timedOut = false;

        // Timeout для fallback (10 секунд)
        const timeoutId = setTimeout(() => {
          if (isHydrating) {
            timedOut = true;
            setIsHydrating(false);
            showWarning(
              'Загрузка не удалась',
              'Превышено время ожидания. Проверьте интернет-соединение или попробуйте позже.'
            );
            window.history.replaceState(null, '', window.location.pathname);
          }
        }, 10000);

        try {
          // Парсим id и secret из формата: id.secret
          const [shareId, shareSecret] = shareParam.split('.');

          if (!shareId || !shareSecret) {
            throw new Error('Неверный формат ссылки');
          }

          // Вызываем RPC функцию share_get
          const { data, error } = await supabase.rpc('share_get', {
            share_id: shareId,
            share_secret: shareSecret
          });

          // Если таймаут уже сработал - игнорируем результат
          if (timedOut) {
            console.log('Request completed after timeout, ignoring results');
            return;
          }

          if (error) {
            console.error('Supabase RPC error:', error);
            throw new Error(error.message);
          }

          if (!data) {
            throw new Error('Данные не найдены');
          }

          const shareData = data;

          // Заполняем текстовые поля
          setUsername(shareData.username || '');
          setBotName(shareData.botName || '');
          setShortDescription(shareData.shortDescription || '');
          setDescription(shareData.description || '');
          setAbout(shareData.about || '');
          setPrivacyPolicyUrl(shareData.privacyPolicyUrl || '');
          setFirstMessageText(shareData.firstMessageText || '');
          setInlineButtonText(shareData.inlineButtonText || '');
          setInlineButtonResponse(shareData.inlineButtonResponse || '');

          // Устанавливаем URL картинок сразу - они будут грузиться в фоне
          setAvatarUrl(shareData.avatarUrl || null);
          setBotPicUrl(shareData.botPicUrl || null);

          // Ждём загрузки изображений максимум 10 секунд (для улучшения UX)
          // После этого разблокируем UI, картинки продолжат грузиться в фоне
          const imageLoadPromises: Promise<void>[] = [];

          if (shareData.avatarUrl) {
            imageLoadPromises.push(
              new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve();
                img.src = shareData.avatarUrl;
              })
            );
          }

          if (shareData.botPicUrl) {
            imageLoadPromises.push(
              new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve();
                img.src = shareData.botPicUrl;
              })
            );
          }

          // Ждём максимум 10 секунд, потом показываем UI
          // Не загруженные картинки будут догружаться в фоне
          if (imageLoadPromises.length > 0) {
            await Promise.race([
              Promise.all(imageLoadPromises),
              new Promise(resolve => setTimeout(resolve, 10000))
            ]);
          }

          clearTimeout(timeoutId);
          showInfo('Данные загружены', 'Конфигурация загружена из публичной ссылки');

          // Очищаем hash из URL после загрузки
          window.history.replaceState(null, '', window.location.pathname);
          setIsHydrating(false);
          return;
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Failed to load shared data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить данные по ссылке';
          showWarning('Ошибка загрузки', errorMessage);
          // Очищаем hash даже в случае ошибки
          window.history.replaceState(null, '', window.location.pathname);
          setIsHydrating(false);
          return; // Важно! Останавливаем выполнение, не загружаем черновик
        }
      }

      // Если нет share ссылки - стандартное восстановление из IndexedDB
      // Показываем предупреждение если IndexedDB недоступен
      if (!isIDBSupported) {
        setIsHydrating(false);
        // Небольшая задержка чтобы toast появился после рендера
        setTimeout(() => {
          showWarning(
            'Автосохранение недоступно',
            'Скачайте архив после заполнения, чтобы не потерять данные',
            6000
          );
        }, 500);
        return;
      }

      try {
        const draft = await loadDraft();
        if (draft) {
          setUsername(draft.username || '');
          setBotName(draft.botName);
          setShortDescription(draft.shortDescription);
          setDescription(draft.description);
          setAbout(draft.about);
          setPrivacyPolicyUrl(draft.privacyPolicyUrl);
          setFirstMessageText(draft.firstMessageText);
          setInlineButtonText(draft.inlineButtonText);
          setInlineButtonResponse(draft.inlineButtonResponse);
          setAvatarUrl(draft.avatarUrl);
          setBotPicUrl(draft.botPicUrl);

          // Проверяем, есть ли реальный контент в черновике
          const hasMeaningfulContent = Boolean(
            draft.username ||
            draft.botName ||
            draft.shortDescription ||
            draft.description ||
            draft.about ||
            draft.privacyPolicyUrl ||
            draft.firstMessageText ||
            draft.inlineButtonText ||
            draft.inlineButtonResponse ||
            draft.avatarUrl ||
            draft.botPicUrl
          );

          // Toast о восстановлении черновика только если есть контент
          if (hasMeaningfulContent) {
            setHasShownSaveToast(true);
            // Защита от двойного вызова в StrictMode
            if (!hasShownRestoreToastRef.current) {
              hasShownRestoreToastRef.current = true;
              setTimeout(() => {
                showInfo(
                  'Черновик восстановлен',
                  'Данные загружены из браузера'
                );
              }, 300);
            }
          }
        }
      } catch (error) {
        console.error('Failed to restore draft:', error);
      } finally {
        setIsHydrating(false);
      }
    }

    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIDBSupported]);

  // Автосохранение черновика (debounced, 2 секунды)
  useEffect(() => {
    // Не сохраняем во время гидратации
    if (isHydrating || !isIDBSupported) {
      return;
    }

    // Очищаем предыдущий таймер
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Устанавливаем новый таймер
    saveTimeoutRef.current = window.setTimeout(async () => {
      // Пропускаем первое "сохранение" сразу после гидратации (это те же данные)
      if (justHydratedRef.current) {
        justHydratedRef.current = false;
        return;
      }

      const draft = {
        username,
        botName,
        shortDescription,
        description,
        about,
        privacyPolicyUrl,
        firstMessageText,
        inlineButtonText,
        inlineButtonResponse,
        avatarUrl,
        botPicUrl,
        savedAt: Date.now()
      };

      try {
        await saveDraft(draft);
        setSaveError(false); // Сброс ошибки при успешном сохранении

        // Показываем toast только при первом реальном сохранении
        if (!hasShownSaveToast) {
          setHasShownSaveToast(true);
          showSuccess(
            'Черновик сохранён',
            'Данные автоматически сохраняются в браузере'
          );
        } else {
          // Для повторных сохранений - мини-индикатор
          setSaveIndicatorCount((c) => c + 1);
        }
      } catch (error) {
        console.error('Failed to save draft:', error);
        setSaveError(true); // Показать persistent индикатор ошибки
      }
    }, 2000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    username,
    botName,
    shortDescription,
    description,
    about,
    privacyPolicyUrl,
    firstMessageText,
    inlineButtonText,
    inlineButtonResponse,
    avatarUrl,
    botPicUrl,
    isHydrating,
    isIDBSupported,
    hasShownSaveToast
  ]);

  // Handler для изменения аватара
  const handleAvatarChange = (url: string | null, _file: File | null) => {
    setAvatarUrl(url);
  };

  // Handler для изменения Description Picture
  const handleBotPicChange = (url: string | null, _file: File | null) => {
    setBotPicUrl(url);
  };

  // Утилита для определения цвета счетчика символов
  const getCounterColor = (length: number, max: number) => {
    if (length > max) return 'text-red-500 font-semibold';
    if (length > max * 0.8) return 'text-yellow-600 font-medium';
    return 'text-gray-400';
  };

  // Утилита для определения класса обводки инпута
  const getInputBorderClass = (length: number, max: number) => {
    if (length > max) return 'border-red-500 focus:ring-red-500';
    return 'border-gray-300 focus:ring-blue-500';
  };

  // Обработка импорта из ZIP
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    try {
      // Загружаем и распаковываем ZIP
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      // Читаем settings.json
      const settingsFile = zipContent.file('settings.json');
      if (!settingsFile) {
        showWarning('Ошибка', 'В архиве не найден файл settings.json');
        return;
      }

      const settingsText = await settingsFile.async('text');
      const settings = JSON.parse(settingsText);

      // Заполняем текстовые поля
      setUsername(settings.username || '');
      setBotName(settings.botName || '');
      setShortDescription(settings.shortDescription || '');
      setDescription(settings.description || '');
      setAbout(settings.about || '');
      setPrivacyPolicyUrl(settings.privacyPolicyUrl || '');

      // Обрабатываем firstMessage
      if (settings.firstMessage) {
        setFirstMessageText(settings.firstMessage.text || '');
        if (settings.firstMessage.inlineButton) {
          setInlineButtonText(settings.firstMessage.inlineButton.text || '');
          setInlineButtonResponse(settings.firstMessage.inlineButton.response || '');
        } else {
          setInlineButtonText('');
          setInlineButtonResponse('');
        }
      } else {
        setFirstMessageText('');
        setInlineButtonText('');
        setInlineButtonResponse('');
      }

      // Загружаем аватарку (если есть)
      if (settings.avatarFile) {
        const avatarFile = zipContent.file(settings.avatarFile);
        if (avatarFile) {
          const avatarBlob = await avatarFile.async('blob');
          const reader = new FileReader();
          reader.onload = (e) => {
            setAvatarUrl(e.target?.result as string);
          };
          reader.readAsDataURL(avatarBlob);
        }
      } else {
        setAvatarUrl(null);
      }

      // Загружаем bot_pic (если есть)
      if (settings.botPicFile) {
        const botPicFile = zipContent.file(settings.botPicFile);
        if (botPicFile) {
          const botPicBlob = await botPicFile.async('blob');
          const reader = new FileReader();
          reader.onload = (e) => {
            setBotPicUrl(e.target?.result as string);
          };
          reader.readAsDataURL(botPicBlob);
        }
      } else {
        setBotPicUrl(null);
      }

      showSuccess('Импорт выполнен', 'Данные успешно загружены из архива');
    } catch (error) {
      console.error('Failed to import ZIP:', error);
      showWarning('Ошибка импорта', 'Не удалось загрузить данные из архива');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
    // Сброс значения input для возможности повторной загрузки того же файла
    e.target.value = '';
  };

  // Обработка экспорта с генерацией ZIP
  const handleExport = async () => {
    try {
      // Собираем данные для settings.json
      const settings = {
        username,
        botName,
        shortDescription,
        description,
        about,
        privacyPolicyUrl,
        firstMessage: firstMessageText ? {
          text: firstMessageText,
          inlineButton: inlineButtonText ? {
            text: inlineButtonText,
            response: inlineButtonResponse || ''
          } : undefined
        } : undefined,
        // Референсы на файлы (если есть)
        avatarFile: avatarUrl ? `avatar.${getExtensionFromDataURL(avatarUrl)}` : null,
        botPicFile: botPicUrl ? `bot_pic.${getExtensionFromDataURL(botPicUrl)}` : null
      };

      // Создаём ZIP архив
      const zip = new JSZip();

      // Добавляем settings.json
      zip.file('settings.json', JSON.stringify(settings, null, 2));

      // Добавляем аватарку (если есть)
      if (avatarUrl) {
        const avatarBlob = dataURLtoBlob(avatarUrl);
        const avatarExt = getExtensionFromDataURL(avatarUrl);
        zip.file(`avatar.${avatarExt}`, avatarBlob);
      }

      // Добавляем Description Picture (если есть)
      if (botPicUrl) {
        const botPicBlob = dataURLtoBlob(botPicUrl);
        const botPicExt = getExtensionFromDataURL(botPicUrl);
        zip.file(`bot_pic.${botPicExt}`, botPicBlob);
      }

      // Генерируем и скачиваем архив
      const content = await zip.generateAsync({ type: 'blob' });
      const fileName = username ? `${username}_settings.zip` : 'bot_settings.zip';
      saveAs(content, fileName);

      // Показываем toast об успешном скачивании
      showSuccess('Архив скачан', `Файл ${fileName} сохранён`);
    } catch (error) {
      console.error('Failed to generate ZIP:', error);
      showWarning('Ошибка', 'Не удалось создать архив');
    }
  };

  // Проверка лимита и показ модалки валидации перед шарингом
  const handleShare = () => {
    // Проверяем дневной лимит
    const limitCheck = canShare();
    if (!limitCheck.allowed) {
      showWarning(
        'Лимит исчерпан',
        `Вы создали ${SHARE_DAILY_LIMIT} ссылок сегодня. Попробуйте завтра.`
      );
      return;
    }

    // Показываем модалку валидации
    setShowShareValidationModal(true);
  };

  // Фактическое создание публичной ссылки (вызывается после подтверждения в модалке)
  const performShare = async () => {
    if (isSharing) return;
    if (!supabase) {
      showWarning('Ошибка', 'Сервис "Поделиться" временно недоступен');
      return;
    }

    try {
      setIsSharing(true);

      // Загружаем картинки в Supabase Storage (если они НЕ являются уже публичными URL)
      let uploadedAvatarUrl: string | null = null;
      let uploadedBotPicUrl: string | null = null;
      let avatarFailed = false;
      let botPicFailed = false;

      // Avatar: загружаем в Storage, если есть
      if (avatarUrl) {
        if (avatarUrl.startsWith('https://') && avatarUrl.includes('supabase.co')) {
          uploadedAvatarUrl = avatarUrl;
        } else {
          try {
            uploadedAvatarUrl = await uploadImage(avatarUrl, 'avatar.jpg');
          } catch (error) {
            console.warn('Failed to upload avatar:', error);
            avatarFailed = true;
          }
        }
      }

      // Bot Picture: загружаем в Storage, если есть
      if (botPicUrl) {
        if (botPicUrl.startsWith('https://') && botPicUrl.includes('supabase.co')) {
          uploadedBotPicUrl = botPicUrl;
        } else {
          try {
            uploadedBotPicUrl = await uploadImage(botPicUrl, 'bot-picture.jpg');
          } catch (error) {
            console.warn('Failed to upload bot picture:', error);
            botPicFailed = true;
          }
        }
      }

      // Собираем все данные с загруженными URL картинок
      const shareData = {
        username,
        botName,
        shortDescription,
        description,
        about,
        privacyPolicyUrl,
        firstMessageText,
        inlineButtonText,
        inlineButtonResponse,
        avatarUrl: uploadedAvatarUrl,
        botPicUrl: uploadedBotPicUrl,
      };

      // Вызываем RPC функцию share_create
      const { data, error } = await supabase.rpc('share_create', {
        payload_json: shareData
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(error.message);
      }

      if (!data || !data.id || !data.secret) {
        throw new Error('Invalid response from server');
      }

      const { id, secret } = data;

      // Генерируем ссылку с секретом во fragment
      const generatedShareUrl = `${window.location.origin}${window.location.pathname}#share=${id}.${secret}`;

      // Инкрементируем счётчик лимита ПОСЛЕ успешного создания
      incrementShareCount();

      // Показываем модалку со ссылкой
      setShareUrl(generatedShareUrl);
      setShowShareModal(true);
      setShowShareValidationModal(false);

      // Аналитика и уведомления (не блокируют UI)
      trackEvent('share_created');
      notifyShareCreated({
        shareUrl: generatedShareUrl,
        botName: botName || undefined,
        botUsername: username || undefined,
      });

      // Показываем уведомление
      if (avatarFailed || botPicFailed) {
        let warningText = '';
        if (avatarFailed && botPicFailed) {
          warningText = 'Аватар и картинка бота не загружены. Текстовые данные сохранены.';
        } else if (avatarFailed) {
          warningText = 'Аватар не загружен. Текстовые данные и картинка бота сохранены.';
        } else {
          warningText = 'Картинка бота не загружена. Текстовые данные и аватар сохранены.';
        }
        showWarning('Ссылка создана (без некоторых картинок)', warningText);
      } else {
        showSuccess('Ссылка создана', 'Действует 7 дней');
      }
    } catch (error) {
      console.error('Failed to create share link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось создать ссылку';
      showWarning('Ошибка', errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  // Показ модалки валидации перед скачиванием
  const handleDownload = () => {
    setShowDownloadValidationModal(true);
  };

  // Фактическое скачивание (вызывается после подтверждения)
  const performDownload = () => {
    setShowDownloadValidationModal(false);
    handleExport();
  };

  // Проверка, пуста ли форма
  const isFormEmpty = () => {
    return (
      !username.trim() &&
      !botName.trim() &&
      !shortDescription.trim() &&
      !description.trim() &&
      !about.trim() &&
      !privacyPolicyUrl.trim() &&
      !firstMessageText.trim() &&
      !inlineButtonText.trim() &&
      !inlineButtonResponse.trim() &&
      !avatarUrl &&
      !botPicUrl
    );
  };

  // Загрузка демо-данных
  const loadDemoData = () => {
    setUsername('example_conf_bot');
    setBotName('Ассистент Конференции');
    setShortDescription('Помощник участника конференции');
    setDescription(`Добро пожаловать!

Я помогу вам:
📋 Узнать программу мероприятия
🎤 Найти информацию о спикерах
📍 Сориентироваться по площадке
❓ Ответить на частые вопросы

Выберите нужный раздел в меню или напишите вопрос`);
    setAbout('Официальный бот конференции · t.me/example_link');
    setPrivacyPolicyUrl('https://example.com/privacy');
    setFirstMessageText(`Добро пожаловать!

Нажмите кнопку ниже, чтобы узнать программу.`);
    setInlineButtonText('📋 Программа');
    setInlineButtonResponse(`Программа конференции

9:00 — Регистрация, кофе
10:00 — Открытие, приветствие
10:30 — Основной доклад
12:00 — Перерыв
12:30 — Секционные выступления
14:00 — Обед
15:00 — Воркшопы
17:00 — Нетворкинг`);
    setAvatarUrl(generateDemoAvatar());
    setBotPicUrl(generateDemoBotPic());
    setShowDemoConfirm(false);
  };

  // Обработчик клика на "Демо-данные"
  const handleDemoClick = () => {
    if (isFormEmpty()) {
      // Форма пуста - загружаем сразу
      loadDemoData();
    } else {
      // Есть данные - спрашиваем подтверждение
      setShowDemoConfirm(true);
    }
  };

  // Общие пропсы для TelegramPhone
  const telegramPhoneProps = {
    username,
    botName,
    shortDescription,
    description,
    about,
    privacyPolicyUrl,
    avatar: avatarUrl || undefined,
    botPic: botPicUrl || undefined,
    focusedField,
    highlightField,
    showBotPicPlaceholder,
    showPrivacyPolicyPlaceholder,
    showFirstMessagePlaceholder,
    showInlineButtonPlaceholder,
    highlightAvatar,
    avatarError,
    avatarWarning,
    onFieldHover: handlePreviewFieldHover,
    firstMessage: firstMessageText
      ? {
          text: firstMessageText,
          inlineButton: inlineButtonText
            ? {
                text: inlineButtonText,
                response: inlineButtonResponse,
              }
            : undefined,
        }
      : undefined,
    formData: {
      username,
      botName,
      shortDescription,
      description,
      about,
      privacyPolicyUrl,
      firstMessageText,
      inlineButtonText,
      inlineButtonResponse,
      avatarUrl,
      botPicUrl
    },
    onDownload: handleDownload
  };

  return (
    <>
      {/* Loading Overlay для загрузки share-данных */}
      {isHydrating && window.location.hash.startsWith('#share=') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <div className="mb-4">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Загрузка конфигурации...</h2>
            <p className="text-sm text-gray-600">Получаем данные из публичной ссылки</p>
          </div>
        </div>
      )}

      {/* MOBILE LAYOUT (< 1024px) */}
      <div className="min-h-screen bg-gray-50 lg:hidden flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            TG Bot Setup
          </h1>
          <span
            onClick={() => setShowChangelogModal(true)}
            className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
            title="История версий"
          >
            v{packageJson.version}
          </span>
        </header>

        {/* Tabs */}
        <MobileTabs
          activeTab={mobileActiveTab}
          onTabChange={setMobileActiveTab}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {mobileActiveTab === 'form' && (
            <div className="p-4 pb-24">
              {/* Демо/Импорт/Очистить кнопки */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => {
                    setUsername('example_conf_bot');
                    setBotName('Ассистент Конференции');
                    setShortDescription('Помощник участника конференции');
                    setDescription(`Добро пожаловать!\n\nЯ помогу вам:\n📋 Узнать программу\n🎤 Найти спикеров\n📍 Сориентироваться`);
                    setAbout('Официальный бот конференции');
                    setPrivacyPolicyUrl('https://example.com/privacy');
                    setFirstMessageText('Добро пожаловать!\n\nНажмите кнопку ниже.');
                    setInlineButtonText('📋 Программа');
                    setInlineButtonResponse('Программа конференции\n\n9:00 — Регистрация\n10:00 — Открытие');
                    setAvatarUrl(generateDemoAvatar());
                    setBotPicUrl(generateDemoBotPic());
                  }}
                  className="px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded-lg"
                >
                  Демо
                </button>
                <button
                  onClick={handleImportClick}
                  className="px-3 py-2 text-sm border border-green-300 text-green-600 rounded-lg"
                >
                  Импорт
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg"
                >
                  Очистить
                </button>
              </div>

              {/* Форма - упрощённая для мобильных */}
              <div className="space-y-4">
                {/* Имя бота */}
                <div>
                  <input
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder="Имя бота"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{botName.length}/64</div>
                </div>

                {/* Короткое описание */}
                <div>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Короткое описание"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{shortDescription.length}/120</div>
                </div>

                {/* Аватар */}
                <AvatarUpload
                  avatarUrl={avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  onValidationChange={(err, warn) => {
                    setAvatarError(err);
                    setAvatarWarning(warn);
                  }}
                />

                {/* О боте */}
                <div>
                  <input
                    type="text"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="О боте"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{about.length}/120</div>
                </div>

                {/* Username */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username_bot"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Description Picture */}
                <BotPicUpload
                  botPicUrl={botPicUrl}
                  onBotPicChange={handleBotPicChange}
                />

                {/* Описание */}
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Описание (что умеет бот)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{description.length}/512</div>
                </div>

                {/* Первое сообщение */}
                <div>
                  <textarea
                    value={firstMessageText}
                    onChange={(e) => setFirstMessageText(e.target.value)}
                    placeholder="Первое сообщение (опционально)"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Inline кнопка */}
                <div>
                  <input
                    type="text"
                    value={inlineButtonText}
                    onChange={(e) => setInlineButtonText(e.target.value)}
                    placeholder="Текст кнопки (опционально)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {inlineButtonText && (
                  <div>
                    <textarea
                      value={inlineButtonResponse}
                      onChange={(e) => setInlineButtonResponse(e.target.value)}
                      placeholder="Ответ на кнопку"
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {mobileActiveTab === 'preview' && (
            <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 pt-4">
              {/* Mode Switcher */}
              <MobilePreviewSwitcher
                mode={mobilePreviewMode}
                onModeChange={setMobilePreviewMode}
              />

              {/* Phone Preview */}
              <div className="flex-1 flex items-center justify-center px-4 pb-24">
                <TelegramPhone
                  {...telegramPhoneProps}
                  isMobile={true}
                  externalMode={mobilePreviewMode}
                  onModeChange={setMobilePreviewMode}
                />
              </div>
            </div>
          )}
        </main>

        {/* Fixed Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            {/* Share Button - PRIMARY (hidden if Supabase not configured) */}
            {isSupabaseConfigured && (
              <button
                onClick={handleShare}
                disabled={isHydrating || isSharing}
                className={`flex-1 py-3 rounded-xl font-medium shadow-lg transition-transform flex items-center justify-center gap-2 ${
                  isHydrating || isSharing
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white active:scale-[0.98]'
                }`}
              >
                {isSharing && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSharing ? (isSharingLong ? 'Ещё немного...' : 'Загрузка...') : '🔗 Поделиться'}
              </button>
            )}
            {/* Download Button - SECONDARY */}
            <button
              onClick={handleExport}
              disabled={isHydrating || isSharing}
              className={`flex-1 py-3 rounded-xl font-medium transition-transform ${
                isHydrating || isSharing
                  ? 'border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-2 border-green-600 text-green-600 bg-white active:scale-[0.98]'
              }`}
            >
              📦 Скачать
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (>= 1024px) */}
      <div className="min-h-screen bg-gray-50 hidden lg:block">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Telegram Bot Visual Setup
            </h1>
            <span className="text-sm text-gray-500">
              — заполните настройки и проверьте превью
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span
              onClick={() => setShowChangelogModal(true)}
              className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
              title="История версий"
            >
              v{packageJson.version}
            </span>
            <span>•</span>
            <span>Автор: Андрей Погорелый</span>
            <span>•</span>
            <a
              href="https://t.me/+vZVUCYuga3plNjYy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              @toolatetolearn
            </a>
          </div>
        </header>

        {/* Main Layout: Two Columns with ultrawide constraints */}
        <div className="flex justify-center">
          <div className="w-full max-w-[1920px] min-w-[1200px] flex">
            {/* Left Column: Form - Fixed 800px with breathing room for scrollbar */}
            <div className="w-[800px] flex-shrink-0 pl-8 pr-12 py-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
              <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Настройки бота
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleDemoClick}
                    disabled={isHydrating || isSharing}
                    className={`px-3 py-1.5 text-sm border rounded-lg transition-all duration-200 ${
                      isHydrating || isSharing
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-blue-300 text-blue-600 cursor-pointer btn-demo'
                    }`}
                  >
                    Демо-данные
                  </button>
                  <button
                    onClick={handleImportClick}
                    disabled={isHydrating || isSharing}
                    className={`px-3 py-1.5 text-sm border rounded-lg transition-all duration-200 ${
                      isHydrating || isSharing
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-green-300 text-green-600 cursor-pointer btn-import'
                    }`}
                  >
                    Импорт
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    disabled={isHydrating || isSharing}
                    className={`px-3 py-1.5 text-sm border rounded-lg transition-all duration-200 ${
                      isHydrating || isSharing
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-600 cursor-pointer btn-clear'
                    }`}
                  >
                    Очистить
                  </button>
                </div>
              </div>

              {/* Validation Errors Block */}
              {validationErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">
                    ⚠️ Ошибки валидации:
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>
                        <span className="font-medium">{error.field}:</span> {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* === БЛОК 1: Список чатов (ChatList) === */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
                  Список чатов
                </h3>

                {/* Bot Name */}
                <div className="mb-4">
                  <input
                    ref={fieldRefs.botName}
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    onMouseEnter={() => throttledSetHoveredField('botName')}
                    onMouseLeave={() => throttledSetHoveredField(null)}
                    onFocus={() => setInputFocusedField('botName')}
                    onBlur={() => setInputFocusedField(null)}
                    placeholder="Имя бота"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-300 form-input ${getInputBorderClass(botName.length, 64)} ${previewHoveredField === 'botName' ? 'highlight-form-field' : ''}`}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${getCounterColor(botName.length, 64)}`}>
                      {botName.length} / 64
                    </span>
                  </div>
                </div>

                {/* Short Description */}
                <div className="mb-4">
                  <input
                    ref={fieldRefs.shortDescription}
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    onMouseEnter={() => throttledSetHoveredField('shortDescription')}
                    onMouseLeave={() => throttledSetHoveredField(null)}
                    onFocus={() => setInputFocusedField('shortDescription')}
                    onBlur={() => setInputFocusedField(null)}
                    placeholder="Короткое описание"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-300 form-input ${getInputBorderClass(shortDescription.length, 120)} ${previewHoveredField === 'shortDescription' ? 'highlight-form-field' : ''}`}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${getCounterColor(shortDescription.length, 120)}`}>
                      {shortDescription.length} / 120
                    </span>
                  </div>
                </div>

                {/* Avatar Upload */}
                <div ref={fieldRefs.avatar} className={`transition-all duration-300 rounded-lg ${previewHoveredField === 'avatar' ? 'highlight-form-field' : ''}`}>
                  <AvatarUpload
                    avatarUrl={avatarUrl}
                    onAvatarChange={handleAvatarChange}
                    onFocus={() => setHighlightAvatar(true)}
                    onBlur={() => setHighlightAvatar(false)}
                    onHoverStart={() => throttledSetHoveredField('avatar')}
                    onHoverEnd={() => throttledSetHoveredField(null)}
                    onValidationChange={(err, warn) => {
                      setAvatarError(err);
                      setAvatarWarning(warn);
                    }}
                  />
                </div>
              </div>

              {/* === БЛОК 2: Профиль бота === */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
                  Профиль бота
                </h3>

                {/* About */}
                <div className="mb-4">
                  <input
                    ref={fieldRefs.about}
                    type="text"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    onMouseEnter={() => throttledSetHoveredField('about')}
                    onMouseLeave={() => throttledSetHoveredField(null)}
                    onFocus={() => setInputFocusedField('about')}
                    onBlur={() => setInputFocusedField(null)}
                    placeholder="О боте"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-300 form-input ${getInputBorderClass(about.length, 120)} ${previewHoveredField === 'about' ? 'highlight-form-field' : ''}`}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${getCounterColor(about.length, 120)}`}>
                      {about.length} / 120
                    </span>
                  </div>
                </div>

                {/* Username */}
                <div className="mb-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <input
                      ref={fieldRefs.username}
                      type="text"
                      value={username}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        setUsername(value);
                      }}
                      onMouseEnter={() => throttledSetHoveredField('username')}
                      onMouseLeave={() => throttledSetHoveredField(null)}
                      onFocus={() => setInputFocusedField('username')}
                      onBlur={() => setInputFocusedField(null)}
                      placeholder="username_bot"
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-300 form-input ${
                        username.length > 32
                          ? 'border-red-500 focus:ring-red-500'
                          : username.length > 0 && (username.length < 5 || !username.toLowerCase().endsWith('bot'))
                            ? 'border-yellow-500 focus:ring-yellow-500'
                            : 'border-gray-300 focus:ring-blue-500'
                      } ${previewHoveredField === 'username' ? 'highlight-form-field' : ''}`}
                    />
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${getCounterColor(username.length, 32)}`}>
                      {username.length} / 32
                    </span>
                  </div>
                </div>

                {/* Privacy Policy URL */}
                <div className="mb-4">
                  <input
                    ref={fieldRefs.privacyPolicyUrl}
                    type="url"
                    value={privacyPolicyUrl}
                    onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                    onMouseEnter={() => {
                      throttledSetHoveredField('privacyPolicyUrl');
                      if (!privacyPolicyUrl) setShowPrivacyPolicyPlaceholder(true);
                    }}
                    onMouseLeave={() => {
                      throttledSetHoveredField(null);
                      setShowPrivacyPolicyPlaceholder(false);
                    }}
                    onFocus={() => {
                      setInputFocusedField('privacyPolicyUrl');
                      if (!privacyPolicyUrl) setShowPrivacyPolicyPlaceholder(true);
                    }}
                    onBlur={() => {
                      setInputFocusedField(null);
                      setShowPrivacyPolicyPlaceholder(false);
                    }}
                    placeholder="Ссылка на политику конфиденциальности"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-300 form-input ${getInputBorderClass(privacyPolicyUrl.length, 256)} ${previewHoveredField === 'privacyPolicyUrl' ? 'highlight-form-field' : ''}`}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${getCounterColor(privacyPolicyUrl.length, 256)}`}>
                      {privacyPolicyUrl.length} / 256
                    </span>
                  </div>
                </div>
              </div>

              {/* === БЛОК 3: Стартовый экран (до START) === */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">3</span>
                  Стартовый экран
                </h3>

                {/* Description Picture Upload */}
                <div ref={fieldRefs.botPic} className={`transition-all duration-300 rounded-lg ${previewHoveredField === 'botPic' ? 'highlight-form-field' : ''}`}>
                  <BotPicUpload
                    botPicUrl={botPicUrl}
                    onBotPicChange={handleBotPicChange}
                    onFocus={() => setInputFocusedField('botPic')}
                    onHoverStart={() => {
                      throttledSetHoveredField('botPic');
                      setShowBotPicPlaceholder(true);
                    }}
                    onHoverEnd={() => {
                      throttledSetHoveredField(null);
                      setShowBotPicPlaceholder(false);
                    }}
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <textarea
                    ref={(el) => {
                      (fieldRefs.description as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                    }}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      autoResizeTextarea(e.target);
                    }}
                    onMouseEnter={() => throttledSetHoveredField('description')}
                    onMouseLeave={() => throttledSetHoveredField(null)}
                    onFocus={() => setInputFocusedField('description')}
                    onBlur={() => setInputFocusedField(null)}
                    placeholder="Описание"
                    rows={2}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none transition-all duration-300 form-input ${getInputBorderClass(description.length, 512)} ${previewHoveredField === 'description' ? 'highlight-form-field' : ''}`}
                    style={{ minHeight: '60px', overflow: 'hidden' }}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${getCounterColor(description.length, 512)}`}>
                      {description.length} / 512
                    </span>
                  </div>
                </div>
              </div>

              {/* === БЛОК 4: Диалог (после START) === */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">4</span>
                  Диалог (после START)
                </h3>

                {/* First Message Text */}
                <div className="mb-4">
                  <textarea
                    ref={(el) => {
                      (fieldRefs.firstMessageText as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                    }}
                    value={firstMessageText}
                    onChange={(e) => {
                      setFirstMessageText(e.target.value);
                      autoResizeTextarea(e.target);
                    }}
                    onMouseEnter={() => {
                      throttledSetHoveredField('firstMessageText');
                      if (!firstMessageText) setShowFirstMessagePlaceholder(true);
                    }}
                    onMouseLeave={() => {
                      throttledSetHoveredField(null);
                      setShowFirstMessagePlaceholder(false);
                    }}
                    onFocus={() => {
                      setInputFocusedField('firstMessageText');
                      if (!firstMessageText) setShowFirstMessagePlaceholder(true);
                    }}
                    onBlur={() => {
                      setInputFocusedField(null);
                      setShowFirstMessagePlaceholder(false);
                    }}
                    placeholder="Первое сообщение"
                    rows={2}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none transition-all duration-300 form-input ${getInputBorderClass(firstMessageText.length, 4096)} ${previewHoveredField === 'firstMessageText' ? 'highlight-form-field' : ''}`}
                    style={{ minHeight: '60px', overflow: 'hidden' }}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${getCounterColor(firstMessageText.length, 4096)}`}>
                      {firstMessageText.length} / 4096
                    </span>
                  </div>
                </div>

                {/* Inline Button Text */}
                <div className="mb-4">
                  <input
                    ref={fieldRefs.inlineButtonText}
                    type="text"
                    value={inlineButtonText}
                    onChange={(e) => setInlineButtonText(e.target.value)}
                    onMouseEnter={() => {
                      throttledSetHoveredField('inlineButtonText');
                      if (!inlineButtonText) setShowInlineButtonPlaceholder(true);
                    }}
                    onMouseLeave={() => {
                      throttledSetHoveredField(null);
                      setShowInlineButtonPlaceholder(false);
                    }}
                    onFocus={() => {
                      setInputFocusedField('inlineButtonText');
                      if (!inlineButtonText) setShowInlineButtonPlaceholder(true);
                    }}
                    onBlur={() => {
                      setInputFocusedField(null);
                      setShowInlineButtonPlaceholder(false);
                    }}
                    placeholder="Inline-кнопка"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-300 form-input ${getInputBorderClass(inlineButtonText.length, 64)} ${previewHoveredField === 'inlineButtonText' ? 'highlight-form-field' : ''}`}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${getCounterColor(inlineButtonText.length, 64)}`}>
                      {inlineButtonText.length} / 64
                    </span>
                  </div>
                </div>

                {/* Inline Button Response */}
                {inlineButtonText && (
                  <div className="mb-4">
                    <textarea
                      ref={(el) => {
                        (fieldRefs.inlineButtonResponse as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                      }}
                      value={inlineButtonResponse}
                      onChange={(e) => {
                        setInlineButtonResponse(e.target.value);
                        autoResizeTextarea(e.target);
                      }}
                      onMouseEnter={() => throttledSetHoveredField('inlineButtonResponse')}
                      onMouseLeave={() => throttledSetHoveredField(null)}
                      onFocus={() => setInputFocusedField('inlineButtonResponse')}
                      onBlur={() => setInputFocusedField(null)}
                      placeholder="Ответ на кнопку"
                      rows={2}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none transition-all duration-300 form-input ${getInputBorderClass(inlineButtonResponse.length, 4096)} ${previewHoveredField === 'inlineButtonResponse' ? 'highlight-form-field' : ''}`}
                      style={{ minHeight: '60px', overflow: 'hidden' }}
                    />
                    <div className="flex justify-end mt-1">
                      <span className={`text-xs ${getCounterColor(inlineButtonResponse.length, 4096)}`}>
                        {inlineButtonResponse.length} / 4096
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
            </div>

            {/* Right Column: Preview - takes remaining space */}
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 py-8 border-l border-gray-200 flex items-start">
            <TelegramPhone
                  username={username}
                  botName={botName}
                  shortDescription={shortDescription}
                  description={description}
                  about={about}
                  privacyPolicyUrl={privacyPolicyUrl}
                  avatar={avatarUrl || undefined}
                  botPic={botPicUrl || undefined}
                  focusedField={focusedField}
                  highlightField={highlightField}
                  showBotPicPlaceholder={showBotPicPlaceholder}
                  showPrivacyPolicyPlaceholder={showPrivacyPolicyPlaceholder}
                  showFirstMessagePlaceholder={showFirstMessagePlaceholder}
                  showInlineButtonPlaceholder={showInlineButtonPlaceholder}
                  highlightAvatar={highlightAvatar}
                  avatarError={avatarError}
                  avatarWarning={avatarWarning}
                  onFieldHover={handlePreviewFieldHover}
                  firstMessage={
                    firstMessageText
                      ? {
                          text: firstMessageText,
                          inlineButton:
                            inlineButtonText
                              ? {
                                  text: inlineButtonText,
                                  response: inlineButtonResponse,
                                }
                              : undefined,
                        }
                      : undefined
                  }
                  formData={{
                    username,
                    botName,
                    shortDescription,
                    description,
                    about,
                    privacyPolicyUrl,
                    firstMessageText,
                    inlineButtonText,
                    inlineButtonResponse,
                    avatarUrl,
                    botPicUrl
                  }}
                  onDownload={handleExport}
                  onShare={handleShare}
                  isSharing={isSharing}
                />
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Очистить все данные?
              </h3>
              <p className="text-sm text-gray-600">
                Все поля формы будут очищены. Это действие нельзя отменить.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={async () => {
                  setUsername('');
                  setBotName('');
                  setShortDescription('');
                  setDescription('');
                  setAbout('');
                  setPrivacyPolicyUrl('');
                  setFirstMessageText('');
                  setInlineButtonText('');
                  setInlineButtonResponse('');
                  setAvatarUrl(null);
                  setBotPicUrl(null);
                  setValidationErrors([]);
                  setShowClearConfirm(false);

                  if (isIDBSupported) {
                    try {
                      await clearDraft();
                      console.log('Draft cleared from IndexedDB');
                    } catch (error) {
                      console.error('Failed to clear draft:', error);
                    }
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Data Confirmation Modal */}
      {showDemoConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowDemoConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Загрузить демо-данные?
              </h3>
              <p className="text-sm text-gray-600">
                Текущие данные будут заменены демонстрационными.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDemoConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={loadDemoData}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Загрузить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast уведомления */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <SaveIndicator
        saveCount={saveIndicatorCount}
        hasActiveToast={toasts.length > 0}
        hasError={saveError}
      />

      {/* Hidden file input for importing ZIP archives */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Share Validation Modal */}
      <ValidationModal
        isOpen={showShareValidationModal}
        onClose={() => setShowShareValidationModal(false)}
        onConfirm={performShare}
        action="share"
        formData={{
          username,
          botName,
          shortDescription,
          description,
          about,
          privacyPolicyUrl,
          firstMessageText,
          inlineButtonText,
          inlineButtonResponse,
          avatarUrl,
          botPicUrl
        }}
        avatarError={avatarError}
        avatarWarning={avatarWarning}
        isLoading={isSharing}
        isLoadingLong={isSharingLong}
        shareLimitInfo={getShareLimitInfo()}
      />

      {/* Download Validation Modal */}
      <ValidationModal
        isOpen={showDownloadValidationModal}
        onClose={() => setShowDownloadValidationModal(false)}
        onConfirm={performDownload}
        action="download"
        formData={{
          username,
          botName,
          shortDescription,
          description,
          about,
          privacyPolicyUrl,
          firstMessageText,
          inlineButtonText,
          inlineButtonResponse,
          avatarUrl,
          botPicUrl
        }}
        avatarError={avatarError}
        avatarWarning={avatarWarning}
      />

      {/* Share Link Modal */}
      {showShareModal && shareUrl && (
        <div
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 Ссылка создана!</h2>

            <p className="text-sm text-gray-600 mb-4">
              Поделитесь этой ссылкой с коллегами. Действует 7 дней.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <code className="text-sm text-gray-800 break-all">{shareUrl}</code>
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl);
                  showSuccess('Скопировано', 'Ссылка скопирована в буфер обмена');
                  setShowShareModal(false);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                📋 Копировать
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Changelog Modal */}
      {showChangelogModal && (
        <div
          onClick={() => setShowChangelogModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">📜 История версий</h2>

            <div className="space-y-4">
              {/* v1.2.5 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">v1.2.5</span>
                  <span className="text-xs text-gray-500">• текущая версия</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Модалка валидации перед "Поделиться" и "Скачать"</li>
                  <li>Лимит 5 ссылок в день для защиты от спама</li>
                  <li>Приложение работает даже если сервис недоступен</li>
                  <li>Исправлены мелкие баги интерфейса</li>
                </ul>
              </div>

              {/* v1.2.0 */}
              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">v1.2.0</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Функция "Поделиться" с загрузкой конфигурации по ссылке (7 дней)</li>
                  <li>Интеграция с Supabase для хранения картинок</li>
                  <li>Улучшенные hover-эффекты и подсветка полей</li>
                  <li>Анимации загрузки изображений (skeleton)</li>
                  <li>История версий (changelog modal)</li>
                </ul>
              </div>

              {/* v1.1.0 */}
              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">v1.1.0</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Оптимизация hover событий с throttle (50ms)</li>
                  <li>Задержка 2 сек перед скрытием подсказок полей</li>
                  <li>Автоскролл к новым элементам превью</li>
                  <li>Placeholder для пустых полей "Первое сообщение" и "Inline кнопка"</li>
                  <li>Улучшенные анимации и переходы для подсветки</li>
                  <li>Адаптивный layout для ultrawide мониторов</li>
                </ul>
              </div>

              {/* v1.0.3 */}
              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">v1.0.3</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Preload фона чата для ускорения загрузки</li>
                </ul>
              </div>

              {/* v1.0.2 */}
              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">v1.0.2</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Исправлена ссылка на GitHub Pages зеркало</li>
                </ul>
              </div>

              {/* v1.0.1 */}
              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">v1.0.1</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Обновлены демо-данные</li>
                </ul>
              </div>

              {/* v1.0.0 */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">v1.0.0</span>
                  <span className="text-xs text-green-600 font-medium">• первый релиз</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Визуальная настройка Telegram бота</li>
                  <li>Live превью с интерактивным диалогом</li>
                  <li>Загрузка аватара и description picture</li>
                  <li>Валидация полей по требованиям Telegram API</li>
                  <li>Автосохранение в IndexedDB</li>
                  <li>Экспорт в ZIP архив</li>
                  <li>Подсветка полей при hover</li>
                  <li>Toast уведомления</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowChangelogModal(false)}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
