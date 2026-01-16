import { useState } from 'react';

interface BotProfileProps {
  username: string;
  botName: string;
  about: string;
  privacyPolicyUrl?: string;
  avatar?: string;
  focusedField?: string | null;
}

export function BotProfile({ username, botName, about, privacyPolicyUrl, avatar, focusedField }: BotProfileProps) {
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);

  const handleAvatarClick = () => {
    if (avatar) {
      setIsAvatarExpanded(!isAvatarExpanded);
    }
  };

  // Если аватар увеличен - показываем полноэкранный вид
  if (isAvatarExpanded && avatar) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
        {/* Header with back button */}
        <div className="bg-[#5288c1] text-white px-4 py-3 flex items-center gap-3">
          <button className="text-xl">←</button>
          <span className="font-medium">Фото</span>
          <div className="ml-auto flex gap-3">
            <button className="text-lg">↓</button>
            <button className="text-lg">⋮</button>
          </div>
        </div>

        {/* Full-size avatar */}
        <div
          onClick={handleAvatarClick}
          className="flex-1 bg-black flex items-center justify-center cursor-pointer p-4"
        >
          <img
            src={avatar}
            alt={botName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm h-full">
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
      <div className="bg-[#5288c1] px-4 pb-6 pt-4 text-center overflow-hidden">
        {/* Avatar */}
        <div
          onClick={handleAvatarClick}
          className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center text-white font-bold text-4xl mb-3 overflow-hidden ${
            avatar ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
          }`}
          title={avatar ? 'Нажмите для просмотра в полном размере' : ''}
        >
          {avatar ? (
            <img src={avatar} alt={botName} className="w-full h-full object-cover" />
          ) : (
            botName.charAt(0).toUpperCase() || 'B'
          )}
        </div>

        {/* Bot Name */}
        <h2 className={`text-white text-xl font-semibold mb-1 truncate px-2 transition-all duration-300 ${
          focusedField === 'botName' ? 'highlight-pulse-light' : ''
        }`}>
          {botName || 'Имя бота'}
        </h2>
        <p className="text-white/80 text-sm">бот</p>
      </div>

      {/* Action Buttons - не редактируемые */}
      <div className="flex border-b border-gray-200 opacity-40">
        <button className="flex-1 py-4 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            💬
          </div>
          <span className="text-xs text-gray-500">Написать</span>
        </button>
        <button className="flex-1 py-4 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            🔕
          </div>
          <span className="text-xs text-gray-500">Вкл. звук</span>
        </button>
        <button className="flex-1 py-4 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            ↗
          </div>
          <span className="text-xs text-gray-500">Поделиться</span>
        </button>
        <button className="flex-1 py-4 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            ⊝
          </div>
          <span className="text-xs text-gray-500">Стоп</span>
        </button>
      </div>

      {/* About Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className={`text-gray-900 whitespace-pre-wrap break-words transition-all duration-300 rounded px-1 -mx-1 ${
          focusedField === 'about' ? 'highlight-pulse-border' : ''
        }`}>
          {about || 'Текст "О боте" отображается здесь. Максимум 120 символов.'}
        </p>
        <p className="text-xs text-gray-500 mt-1">О боте</p>
      </div>

      {/* Username */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <p className={`text-blue-600 transition-all duration-300 rounded px-1 -mx-1 ${
            focusedField === 'username' ? 'highlight-pulse-border' : ''
          }`}>@{username || 'username_bot'}</p>
          <p className="text-xs text-gray-500 mt-1">Username</p>
        </div>
        <button className="w-6 h-6 flex items-center justify-center opacity-40">
          <span className="text-gray-400">⋮⋮</span>
        </button>
      </div>

      {/* Privacy Policy */}
      {privacyPolicyUrl && (
        <div className="px-4 py-3 border-b border-gray-200">
          <a
            href={privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-blue-600 hover:underline text-sm transition-all duration-300 rounded px-1 -mx-1 inline-block ${
              focusedField === 'privacyPolicyUrl' ? 'highlight-pulse-border' : ''
            }`}
          >
            Политика конфиденциальности
          </a>
        </div>
      )}

      {/* Additional Info - не редактируемое */}
      <div className="px-4 py-3 opacity-40">
        <button className="w-full text-left py-2 flex items-center gap-3">
          <span className="text-gray-400">👥</span>
          <span className="text-gray-500">Добавить в группу или канал</span>
        </button>
        <p className="text-xs text-gray-400 mt-2 px-9">
          Этот бот может управлять группой или каналом.
        </p>
      </div>
    </div>
  );
}
