import { useState } from 'react';

interface BotProfileProps {
  botName: string;
  about: string;
  privacyPolicyUrl?: string;
  avatar?: string;
}

export function BotProfile({ botName, about, privacyPolicyUrl, avatar }: BotProfileProps) {
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
          <span className="font-medium">Photo</span>
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
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      {/* Header with back button */}
      <div className="bg-[#5288c1] text-white px-4 py-3 flex items-center gap-3">
        <button className="text-xl">←</button>
        <span className="font-medium">Info</span>
        <div className="ml-auto flex gap-3">
          <button className="text-lg">✎</button>
          <button className="text-lg">⋮</button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-[#5288c1] px-4 pb-6 pt-4 text-center">
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
        <h2 className="text-white text-xl font-semibold mb-1">
          {botName || 'Bot Name'}
        </h2>
        <p className="text-white/80 text-sm">bot</p>
      </div>

      {/* Action Buttons */}
      <div className="flex border-b border-gray-200">
        <button className="flex-1 py-4 flex flex-col items-center gap-1 hover:bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            💬
          </div>
          <span className="text-xs text-gray-700">Message</span>
        </button>
        <button className="flex-1 py-4 flex flex-col items-center gap-1 hover:bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            🔕
          </div>
          <span className="text-xs text-gray-700">Unmute</span>
        </button>
        <button className="flex-1 py-4 flex flex-col items-center gap-1 hover:bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            ↗
          </div>
          <span className="text-xs text-gray-700">Share</span>
        </button>
        <button className="flex-1 py-4 flex flex-col items-center gap-1 hover:bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            ⊝
          </div>
          <span className="text-xs text-gray-700">Stop</span>
        </button>
      </div>

      {/* About Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-gray-900 whitespace-pre-wrap break-words">
          {about || 'Текст "О боте" отображается здесь. Максимум 120 символов.'}
        </p>
        <p className="text-xs text-gray-500 mt-1">About</p>
      </div>

      {/* Username */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <p className="text-gray-900">@{botName?.toLowerCase().replace(/\s+/g, '_') || 'botname'}</p>
          <p className="text-xs text-gray-500 mt-1">Username</p>
        </div>
        <button className="w-6 h-6 flex items-center justify-center">
          <span className="text-blue-500">⋮⋮</span>
        </button>
      </div>

      {/* Privacy Policy */}
      {privacyPolicyUrl && (
        <div className="px-4 py-3 border-b border-gray-200">
          <a
            href={privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Privacy Policy
          </a>
        </div>
      )}

      {/* Additional Info */}
      <div className="px-4 py-3">
        <button className="w-full text-left py-2 flex items-center gap-3 hover:bg-gray-50">
          <span className="text-gray-600">👥</span>
          <span className="text-gray-900">Add to Group or Channel</span>
        </button>
        <p className="text-xs text-gray-500 mt-2 px-9">
          This bot is able to manage a group or channel.
        </p>
      </div>
    </div>
  );
}
