import { useState, useRef, useEffect } from 'react';

interface FirstMessageProps {
  botName: string;
  description: string;
  text: string;
  inlineButton?: {
    text: string;
    response: string;
  };
  avatar?: string;
  highlightAvatar?: boolean;
  botPic?: string;
  showBotPicPlaceholder?: boolean;
  focusedField?: string | null;
  onFieldHover?: (field: string | null) => void;
  permanentMode?: boolean; // true если пользователь физически нажал START
  stickyMode?: boolean; // true если пользователь уже взаимодействовал с полями диалога
}

// Получить первую букву (пропуская эмодзи)
const getInitial = (name: string) => {
  const match = name.match(/[a-zA-Zа-яА-ЯёЁ]/);
  return match ? match[0].toUpperCase() : 'B';
};

export function FirstMessage({ botName, description, text, inlineButton, avatar, highlightAvatar, botPic, showBotPicPlaceholder, focusedField, onFieldHover, permanentMode, stickyMode }: FirstMessageProps) {
  const [buttonClicked, setButtonClicked] = useState(false);
  // Липкие состояния для элементов внутри компонента
  const [inlineButtonShown, setInlineButtonShown] = useState(false);
  const [buttonResponseShown, setButtonResponseShown] = useState(false);

  // Показываем картинку или placeholder
  const showPicArea = botPic || showBotPicPlaceholder;

  // Отслеживаем, когда элементы должны стать "липкими"
  useEffect(() => {
    if (focusedField === 'inlineButtonText' || focusedField === 'inlineButtonResponse') {
      setInlineButtonShown(true);
    }
    if (focusedField === 'inlineButtonResponse') {
      setButtonResponseShown(true);
    }
  }, [focusedField]);

  // В stickyMode показываем всё что было показано + всё что сейчас в фокусе
  // permanentMode = пользователь нажал START, показываем всё
  const showStartCommand = permanentMode || stickyMode || focusedField === 'firstMessageText';
  const showFirstMessage = permanentMode || stickyMode || focusedField === 'firstMessageText';

  // Inline кнопка: permanentMode, stickyMode + липкое состояние, или текущий фокус
  const showInlineButton = permanentMode || (stickyMode && inlineButtonShown) || focusedField === 'inlineButtonText' || focusedField === 'inlineButtonResponse';

  // Ответ: permanentMode + клик, stickyMode + липкое состояние, или текущий фокус
  const showButtonResponse = (permanentMode && buttonClicked) || (stickyMode && buttonResponseShown) || focusedField === 'inlineButtonResponse';

  // Refs для автоскролла
  const botPicRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<HTMLDivElement>(null);
  const inlineButtonRef = useRef<HTMLDivElement>(null);
  const buttonResponseRef = useRef<HTMLDivElement>(null);

  // Автоскролл к элементу при фокусе на поле
  useEffect(() => {
    const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    if (focusedField === 'botPic' && botPicRef.current) {
      scrollToRef(botPicRef);
    } else if (focusedField === 'description' && descriptionRef.current) {
      scrollToRef(descriptionRef);
    } else if (focusedField === 'firstMessageText' && firstMessageRef.current) {
      scrollToRef(firstMessageRef);
    } else if (focusedField === 'inlineButtonText' && inlineButtonRef.current) {
      scrollToRef(inlineButtonRef);
    } else if (focusedField === 'inlineButtonResponse' && buttonResponseRef.current) {
      scrollToRef(buttonResponseRef);
    }
  }, [focusedField]);

  // Автоскролл к ответу после нажатия на кнопку
  useEffect(() => {
    if (buttonClicked && buttonResponseRef.current) {
      setTimeout(() => {
        buttonResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [buttonClicked]);

  // Автоскролл к первому сообщению при монтировании (после нажатия START)
  useEffect(() => {
    if (firstMessageRef.current) {
      setTimeout(() => {
        firstMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, []);

  // Сегодняшняя дата
  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' });

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#5288c1] text-white px-4 py-3 flex items-center gap-3 overflow-hidden">
        <button className="text-xl opacity-40">←</button>
        <div
          className={`w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm overflow-hidden flex-shrink-0 transition-all duration-300 preview-editable ${
            highlightAvatar ? 'highlight-avatar-pulse' : ''
          }`}
          onMouseEnter={() => onFieldHover?.('avatar')}
          onMouseLeave={() => onFieldHover?.(null)}
        >
          {avatar ? (
            <img src={avatar} alt={botName} className="w-full h-full object-cover" />
          ) : (
            getInitial(botName)
          )}
        </div>
        <div
          className="flex-1 min-w-0 preview-editable"
          onMouseEnter={() => onFieldHover?.('botName')}
          onMouseLeave={() => onFieldHover?.(null)}
        >
          <h3 className={`font-medium truncate transition-all duration-300 ${
            focusedField === 'botName' ? 'highlight-pulse-light' : ''
          }`}>{botName || 'Имя бота'}</h3>
          <p className="text-xs text-white/60">бот</p>
        </div>
        <button className="text-lg opacity-40">⋮</button>
      </div>

      {/* Chat Background - Telegram default pattern */}
      <div
        className="flex-1 p-4 relative overflow-auto"
        style={{
          backgroundImage: 'url(/telegram-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Description Picture (приветственная картинка) или placeholder */}
        {showPicArea && (
          <div ref={botPicRef} className="max-w-sm mx-auto mb-4">
            <div
              className={`relative rounded-xl overflow-hidden shadow-sm transition-all duration-300 preview-editable ${
                focusedField === 'botPic' || showBotPicPlaceholder ? 'highlight-pic-pulse' : ''
              }`}
              style={{ aspectRatio: '16 / 9' }}
              onMouseEnter={() => onFieldHover?.('botPic')}
              onMouseLeave={() => onFieldHover?.(null)}
            >
              {botPic ? (
                <img
                  src={botPic}
                  alt="Description Picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🖼️</div>
                    <div className="text-xs">Description Picture</div>
                    <div className="text-[10px]">640×360px</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Welcome Card - ИДЕНТИЧНО ChatStart */}
        <div className="bg-white rounded-xl shadow-sm p-4 max-w-sm mx-auto mb-4">
          {/* Profile Photo - скрываем если есть Description Picture или placeholder */}
          {!showPicArea && (
            <div className="flex justify-center mb-3">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden transition-all duration-300 preview-editable ${
                  highlightAvatar ? 'highlight-avatar-pulse' : ''
                }`}
                onMouseEnter={() => onFieldHover?.('avatar')}
                onMouseLeave={() => onFieldHover?.(null)}
              >
                {avatar ? (
                  <img src={avatar} alt={botName} className="w-full h-full object-cover" />
                ) : (
                  getInitial(botName)
                )}
              </div>
            </div>
          )}

          {/* "Что умеет этот бот?" */}
          <h3 className="text-center font-semibold text-gray-900 mb-3">
            Что умеет этот бот?
          </h3>

          {/* Description */}
          <div
            ref={descriptionRef}
            className={`text-sm text-gray-700 whitespace-pre-wrap break-words mb-4 transition-all duration-300 rounded px-1 -mx-1 preview-editable ${
              focusedField === 'description' ? 'highlight-pulse-shadow' : ''
            }`}
            onMouseEnter={() => onFieldHover?.('description')}
            onMouseLeave={() => onFieldHover?.(null)}
          >
            {description || 'Здравствуйте! Я ваш цифровой помощник...'}
          </div>
        </div>

        {/* Date separator - НА МЕСТЕ кнопки START */}
        <div className="flex justify-center mb-4">
          <span className="bg-black/20 text-white text-xs px-3 py-1 rounded-full">
            {dateStr}
          </span>
        </div>

        {/* User's /start command (outgoing message - right side, in bubble) */}
        {showStartCommand && (
          <div className="flex justify-end mb-3">
            <div className="bg-[#EEFFDE] rounded-2xl shadow-sm px-3 py-1.5">
              <span className="text-sm text-gray-900">/start</span>
              <span className="text-[10px] text-gray-500 ml-2">
                {today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] text-green-600 ml-0.5">✓✓</span>
            </div>
          </div>
        )}

        {/* Bot's welcome message (incoming - left side) */}
        {showFirstMessage && text && (
          <div ref={firstMessageRef} className="flex gap-2 mb-3">
            {/* Bot avatar */}
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0 overflow-hidden transition-all duration-300 preview-editable ${
                highlightAvatar ? 'highlight-avatar-pulse' : ''
              }`}
              onMouseEnter={() => onFieldHover?.('avatar')}
              onMouseLeave={() => onFieldHover?.(null)}
            >
              {avatar ? (
                <img src={avatar} alt={botName} className="w-full h-full object-cover" />
              ) : (
                getInitial(botName)
              )}
            </div>
            <div
              className="bg-white rounded-2xl shadow-sm p-3 max-w-[75%] preview-editable"
              onMouseEnter={() => onFieldHover?.('firstMessageText')}
              onMouseLeave={() => onFieldHover?.(null)}
            >
              <div className={`text-sm text-gray-900 whitespace-pre-wrap break-words transition-all duration-300 rounded px-1 -mx-1 ${
                focusedField === 'firstMessageText' ? 'highlight-pulse-shadow' : ''
              }`}>
                {text}
              </div>

              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-gray-500">
                  {today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Inline Button - Telegram style (outside bubble, blurred background) */}
        {showInlineButton && text && inlineButton && inlineButton.text && (
          <div ref={inlineButtonRef} className="flex gap-2 mb-3 ml-10">
            <button
              onClick={() => setButtonClicked(true)}
              onMouseEnter={() => onFieldHover?.('inlineButtonText')}
              onMouseLeave={() => onFieldHover?.(null)}
              className={`flex-1 py-2.5 px-4 text-center text-sm text-white font-medium rounded-xl
                bg-black/10 backdrop-blur-[2px] transition-all preview-editable
                ${buttonClicked
                  ? 'bg-black/15 text-white/70'
                  : 'hover:bg-black/20 cursor-pointer active:scale-[0.98]'
                } ${focusedField === 'inlineButtonText' ? 'highlight-button-pulse' : ''}`}
            >
              {inlineButton.text}
            </button>
          </div>
        )}

        {/* Response to inline button click (or when editing response field) */}
        {showButtonResponse && inlineButton && inlineButton.response && (
          <div ref={buttonResponseRef} className="flex gap-2 mb-3">
            {/* Bot avatar */}
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0 overflow-hidden transition-all duration-300 preview-editable ${
                highlightAvatar ? 'highlight-avatar-pulse' : ''
              }`}
              onMouseEnter={() => onFieldHover?.('avatar')}
              onMouseLeave={() => onFieldHover?.(null)}
            >
              {avatar ? (
                <img src={avatar} alt={botName} className="w-full h-full object-cover" />
              ) : (
                getInitial(botName)
              )}
            </div>
            <div
              className="bg-white rounded-2xl shadow-sm p-3 max-w-[75%] preview-editable"
              onMouseEnter={() => onFieldHover?.('inlineButtonResponse')}
              onMouseLeave={() => onFieldHover?.(null)}
            >
              <div className={`text-sm text-gray-900 whitespace-pre-wrap break-words transition-all duration-300 rounded px-1 -mx-1 ${
                focusedField === 'inlineButtonResponse' ? 'highlight-pulse-shadow' : ''
              }`}>
                {inlineButton.response}
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-gray-500">
                  {today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
