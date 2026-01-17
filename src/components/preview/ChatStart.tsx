import { useRef, useEffect } from 'react';

interface ChatStartProps {
  botName: string;
  description: string;
  avatar?: string;
  highlightAvatar?: boolean;
  botPic?: string;
  showBotPicPlaceholder?: boolean;
  onStartClick?: () => void;
  focusedField?: string | null;
  onFieldHover?: (field: string | null) => void;
}

// Получить первую букву (пропуская эмодзи)
const getInitial = (name: string) => {
  const match = name.match(/[a-zA-Zа-яА-ЯёЁ]/);
  return match ? match[0].toUpperCase() : 'B';
};

export function ChatStart({ botName, description, avatar, highlightAvatar, botPic, showBotPicPlaceholder, onStartClick, focusedField, onFieldHover }: ChatStartProps) {
  // Показываем картинку или placeholder
  const showPicArea = botPic || showBotPicPlaceholder;

  // Refs для автоскролла
  const botPicRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

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
    }
  }, [focusedField]);
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

        {/* Welcome Card */}
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

        {/* START button */}
        <div className="flex justify-center">
          <button
            onClick={onStartClick}
            className="bg-[#5288c1] text-white px-12 py-3 rounded-full font-medium shadow-lg transition-all duration-200 cursor-pointer active:scale-95 btn-start"
          >
            START
          </button>
        </div>
      </div>
    </div>
  );
}
