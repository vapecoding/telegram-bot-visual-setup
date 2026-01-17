import { useState } from 'react';

interface BotProfileProps {
  username: string;
  botName: string;
  about: string;
  privacyPolicyUrl?: string;
  avatar?: string;
  highlightAvatar?: boolean;
  focusedField?: string | null;
  onFieldHover?: (field: string | null) => void;
}

// Получить первую букву (пропуская эмодзи)
const getInitial = (name: string) => {
  const match = name.match(/[a-zA-Zа-яА-ЯёЁ]/);
  return match ? match[0].toUpperCase() : 'B';
};

// Преобразовать текст с URL в элементы с кликабельными ссылками
const renderTextWithLinks = (text: string) => {
  // Регулярка для URL: https://, http://, t.me/, @username
  const urlRegex = /(https?:\/\/[^\s]+|t\.me\/[^\s]+|@[a-zA-Z0-9_]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    // Проверяем, является ли часть ссылкой
    if (part.match(/^https?:\/\//)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {part}
        </a>
      );
    }
    if (part.match(/^t\.me\//)) {
      return (
        <a
          key={index}
          href={`https://${part}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {part}
        </a>
      );
    }
    if (part.match(/^@[a-zA-Z0-9_]+$/)) {
      return (
        <a
          key={index}
          href={`https://t.me/${part.slice(1)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export function BotProfile({ username, botName, about, privacyPolicyUrl, avatar, highlightAvatar, focusedField, onFieldHover }: BotProfileProps) {
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);

  const handleAvatarClick = () => {
    if (avatar) {
      setIsAvatarExpanded(!isAvatarExpanded);
    }
  };

  // Адаптивный размер текста для длинных имён
  const getNameSizeClass = (name: string) => {
    const len = name.length;
    if (len <= 15) return 'text-xl';
    if (len <= 25) return 'text-lg';
    if (len <= 35) return 'text-base';
    return 'text-sm';
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm h-full overflow-y-auto">
      {/* Expanded Avatar View - аватарка на весь хедер */}
      {isAvatarExpanded && avatar ? (
        <>
          {/* Avatar as header background */}
          <div className="relative">
            {/* Back button overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between">
              <button
                onClick={handleAvatarClick}
                className="text-white text-xl opacity-80 hover:opacity-100 drop-shadow-lg"
              >
                ←
              </button>
              <button className="text-white text-lg opacity-80 drop-shadow-lg">⋮</button>
            </div>

            {/* Full-width avatar image */}
            <div
              onClick={handleAvatarClick}
              className="cursor-pointer w-full"
              style={{ aspectRatio: '1 / 1' }}
            >
              <img
                src={avatar}
                alt={botName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name overlay at bottom of avatar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
              <p className={`text-white ${getNameSizeClass(botName)} font-semibold drop-shadow-lg truncate`}>
                {botName || 'Имя бота'}
              </p>
              <p className="text-white/80 text-sm drop-shadow">bot</p>
            </div>
          </div>

          {/* Action Buttons - под аватаркой */}
          <div className="bg-[#5288c1] px-4 py-3">
            <div className="flex justify-center gap-2 opacity-60">
              <button className="flex-1 max-w-[72px] py-2 flex flex-col items-center gap-1 rounded-xl border border-white/30">
                <span className="text-white text-lg">💬</span>
                <span className="text-[10px] text-white">Написать</span>
              </button>
              <button className="flex-1 max-w-[72px] py-2 flex flex-col items-center gap-1 rounded-xl border border-white/30">
                <span className="text-white text-lg">🔕</span>
                <span className="text-[10px] text-white">Вкл. звук</span>
              </button>
              <button className="flex-1 max-w-[72px] py-2 flex flex-col items-center gap-1 rounded-xl border border-white/30">
                <span className="text-white text-lg">↗</span>
                <span className="text-[10px] text-white">Поделиться</span>
              </button>
              <button className="flex-1 max-w-[72px] py-2 flex flex-col items-center gap-1 rounded-xl border border-white/30">
                <span className="text-white text-lg">⊝</span>
                <span className="text-[10px] text-white">Стоп</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Default View - синий хедер с круглой аватаркой */}
          {/* Header with back button */}
          <div className="bg-[#5288c1] text-white px-4 py-3 flex items-center gap-3 overflow-hidden">
            <button className="text-xl opacity-40">←</button>
            <span className="font-medium opacity-40">Инфо</span>
            <div className="ml-auto flex gap-3 opacity-40">
              <button className="text-lg">✎</button>
              <button className="text-lg">⋮</button>
            </div>
          </div>

          {/* Profile Header */}
          <div className="bg-[#5288c1] px-4 pb-4 pt-4 text-center overflow-hidden">
            {/* Avatar */}
            <div
              onClick={handleAvatarClick}
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center text-white font-bold text-4xl mb-3 overflow-hidden transition-all duration-300 preview-editable ${
                avatar ? 'cursor-pointer hover:opacity-80' : ''
              } ${highlightAvatar ? 'highlight-avatar-pulse' : ''}`}
              title={avatar ? 'Нажмите для просмотра в полном размере' : ''}
              onMouseEnter={() => onFieldHover?.('avatar')}
              onMouseLeave={() => onFieldHover?.(null)}
            >
              {avatar ? (
                <img src={avatar} alt={botName} className="w-full h-full object-cover" />
              ) : (
                getInitial(botName)
              )}
            </div>

            {/* Bot Name */}
            <div
              className="px-2 mb-1 preview-editable"
              onMouseEnter={() => onFieldHover?.('botName')}
              onMouseLeave={() => onFieldHover?.(null)}
            >
              <h2 className={`text-white ${getNameSizeClass(botName)} font-semibold transition-all duration-300 truncate ${focusedField === 'botName' ? 'highlight-pulse-light' : ''}`}>
                {botName || 'Имя бота'}
              </h2>
            </div>
            <p className="text-white/80 text-sm mb-4">бот</p>

            {/* Action Buttons - на синем фоне как в Telegram */}
            <div className="flex justify-center gap-2 opacity-60">
              <button className="flex-1 max-w-[72px] py-2 flex flex-col items-center gap-1 rounded-xl border border-white/30">
                <span className="text-white text-lg">💬</span>
                <span className="text-[10px] text-white">Написать</span>
              </button>
              <button className="flex-1 max-w-[72px] py-2 flex flex-col items-center gap-1 rounded-xl border border-white/30">
                <span className="text-white text-lg">🔕</span>
                <span className="text-[10px] text-white">Вкл. звук</span>
              </button>
              <button className="flex-1 max-w-[72px] py-2 flex flex-col items-center gap-1 rounded-xl border border-white/30">
                <span className="text-white text-lg">↗</span>
                <span className="text-[10px] text-white">Поделиться</span>
              </button>
              <button className="flex-1 max-w-[72px] py-2 flex flex-col items-center gap-1 rounded-xl border border-white/30">
                <span className="text-white text-lg">⊝</span>
                <span className="text-[10px] text-white">Стоп</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* About Section */}
      <div
        className="px-4 py-3 border-b border-gray-200 preview-editable"
        onMouseEnter={() => onFieldHover?.('about')}
        onMouseLeave={() => onFieldHover?.(null)}
      >
        <p className={`text-gray-900 whitespace-pre-wrap break-words transition-all duration-300 rounded px-1 -mx-1 ${
          focusedField === 'about' ? 'highlight-pulse-shadow' : ''
        }`}>
          {about ? renderTextWithLinks(about) : 'Текст "О боте" отображается здесь. Максимум 120 символов.'}
        </p>
        <p className="text-xs text-gray-500 mt-1">О боте</p>
      </div>

      {/* Username */}
      <div
        className="px-4 py-3 border-b border-gray-200 flex items-center justify-between preview-editable"
        onMouseEnter={() => onFieldHover?.('username')}
        onMouseLeave={() => onFieldHover?.(null)}
      >
        <div>
          <p className={`text-blue-600 transition-all duration-300 rounded px-1 -mx-1 ${
            focusedField === 'username' ? 'highlight-pulse-shadow' : ''
          }`}>@{username || 'username_bot'}</p>
          <p className="text-xs text-gray-500 mt-1">Username</p>
        </div>
        <button className="w-6 h-6 flex items-center justify-center opacity-40">
          <span className="text-gray-400">⋮⋮</span>
        </button>
      </div>

      {/* Privacy Policy */}
      {privacyPolicyUrl && (
        <div
          className="px-4 py-3 border-b border-gray-200 preview-editable"
          onMouseEnter={() => onFieldHover?.('privacyPolicyUrl')}
          onMouseLeave={() => onFieldHover?.(null)}
        >
          <a
            href={privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-blue-600 hover:underline text-sm transition-all duration-300 rounded px-1 -mx-1 inline-block ${
              focusedField === 'privacyPolicyUrl' ? 'highlight-pulse-shadow' : ''
            }`}
          >
            Политика конфиденциальности
          </a>
        </div>
      )}

    </div>
  );
}
