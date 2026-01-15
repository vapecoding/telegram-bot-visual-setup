interface ChatListItemProps {
  botName: string;
  shortDescription: string;
  avatar?: string;
}

export function ChatListItem({ botName, shortDescription, avatar }: ChatListItemProps) {
  return (
    <div className="bg-white">
      {/* Telegram Header */}
      <div className="bg-[#5288c1] text-white px-4 py-3 flex items-center justify-between">
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

      {/* Tabs */}
      <div className="bg-[#5288c1] px-4 pb-2 flex gap-4 text-white text-sm">
        <span className="opacity-60">All</span>
        <span className="opacity-60">Unread</span>
        <span className="border-b-2 border-white pb-1">Contacts</span>
        <span className="opacity-60">Groups</span>
      </div>

      {/* Chat List */}
      <div className="bg-white overflow-hidden">
        {/* Our Bot Item - HIGHLIGHTED */}
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-l-4 border-blue-500 bg-blue-50">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={botName} className="w-full h-full object-cover" />
            ) : (
              botName.charAt(0).toUpperCase() || 'B'
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 border-b border-gray-100 pb-3 overflow-hidden">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate flex-1 min-w-0">
                {botName || 'Bot Name'}
              </h3>
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">12:34</span>
            </div>
            <p className="text-sm text-gray-600 truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {shortDescription || 'Short description appears here...'}
            </p>
          </div>
        </div>

        {/* Other contacts (for context) */}
        <div className="flex items-center gap-3 px-4 py-3 opacity-40">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900">Another Chat</h3>
              <span className="text-xs text-gray-500">Yesterday</span>
            </div>
            <p className="text-sm text-gray-600 truncate">Last message preview...</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 opacity-40">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900">Group Chat</h3>
              <span className="text-xs text-gray-500">Monday</span>
            </div>
            <p className="text-sm text-gray-600 truncate">Someone: Message text...</p>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
        <p className="text-xs text-gray-700">
          ℹ️ Short Description отображается как превью последнего сообщения в списке контактов
        </p>
      </div>
    </div>
  );
}
