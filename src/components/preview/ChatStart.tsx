interface ChatStartProps {
  botName: string;
  description: string;
  avatar?: string;
  botPic?: string;
  onStartClick?: () => void;
}

export function ChatStart({ botName, description, avatar, botPic, onStartClick }: ChatStartProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#5288c1] text-white px-4 py-3 flex items-center gap-3 overflow-hidden">
        <button className="text-xl opacity-40">←</button>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={botName} className="w-full h-full object-cover" />
          ) : (
            botName.charAt(0).toUpperCase() || 'B'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{botName || 'Имя бота'}</h3>
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
        {/* Description Picture (приветственная картинка) */}
        {botPic && (
          <div className="max-w-sm mx-auto mb-4">
            <div className="relative rounded-xl overflow-hidden shadow-sm" style={{ aspectRatio: '16 / 9' }}>
              <img
                src={botPic}
                alt="Description Picture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 max-w-sm mx-auto mb-4">
          {/* Profile Photo - скрываем если есть Description Picture */}
          {!botPic && (
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={botName} className="w-full h-full object-cover" />
                ) : (
                  botName.charAt(0).toUpperCase() || 'B'
                )}
              </div>
            </div>
          )}

          {/* "Что умеет этот бот?" */}
          <h3 className="text-center font-semibold text-gray-900 mb-3">
            Что умеет этот бот?
          </h3>

          {/* Description */}
          <div className="text-sm text-gray-700 whitespace-pre-wrap break-words mb-4">
            {description || 'Здравствуйте! Я ваш цифровой помощник...'}
          </div>
        </div>

        {/* START button */}
        <div className="flex justify-center">
          <button
            onClick={onStartClick}
            className="bg-[#5288c1] text-white px-12 py-3 rounded-full font-medium shadow-lg hover:bg-[#4a7db0] transition-colors cursor-pointer active:scale-95"
          >
            START
          </button>
        </div>
      </div>
    </div>
  );
}
