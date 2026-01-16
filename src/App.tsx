import { useState } from 'react';
import { MobileBlocker } from './components/MobileBlocker';
import { TelegramPhone } from './components/preview/TelegramPhone';
import { AvatarUpload } from './components/AvatarUpload';
import { BotPicUpload } from './components/BotPicUpload';
import { validateBotSettings } from './schemas/botSettings';

function App() {
  const [botName, setBotName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
  const [firstMessageText, setFirstMessageText] = useState('');
  const [inlineButtonText, setInlineButtonText] = useState('');
  const [inlineButtonResponse, setInlineButtonResponse] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [botPicUrl, setBotPicUrl] = useState<string | null>(null);
  const [botPicFile, setBotPicFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);

  // Handler для изменения аватара
  const handleAvatarChange = (url: string | null, file: File | null) => {
    setAvatarUrl(url);
    setAvatarFile(file);
  };

  // Handler для изменения BotPic
  const handleBotPicChange = (url: string | null, file: File | null) => {
    setBotPicUrl(url);
    setBotPicFile(file);
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
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Telegram Bot Settings Viewer
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Заполните настройки бота и проверьте как они будут выглядеть в Telegram
          </p>
        </header>

        {/* Main Layout: Two Columns */}
        <div className="flex">
          {/* Left Column: Form */}
          <div className="w-1/2 p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 88px)' }}>
            <div className="max-w-xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Настройки бота
              </h2>

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

              {/* Bot Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя бота (Display Name)
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
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

              {/* Avatar Upload */}
              <AvatarUpload
                avatarUrl={avatarUrl}
                onAvatarChange={handleAvatarChange}
              />

              {/* BotPic Upload */}
              <BotPicUpload
                botPicUrl={botPicUrl}
                onBotPicChange={handleBotPicChange}
              />

              {/* Short Description */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Короткое описание (Short Description)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShortDescription(about)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                    disabled={!about}
                  >
                    Скопировать из About
                  </button>
                </div>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
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

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание (Description)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Здравствуйте! Я ваш цифровой помощник на форум-выставке..."
                  maxLength={512}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none ${getInputBorderClass(description.length, 512)}`}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Отображается на стартовом экране в разделе "What can this bot do?"
                  </p>
                  <span className={`text-xs ${getCounterColor(description.length, 512)}`}>
                    {description.length} / 512
                  </span>
                </div>
              </div>

              {/* About */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  О боте (About)
                </label>
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Цифровой помощник выставки"
                  maxLength={120}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${getInputBorderClass(about.length, 120)}`}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Отображается в профиле бота
                  </p>
                  <span className={`text-xs ${getCounterColor(about.length, 120)}`}>
                    {about.length} / 120
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

              {/* First Message Section */}
              <div className="mb-6 pt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  First Message (после нажатия START)
                </h3>

                {/* First Message Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текст первого сообщения
                  </label>
                  <textarea
                    value={firstMessageText}
                    onChange={(e) => setFirstMessageText(e.target.value)}
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
                  📦 Скачать архив
                </button>
                <button
                  onClick={() => {
                    if (confirm('Очистить все поля формы?')) {
                      setBotName('');
                      setShortDescription('');
                      setDescription('');
                      setAbout('');
                      setPrivacyPolicyUrl('');
                      setFirstMessageText('');
                      setInlineButtonText('');
                      setInlineButtonResponse('');
                      setAvatarUrl(null);
                      setAvatarFile(null);
                      setBotPicUrl(null);
                      setBotPicFile(null);
                      setValidationErrors([]);
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  🗑️ Очистить
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 p-8 border-l border-gray-200">
            <TelegramPhone
                  botName={botName}
                  shortDescription={shortDescription}
                  description={description}
                  about={about}
                  privacyPolicyUrl={privacyPolicyUrl}
                  avatar={avatarUrl || undefined}
                  botPic={botPicUrl || undefined}
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
    </>
  );
}

export default App;
