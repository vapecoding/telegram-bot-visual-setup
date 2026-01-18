import { useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { MobileBlocker } from './components/MobileBlocker';
import { TelegramPhone } from './components/preview/TelegramPhone';
import { AvatarUpload } from './components/AvatarUpload';
import { BotPicUpload } from './components/BotPicUpload';
import { ToastContainer, SaveIndicator, useToast } from './components/Toast';
// validateBotSettings используется в DownloadModal
import { isIndexedDBSupported, loadDraft, saveDraft, clearDraft } from './utils/indexedDB';

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
  const [showBotPicPlaceholder, setShowBotPicPlaceholder] = useState(false);
  const [highlightAvatar, setHighlightAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarWarning, setAvatarWarning] = useState<string | null>(null);
  const [previewHoveredField, setPreviewHoveredField] = useState<string | null>(null);

  // Вычисляемое активное поле: hover имеет приоритет, но focus сохраняется при редактировании
  const focusedField = hoveredField || inputFocusedField;

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
  const saveTimeoutRef = useRef<number | null>(null);

  // Toast уведомления
  const { toasts, dismissToast, showSuccess, showWarning, showInfo } = useToast();

  // Закрытие модального окна по ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showClearConfirm) {
        setShowClearConfirm(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showClearConfirm]);

  // Скролл к полю формы при наведении на превью
  useEffect(() => {
    if (!previewHoveredField) return;

    const ref = fieldRefs[previewHoveredField as keyof typeof fieldRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [previewHoveredField]);

  // Handler для hover на превью
  const handlePreviewFieldHover = (field: string | null) => {
    setPreviewHoveredField(field);
  };

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

  // Восстановление черновика при загрузке
  useEffect(() => {
    async function hydrate() {
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

          // Toast о восстановлении черновика + блокируем будущий toast сохранения
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

  return (
    <>
      <MobileBlocker />

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

        {/* Main Layout: Two Columns */}
        <div className="flex">
          {/* Left Column: Form */}
          <div className="w-1/2 p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
            <div className="max-w-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Настройки бота
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Демо-данные для всех полей
                      setUsername('expo_helper_bot');
                      setBotName('🤖 Помощник Выставки');
                      setShortDescription('🎪 Ваш гид по выставке технологий');
                      setDescription(`🎉 Добро пожаловать на выставку инноваций!

Я помогу вам:
📍 Найти интересующий стенд
📅 Узнать расписание мероприятий
🎤 Получить информацию о спикерах
🎟 Забронировать место на мастер-класс

Выберите нужный раздел или напишите свой вопрос 👇`);
                      setAbout('🤖 Официальный бот выставки · t.me/demo_bot_example');
                      setPrivacyPolicyUrl('https://expo.example.com/privacy');
                      setFirstMessageText(`Бот запущен! 🎉

Нажмите кнопку ниже, чтобы узнать подробности о выставке.`);
                      setInlineButtonText('📍 О выставке');
                      setInlineButtonResponse(`🏛 Выставка «Технологии Будущего 2026»

📅 Даты: 15-20 января
📍 Место: Экспоцентр, павильон 2
⏰ Часы работы: 10:00 — 20:00

🎟 Вход свободный по регистрации
🔗 expo2026.example.com`);
                      // Генерация демо-картинок
                      setAvatarUrl(generateDemoAvatar());
                      setBotPicUrl(generateDemoBotPic());
                    }}
                    className="px-3 py-1.5 text-sm border border-blue-300 text-blue-600 rounded-lg transition-all duration-200 cursor-pointer btn-demo"
                  >
                    Демо-данные
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg transition-all duration-200 cursor-pointer btn-clear"
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
                    onMouseEnter={() => setHoveredField('botName')}
                    onMouseLeave={() => setHoveredField(null)}
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
                    onMouseEnter={() => setHoveredField('shortDescription')}
                    onMouseLeave={() => setHoveredField(null)}
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
                    onHoverStart={() => setHoveredField('avatar')}
                    onHoverEnd={() => setHoveredField(null)}
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
                    onMouseEnter={() => setHoveredField('about')}
                    onMouseLeave={() => setHoveredField(null)}
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
                      onMouseEnter={() => setHoveredField('username')}
                      onMouseLeave={() => setHoveredField(null)}
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
                    onMouseEnter={() => setHoveredField('privacyPolicyUrl')}
                    onMouseLeave={() => setHoveredField(null)}
                    onFocus={() => setInputFocusedField('privacyPolicyUrl')}
                    onBlur={() => setInputFocusedField(null)}
                    placeholder="Privacy Policy URL"
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
                      setHoveredField('botPic');
                      setShowBotPicPlaceholder(true);
                    }}
                    onHoverEnd={() => {
                      setHoveredField(null);
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
                    onMouseEnter={() => setHoveredField('description')}
                    onMouseLeave={() => setHoveredField(null)}
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
                    onMouseEnter={() => setHoveredField('firstMessageText')}
                    onMouseLeave={() => setHoveredField(null)}
                    onFocus={() => setInputFocusedField('firstMessageText')}
                    onBlur={() => setInputFocusedField(null)}
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
                    onMouseEnter={() => setHoveredField('inlineButtonText')}
                    onMouseLeave={() => setHoveredField(null)}
                    onFocus={() => setInputFocusedField('inlineButtonText')}
                    onBlur={() => setInputFocusedField(null)}
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
                      onMouseEnter={() => setHoveredField('inlineButtonResponse')}
                      onMouseLeave={() => setHoveredField(null)}
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

          {/* Right Column: Preview */}
          <div className="w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 p-8 border-l border-gray-200">
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
                  showBotPicPlaceholder={showBotPicPlaceholder}
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
                />
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

      {/* Toast уведомления */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <SaveIndicator
        saveCount={saveIndicatorCount}
        hasActiveToast={toasts.length > 0}
        hasError={saveError}
      />
    </>
  );
}

export default App;
