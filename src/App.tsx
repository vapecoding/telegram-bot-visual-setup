import { useState, useEffect, useRef } from 'react';
import { MobileBlocker } from './components/MobileBlocker';
import { TelegramPhone } from './components/preview/TelegramPhone';
import { AvatarUpload } from './components/AvatarUpload';
import { BotPicUpload } from './components/BotPicUpload';
import { validateBotSettings } from './schemas/botSettings';
import { isIndexedDBSupported, loadDraft, saveDraft, clearDraft } from './utils/indexedDB';

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
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
  const [firstMessageText, setFirstMessageText] = useState('');
  const [inlineButtonText, setInlineButtonText] = useState('');
  const [inlineButtonResponse, setInlineButtonResponse] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [botPicUrl, setBotPicUrl] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // IndexedDB состояния
  const [isHydrating, setIsHydrating] = useState(true); // Защита от race condition
  const [isIDBSupported] = useState(isIndexedDBSupported());
  const saveTimeoutRef = useRef<number | null>(null);

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

  // Восстановление черновика при загрузке
  useEffect(() => {
    async function hydrate() {
      if (!isIDBSupported) {
        setIsHydrating(false);
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

          console.log('Draft restored from IndexedDB');
        }
      } catch (error) {
        console.error('Failed to restore draft:', error);
      } finally {
        setIsHydrating(false);
      }
    }

    hydrate();
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
    saveTimeoutRef.current = window.setTimeout(() => {
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

      saveDraft(draft).catch((error) => {
        console.error('Failed to save draft:', error);
      });
    }, 2000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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
    isIDBSupported
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

  // Обработка экспорта с валидацией
  const handleExport = () => {
    // Собираем данные из формы
    const formData = {
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
      } : undefined
    };

    // Валидация через Zod
    const result = validateBotSettings(formData);

    if (!result.success) {
      setValidationErrors(result.errors || []);
      // Скролл к первой ошибке
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Успешная валидация
    setValidationErrors([]);
    alert('✅ Валидация прошла успешно! (Генерация ZIP будет на следующем этапе)');
    console.log('Validated data:', result.data);
  };

  return (
    <>
      <MobileBlocker />

      <div className="min-h-screen bg-gray-50 hidden lg:block">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            Telegram Bot Settings Viewer
          </h1>
          <span className="text-sm text-gray-500">
            — заполните настройки и проверьте превью
          </span>
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
                      setAbout('🤖 Официальный бот выставки · t.me/expo2026');
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
                    className="px-3 py-1.5 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Демо-данные
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
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
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя бота (Display Name)
                  </label>
                  <input
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    onFocus={() => setFocusedField('botName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Мой Помощник"
                    maxLength={64}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${getInputBorderClass(botName.length, 64)}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Отображаемое имя бота. Может содержать любые символы (кириллица, эмодзи)
                    </p>
                    <span className={`text-xs ${getCounterColor(botName.length, 64)}`}>
                      {botName.length} / 64
                    </span>
                  </div>
                </div>

                {/* Short Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Короткое описание (Short Description)
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    onFocus={() => setFocusedField('shortDescription')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ваш цифровой помощник на выставке"
                    maxLength={120}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${getInputBorderClass(shortDescription.length, 120)}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Отображается в списке контактов, ссылке t.me/botname и поиске
                    </p>
                    <span className={`text-xs ${getCounterColor(shortDescription.length, 120)}`}>
                      {shortDescription.length} / 120
                    </span>
                  </div>
                </div>

                {/* Avatar Upload */}
                <AvatarUpload
                  avatarUrl={avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  onFocus={() => {
                    // Форсим обновление чтобы переключить режим даже если уже 'avatar'
                    setFocusedField(null);
                    setTimeout(() => setFocusedField('avatar'), 0);
                  }}
                />
              </div>

              {/* === БЛОК 2: Профиль бота === */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
                  Профиль бота
                </h3>

                {/* About */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    О боте (About)
                  </label>
                  <input
                    type="text"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    onFocus={() => setFocusedField('about')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Официальный бот выставки · t.me/expo_channel"
                    maxLength={120}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${getInputBorderClass(about.length, 120)}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Отображается в профиле бота. Ссылки кликабельны.
                    </p>
                    <span className={`text-xs ${getCounterColor(about.length, 120)}`}>
                      {about.length} / 120
                    </span>
                  </div>
                </div>

                {/* Username */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username бота
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        // Автоматически приводим к lowercase и убираем недопустимые символы
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        setUsername(value);
                      }}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="my_helper_bot"
                      maxLength={32}
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                        username.length > 0 && (username.length < 5 || !username.toLowerCase().endsWith('bot'))
                          ? 'border-yellow-500 focus:ring-yellow-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      5-32 символа, латиница/цифры/_, должен заканчиваться на "bot"
                    </p>
                    <span className={`text-xs ${getCounterColor(username.length, 32)}`}>
                      {username.length} / 32
                    </span>
                  </div>
                </div>

                {/* Privacy Policy URL */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Политика конфиденциальности (Privacy Policy URL)
                  </label>
                  <input
                    type="url"
                    value={privacyPolicyUrl}
                    onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                    onFocus={() => setFocusedField('privacyPolicyUrl')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="https://example.com/privacy"
                    maxLength={256}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${getInputBorderClass(privacyPolicyUrl.length, 256)}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Ссылка на политику конфиденциальности (отображается в профиле бота)
                    </p>
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
                <BotPicUpload
                  botPicUrl={botPicUrl}
                  onBotPicChange={handleBotPicChange}
                  onFocus={() => setFocusedField('botPic')}
                />

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание (Description)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setFocusedField('description')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Здравствуйте! Я ваш цифровой помощник на форум-выставке..."
                    maxLength={512}
                    rows={6}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none ${getInputBorderClass(description.length, 512)}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Отображается на стартовом экране в разделе "Что умеет этот бот?"
                    </p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текст первого сообщения
                  </label>
                  <textarea
                    value={firstMessageText}
                    onChange={(e) => setFirstMessageText(e.target.value)}
                    onFocus={() => setFocusedField('firstMessageText')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Добро пожаловать! Выберите интересующий раздел:"
                    rows={4}
                    maxLength={4096}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none ${getInputBorderClass(firstMessageText.length, 4096)}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Сообщение, которое бот отправит после нажатия START
                    </p>
                    <span className={`text-xs ${getCounterColor(firstMessageText.length, 4096)}`}>
                      {firstMessageText.length} / 4096
                    </span>
                  </div>
                </div>

                {/* Inline Button Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текст inline-кнопки (опционально)
                  </label>
                  <input
                    type="text"
                    value={inlineButtonText}
                    onChange={(e) => setInlineButtonText(e.target.value)}
                    onFocus={() => setFocusedField('inlineButtonText')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="📋 Выбрать раздел"
                    maxLength={64}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${getInputBorderClass(inlineButtonText.length, 64)}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Кнопка под первым сообщением
                    </p>
                    <span className={`text-xs ${getCounterColor(inlineButtonText.length, 64)}`}>
                      {inlineButtonText.length} / 64
                    </span>
                  </div>
                </div>

                {/* Inline Button Response */}
                {inlineButtonText && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ответ на нажатие кнопки (опционально)
                    </label>
                    <textarea
                      value={inlineButtonResponse}
                      onChange={(e) => setInlineButtonResponse(e.target.value)}
                      onFocus={() => setFocusedField('inlineButtonResponse')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Вы выбрали раздел. Вот доступные опции..."
                      rows={3}
                      maxLength={4096}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none ${getInputBorderClass(inlineButtonResponse.length, 4096)}`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Preview: текст, который увидит пользователь при нажатии на кнопку
                      </p>
                      <span className={`text-xs ${getCounterColor(inlineButtonResponse.length, 4096)}`}>
                        {inlineButtonResponse.length} / 4096
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 sticky bottom-0 bg-gray-50 py-4 -mx-8 px-8">
                <button
                  onClick={handleExport}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Скачать архив
                </button>
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
    </>
  );
}

export default App;
