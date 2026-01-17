interface ChatListItemProps {
  botName: string;
  shortDescription: string;
  avatar?: string;
  focusedField?: string | null;
}

// Получить первую букву (пропуская эмодзи)
const getInitial = (name: string) => {
  const match = name.match(/[a-zA-Zа-яА-ЯёЁ]/);
  return match ? match[0].toUpperCase() : 'B';
};

export function ChatListItem({ botName, shortDescription, avatar, focusedField }: ChatListItemProps) {
  return (
    <div className="bg-white h-full overflow-hidden">
      {/* Telegram Header - не редактируемый */}
      <div className="bg-[#5288c1] text-white px-4 py-3 flex items-center justify-between opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs">
            ☰
          </div>
          <span className="font-medium">Telegram</span>
        </div>
        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">
          🔍
          </div>
      </div>

      {/* Tabs - не редактируемые */}
      <div className="bg-[#5288c1] px-4 pb-2 flex gap-4 text-white text-sm opacity-50">
        <span className="opacity-60">Все</span>
        <span className="opacity-60">Непрочит.</span>
        <span className="border-b-2 border-white pb-1">Контакты</span>
        <span className="opacity-60">Группы</span>
      </div>

      {/* Chat List */}
      <div className="bg-white overflow-hidden">
        {/* Our Bot Item - HIGHLIGHTED */}
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-l-4 border-blue-500 bg-blue-50">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden transition-all duration-300 ${
            focusedField === 'avatar' ? 'highlight-avatar-pulse' : ''
          }`}>
            {avatar ? (
              <img src={avatar} alt={botName} className="w-full h-full object-cover" />
            ) : (
              getInitial(botName)
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 border-b border-gray-100 pb-3 overflow-hidden">
            <div className="flex items-start justify-between mb-1">
              <h3 className={`font-semibold text-gray-900 truncate flex-1 min-w-0 transition-all duration-300 ${
                focusedField === 'botName' ? 'highlight-pulse-shadow' : ''
              }`}>
                {botName || 'Имя бота'}
              </h3>
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">12:34</span>
            </div>
            <p className={`text-sm text-gray-600 truncate overflow-hidden text-ellipsis whitespace-nowrap transition-all duration-300 ${
              focusedField === 'shortDescription' ? 'highlight-pulse-shadow' : ''
            }`}>
              {shortDescription || 'Краткое описание бота...'}
            </p>
          </div>
        </div>

        {/* Other contacts (for context) */}
        <div className="flex items-center gap-3 px-4 py-3 opacity-40">
          <div className="w-14 h-14 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900">Другой чат</h3>
              <span className="text-xs text-gray-500">Вчера</span>
            </div>
            <p className="text-sm text-gray-600 truncate">Последнее сообщение...</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 opacity-40">
          <div className="w-14 h-14 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900">Групповой чат</h3>
              <span className="text-xs text-gray-500">Пн</span>
            </div>
            <p className="text-sm text-gray-600 truncate">Кто-то: Текст сообщения...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
